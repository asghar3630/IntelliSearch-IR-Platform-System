-- ============================================================
-- V1: Create article_documents table
-- ============================================================

CREATE TABLE documents.research_articles_docuements (
articleId BIGSERIAL PRIMARY KEY,
documentID BIGINT REFERENCES documents.research_articles_meta(documentID),
document BYTEA
);