# IntelliSearch IR Platform — Backend

Academic research paper information retrieval engine built with Spring Boot 3, Apache Lucene 9 (BM25), and PostgreSQL.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21 |
| Maven | 3.9+ |
| PostgreSQL | 14+ |

---

## Quick Start

### 1. Create the PostgreSQL database

```sql
CREATE DATABASE "IntelliSearch";
CREATE SCHEMA documents;
```

Run the SQL migration scripts in `src/main/resources/db/migration/` to create the required tables and insert sample data.

### 2. Configure credentials

Set environment variables (recommended):

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
```

Or edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/IntelliSearch
    username: postgres
    password: yourpassword
```

### 3. Configure PDF storage path

Set the environment variable pointing to the folder containing your research article PDFs:

```bash
export PDF_STORAGE_DIR="/path/to/your/Research-Articles"
```

Or update `app.pdf.storage-dir` in `application.yml`.

### 4. Build and run

```bash
./mvnw clean package -DskipTests
./mvnw spring-boot:run
```

The application starts on `http://localhost:8080`.

---

## Indexing Flow

```
Application starts
       |
       v
StartupIndexInitializer.run()
       |
       +-- ArticleMetaRepository.findAll()
       |         +-- Loads all rows from PostgreSQL research_articles_meta
       |
       +-- PdfTextExtractor.extract(localFilePath)
       |         +-- Apache PDFBox reads each PDF and returns plain text
       |
       +-- LuceneIndexService.rebuildIndex(articles, contentMap)
                 +-- Opens FSDirectory at ./lucene-index
                 +-- IndexWriterConfig with BM25Similarity + OpenMode.CREATE
                 +-- For each article -> builds Lucene Document:
                 |     TITLE        (stored + indexed, boost 4x)
                 |     ABSTRACT     (indexed only, boost 2.5x)
                 |     SUMMARY      (stored + indexed, boost 1.5x)
                 |     AUTHORS      (stored + indexed, boost 1.2x)
                 |     CONTENT      (indexed only, boost 1x)
                 |     DOCUMENT_ID  (stored, exact match)
                 |     DOCUMENT_LINK (stored)
                 |     PUBLISHED_YEAR (stored)
                 +-- writer.commit()
                 +-- Index ready for queries
```

---

## Search Flow

```
POST /api/search
       |
       v
SearchController.search(@Valid SearchRequest)
       |
       v
SearchService.search(request)
       |
       v
LuceneSearchService.search(query, page, size)
       +-- DirectoryReader.open(FSDirectory)
       +-- IndexSearcher + BM25Similarity
       +-- MultiFieldQueryParser(fields, analyzer, boosts)
       |         Supports: keywords, "phrase queries", fuzzy~, AND/OR/NOT
       +-- searcher.count(query)  -> exact totalCount
       +-- searcher.search(query, start+size)  -> TopDocs
       +-- Slice scoreDocs[start..end]
       +-- storedFields().document(docId)  -> LuceneHit
               |
               v
SearchService.toDocumentResult(hit)
               |
               v
SearchResponse { query, page, size, totalCount, totalPages, documents[] }
```

---

## BM25 Ranking Algorithm

BM25 (Best Match 25) scores a document `d` for query `q` as:

```
score(d, q) = SUM IDF(t) * [ tf(t,d) * (k1 + 1) ]
                            -------------------------
                            [ tf(t,d) + k1 * (1 - b + b * |d|/avgdl) ]
```

- **IDF(t)**: inverse document frequency — rare terms score higher
- **tf(t,d)**: term frequency in the document
- **k1 = 1.2**: controls term frequency saturation
- **b = 0.75**: controls field length normalisation
- **|d|**: document length; **avgdl**: average document length

**Field boosts** multiply the score contribution of each field:

| Field | Boost |
|-------|-------|
| title | 4.0x |
| abstract_text | 2.5x |
| summary | 1.5x |
| authors | 1.2x |
| content (PDF) | 1.0x |

---

## API Reference

### POST /api/search

