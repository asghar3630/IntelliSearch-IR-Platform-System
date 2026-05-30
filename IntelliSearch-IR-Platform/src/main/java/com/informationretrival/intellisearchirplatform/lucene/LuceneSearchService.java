package com.informationretrival.intellisearchirplatform.lucene;

import com.informationretrival.intellisearchirplatform.exception.SearchException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.similarities.BM25Similarity;
import org.apache.lucene.store.Directory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.informationretrival.intellisearchirplatform.lucene.LuceneFields.*;

/**
 * Executes full-text searches against the Lucene index using BM25Similarity.
 *
 * <h3>Ranking Algorithm — BM25</h3>
 * BM25 (Best Match 25) is a probabilistic ranking function that scores documents
 * based on term frequency saturation (k1) and field length normalisation (b).
 * It outperforms classical TF-IDF for longer documents and is the default
 * similarity in Lucene 9.x and modern Elasticsearch.
 *
 * <h3>Field Boosting</h3>
 * Title matches are boosted 4×, abstract 2.5×, summary 1.5×, authors 1.2×,
 * and extracted PDF content 1× (baseline).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LuceneSearchService {

    private static final String[] SEARCH_FIELDS = {
            TITLE, ABSTRACT_TEXT, SUMMARY, AUTHORS, CONTENT
    };

    private static final Map<String, Float> FIELD_BOOSTS = Map.of(
            TITLE,         BOOST_TITLE,
            ABSTRACT_TEXT, BOOST_ABSTRACT_TEXT,
            SUMMARY,       BOOST_SUMMARY,
            AUTHORS,       BOOST_AUTHORS,
            CONTENT,       BOOST_CONTENT
    );

    private final Directory luceneDirectory;
    private final StandardAnalyzer luceneAnalyzer;

    /**
     * Executes a paginated full-text search.
     *
     * @param queryStr raw query string from the user (supports phrases, fuzzy ~, AND/OR/NOT)
     * @param page     zero-based page index
     * @param size     number of results per page
     * @return list of {@link LuceneHit} for the requested page, plus total hit count
     */
    public SearchResult search(String queryStr, int page, int size) {
        if (!isIndexReady()) {
            log.warn("Lucene index not ready — returning empty result");
            return new SearchResult(0L, List.of());
        }

        try (DirectoryReader reader = DirectoryReader.open(luceneDirectory)) {
            IndexSearcher searcher = new IndexSearcher(reader);
            searcher.setSimilarity(new BM25Similarity());

            Query query = buildQuery(queryStr);
            log.debug("Executing Lucene query: {}", query);

            // Exact total hit count — slightly more expensive but necessary for pagination
            int totalCount = searcher.count(query);
            if (totalCount == 0) {
                return new SearchResult(0L, List.of());
            }

            int start = page * size;
            if (start >= totalCount) {
                return new SearchResult(totalCount, List.of());
            }

            // Fetch enough docs to cover up to the end of the requested page
            int numToFetch = Math.min(start + size, totalCount);
            TopDocs topDocs = searcher.search(query, numToFetch);

            int end = Math.min(start + size, topDocs.scoreDocs.length);
            List<LuceneHit> hits = new ArrayList<>(end - start);

            for (int i = start; i < end; i++) {
                ScoreDoc scoreDoc = topDocs.scoreDocs[i];
                Document doc = searcher.storedFields().document(scoreDoc.doc);
                hits.add(toHit(doc, scoreDoc.score));
            }

            log.debug("Lucene search '{}' → {} total hits, returning [{}-{})",
                    queryStr, totalCount, start, end);
            return new SearchResult(totalCount, hits);

        } catch (ParseException e) {
            log.warn("Invalid query syntax [{}]: {}", queryStr, e.getMessage());
            throw new SearchException("Invalid query syntax: " + e.getMessage(), e);
        } catch (IOException e) {
            log.error("Lucene I/O error during search: {}", e.getMessage(), e);
            throw new SearchException("Search engine error — please try again", e);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Query buildQuery(String queryStr) throws ParseException {
        MultiFieldQueryParser parser = new MultiFieldQueryParser(
                SEARCH_FIELDS, luceneAnalyzer, FIELD_BOOSTS
        );
        parser.setDefaultOperator(QueryParser.Operator.OR);
        parser.setAllowLeadingWildcard(false);
        // Escape special chars except ~, *, ?, " so users can write natural phrases
        return parser.parse(queryStr);
    }

    private boolean isIndexReady() {
        try {
            return DirectoryReader.indexExists(luceneDirectory);
        } catch (IOException e) {
            return false;
        }
    }

    private LuceneHit toHit(Document doc, float score) {
        int year = 0;
        var yearField = doc.getField(PUBLISHED_YEAR);
        if (yearField != null && yearField.numericValue() != null) {
            year = yearField.numericValue().intValue();
        }
        return new LuceneHit(
                doc.get(DOCUMENT_ID),
                doc.get(TITLE),
                doc.get(AUTHORS),
                year == 0 ? null : year,
                doc.get(SUMMARY),
                doc.get(DOCUMENT_LINK),
                doc.get(LOCAL_FILE_PATH),
                score
        );
    }

    /**
     * Value object carrying search results back to the service layer.
     */
    public record SearchResult(long totalCount, List<LuceneHit> hits) {}
}
