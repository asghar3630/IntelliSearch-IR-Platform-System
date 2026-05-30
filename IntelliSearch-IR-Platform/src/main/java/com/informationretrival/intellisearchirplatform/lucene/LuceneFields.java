package com.informationretrival.intellisearchirplatform.lucene;

/**
 * Canonical Lucene field name constants shared by the indexer and searcher.
 * Stored fields (YES) are returned in search hits; indexed-only fields (NO) drive relevance only.
 */
public final class LuceneFields {

    private LuceneFields() {}

    // Stored + indexed (exact, not analysed)
    public static final String DOCUMENT_ID    = "documentId";

    // Stored + full-text indexed
    public static final String TITLE          = "title";
    public static final String AUTHORS        = "authors";
    public static final String SUMMARY        = "summary";
    public static final String DOCUMENT_LINK  = "documentLink";

    // Stored only (no full-text search needed)
    public static final String PUBLISHED_YEAR  = "publishedYear";
    public static final String LOCAL_FILE_PATH = "localFilePath";

    // Full-text indexed only (not stored — reduces index size)
    public static final String ABSTRACT_TEXT  = "abstractText";
    public static final String CONTENT        = "content";

    // Field boost weights used in MultiFieldQueryParser
    public static final float BOOST_TITLE         = 4.0f;
    public static final float BOOST_ABSTRACT_TEXT = 2.5f;
    public static final float BOOST_SUMMARY       = 1.5f;
    public static final float BOOST_AUTHORS       = 1.2f;
    public static final float BOOST_CONTENT       = 1.0f;
}
