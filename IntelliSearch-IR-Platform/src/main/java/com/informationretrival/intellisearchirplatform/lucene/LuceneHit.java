package com.informationretrival.intellisearchirplatform.lucene;

/**
 * Represents a single result returned from a Lucene query,
 * carrying the stored fields and BM25 relevance score.
 */
public record LuceneHit(
        String documentId,
        String title,
        String authors,
        Integer publishedYear,
        String summary,
        String documentLink,
        String localFilePath,
        float score
) {}
