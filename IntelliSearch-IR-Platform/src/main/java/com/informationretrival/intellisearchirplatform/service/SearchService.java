package com.informationretrival.intellisearchirplatform.service;

import com.informationretrival.intellisearchirplatform.dto.DocumentResult;
import com.informationretrival.intellisearchirplatform.dto.SearchRequest;
import com.informationretrival.intellisearchirplatform.dto.SearchResponse;
import com.informationretrival.intellisearchirplatform.lucene.LuceneHit;
import com.informationretrival.intellisearchirplatform.lucene.LuceneSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Coordinates search requests: delegates to Lucene, converts hits into API DTOs.
 * <p>All display data (title, authors, summary, etc.) is served directly from
 * Lucene stored fields — no secondary database round-trip is required per search.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final LuceneSearchService luceneSearchService;

    public SearchResponse search(SearchRequest request) {
        log.debug("Search request — query='{}', page={}, size={}",
                request.getQuery(), request.getPage(), request.getSize());

        LuceneSearchService.SearchResult result =
                luceneSearchService.search(request.getQuery(), request.getPage(), request.getSize());

        List<DocumentResult> documents = result.hits().stream()
                .map(this::toDocumentResult)
                .toList();

        int totalPages = request.getSize() > 0
                ? (int) Math.ceil((double) result.totalCount() / request.getSize())
                : 0;

        return SearchResponse.builder()
                .query(request.getQuery())
                .page(request.getPage())
                .size(request.getSize())
                .totalCount(result.totalCount())
                .totalPages(totalPages)
                .documents(documents)
                .build();
    }

    private DocumentResult toDocumentResult(LuceneHit hit) {
        return DocumentResult.builder()
                .documentId(hit.documentId())
                .title(hit.title())
                .authors(hit.authors())
                .publishedYear(hit.publishedYear())
                .summary(hit.summary())
                .documentLink(hit.documentLink())
                .filePath(hit.localFilePath())
                .score(Math.round(hit.score() * 100.0f) / 100.0f) // round to 2 dp
                .build();
    }
}