**Request:**
```json
{
  "query": "deep learning",
  "page": 0,
  "size": 10
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| query | string | yes | non-blank |
| page | integer | no (default 0) | >= 0 |
| size | integer | no (default 10) | 1-100 |

**Response:**
```json
{
  "query": "deep learning",
  "page": 0,
  "size": 10,
  "totalCount": 3,
  "totalPages": 1,
  "documents": [
    {
      "documentId": "1",
      "title": "Deep Learning for Natural Language Processing: A Survey",
      "authors": "John Smith, Maria Garcia",
      "publishedYear": 2023,
      "summary": "Comprehensive survey of deep learning techniques...",
      "documentLink": "https://arxiv.org/abs/2301.00001",
      "score": 9.81
    }
  ]
}
```

**Error (400 — blank query):**
```json
{
  "title": "Validation Failed",
  "detail": "One or more fields are invalid",
  "fieldErrors": {
    "query": "Query must not be blank"
  }
}
```

---

## curl Examples

```bash
# Basic keyword search
curl -s -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"deep learning","page":0,"size":10}' | jq .

# Phrase search
curl -s -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"\"federated learning\"","page":0,"size":5}' | jq .

# Fuzzy search (handles typos)
curl -s -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"neurall network~","page":0,"size":10}' | jq .

# Boolean AND
curl -s -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"transformer AND healthcare","page":0,"size":10}' | jq .

# Page 2 of results (page index is 0-based)
curl -s -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"machine learning","page":1,"size":3}' | jq .
```

---

## Project Structure

```
src/main/java/com/informationretrival/intellisearchirplatform/
+-- IntelliSearchIrPlatformApplication.java   Entry point
+-- config/
|   +-- AppProperties.java                    @ConfigurationProperties
|   +-- LuceneConfig.java                     FSDirectory + Analyzer beans
|   +-- CorsConfig.java                       CORS configuration
+-- controller/
|   +-- SearchController.java                 POST /api/search
|   +-- DocumentController.java               Document retrieval endpoints
+-- dto/
|   +-- SearchRequest.java                    Request body with validation
|   +-- SearchResponse.java                   Response envelope
|   +-- DocumentResult.java                   Per-document result
|   +-- DocumentContentResponse.java          Base64 document content
|   +-- DocumentUploadRequest.java            Upload request wrapper
|   +-- DocumentUploadItem.java               Single upload item
|   +-- DocumentUploadResponse.java           Upload result summary
+-- entity/
|   +-- ArticleMeta.java                      JPA entity -> research_articles_meta
|   +-- ArticleDocument.java                  JPA entity -> research_articles_docuements
+-- exception/
|   +-- SearchException.java
|   +-- IndexingException.java
|   +-- GlobalExceptionHandler.java           RFC 9457 ProblemDetail responses
+-- indexing/
|   +-- StartupIndexInitializer.java          ApplicationRunner — index on startup
+-- lucene/
|   +-- LuceneFields.java                     Field name + boost constants
|   +-- LuceneHit.java                        Record — hit from Lucene
|   +-- LuceneIndexService.java               Write path (rebuild / update)
|   +-- LuceneSearchService.java              Read path (BM25 + pagination)
+-- repository/
|   +-- ArticleMetaRepository.java            Spring Data JPA
|   +-- ArticleDocumentRepository.java        Document binary repository
+-- service/
|   +-- SearchService.java                    Coordinates search + DTO mapping
|   +-- DocumentService.java                  DB + incremental indexing
|   +-- DocumentUploadService.java            Handles document uploads
+-- util/
    +-- PdfTextExtractor.java                 PDFBox 3.x text extraction

src/main/resources/
+-- application.yml
+-- db/migration/
    +-- V1__create_article_meta.sql
    +-- V2__insert_sample_data.sql
```

---

## Adding Your Own PDFs

1. Place PDFs in the folder configured via `PDF_STORAGE_DIR`
2. Insert a row into `documents.research_articles_meta` with the matching `documentFileName`
3. Restart the application — `StartupIndexInitializer` rebuilds the index automatically

Or save via `DocumentService.save(meta)` to index incrementally without restart.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` on startup | PostgreSQL not running, or wrong port/credentials in `application.yml` |
| `Index not ready` in logs | DB is empty — insert rows into `research_articles_meta` |
| PDF text not extracted | Check `documentFileName` values in DB match actual file names in `PDF_STORAGE_DIR` |
| `Validation Failed` on search | Query string is blank or `size` > 100 |
| Port 8080 already in use | Change `server.port` in `application.yml` |
