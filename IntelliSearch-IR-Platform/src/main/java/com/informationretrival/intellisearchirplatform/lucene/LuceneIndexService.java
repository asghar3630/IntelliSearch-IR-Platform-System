package com.informationretrival.intellisearchirplatform.lucene;

import com.informationretrival.intellisearchirplatform.config.AppProperties;
import com.informationretrival.intellisearchirplatform.entity.ArticleMeta;
import com.informationretrival.intellisearchirplatform.exception.IndexingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.IndexWriterConfig.OpenMode;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.similarities.BM25Similarity;
import org.apache.lucene.store.Directory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import static com.informationretrival.intellisearchirplatform.lucene.LuceneFields.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LuceneIndexService {

    private final Directory luceneDirectory;
    private final StandardAnalyzer luceneAnalyzer;
    private final AppProperties appProperties;

    public void rebuildIndex(List<ArticleMeta> articles, Map<String, String> contentMap) {
        IndexWriterConfig config = new IndexWriterConfig(luceneAnalyzer);
        config.setSimilarity(new BM25Similarity());
        config.setOpenMode(OpenMode.CREATE);

        int indexed = 0;
        int skipped = 0;

        try (IndexWriter writer = new IndexWriter(luceneDirectory, config)) {
            for (ArticleMeta meta : articles) {
                try {
                    String key = String.valueOf(meta.getDocumentId());
                    String pdfContent = contentMap.getOrDefault(key, "");
                    writer.addDocument(toDocument(meta, pdfContent));
                    indexed++;
                } catch (Exception e) {
                    log.warn("Skipping document [{}] due to indexing error: {}", meta.getDocumentId(), e.getMessage());
                    skipped++;
                }
            }
            writer.commit();
            log.info("Lucene index rebuilt — indexed: {}, skipped: {}", indexed, skipped);
        } catch (IOException e) {
            throw new IndexingException("Failed to rebuild Lucene index", e);
        }
    }

    public void indexOrUpdate(ArticleMeta meta, String pdfContent) {
        IndexWriterConfig config = new IndexWriterConfig(luceneAnalyzer);
        config.setSimilarity(new BM25Similarity());
        config.setOpenMode(OpenMode.CREATE_OR_APPEND);

        String docId = String.valueOf(meta.getDocumentId());
        try (IndexWriter writer = new IndexWriter(luceneDirectory, config)) {
            writer.updateDocument(
                    new Term(DOCUMENT_ID, docId),
                    toDocument(meta, pdfContent)
            );
            writer.commit();
            log.debug("Indexed/updated document: {}", docId);
        } catch (IOException e) {
            throw new IndexingException("Failed to index document: " + docId, e);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Document toDocument(ArticleMeta meta, String pdfContent) {
        Document doc = new Document();

        String docId = String.valueOf(meta.getDocumentId());

        // --- Stored + exact-match indexed (not analysed) ---
        doc.add(new StringField(DOCUMENT_ID, docId, Field.Store.YES));

        // --- Stored + full-text indexed (Standard analysed) ---
        doc.add(new TextField(TITLE,   safe(meta.getTitle()),   Field.Store.YES));
        doc.add(new TextField(AUTHORS, safe(meta.getAuthors()), Field.Store.YES));
        doc.add(new TextField(SUMMARY, safe(meta.getSummary()), Field.Store.YES));

        // --- Stored only (for display in results, not searched) ---
        doc.add(new StoredField(DOCUMENT_LINK,  safe(meta.getDocumentLink())));
        doc.add(new StoredField(PUBLISHED_YEAR, meta.getPublishedYear() != null ? meta.getPublishedYear().intValue() : 0));

        // Construct full file path: storageDir + documentFileName
        String filePath = "";
        if (meta.getDocumentFileName() != null && !meta.getDocumentFileName().isBlank()) {
            filePath = Paths.get(appProperties.getPdf().getStorageDir(), meta.getDocumentFileName()).toString();
        }
        doc.add(new StoredField(LOCAL_FILE_PATH, filePath));

        // --- Indexed only (reduces index size; drives relevance) ---
        doc.add(new TextField(ABSTRACT_TEXT, safe(meta.getAbstractText()), Field.Store.NO));
        doc.add(new TextField(CONTENT,       safe(pdfContent),             Field.Store.NO));

        return doc;
    }

    private static String safe(String value) {
        return value != null ? value : "";
    }
}
