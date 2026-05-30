# IntelliSearch IR Platform System

A full stack academic research paper search engine powered by **Apache Lucene (BM25)**, **Spring Boot**, **React**, and **PostgreSQL**. Users can search across a corpus of research articles by keywords, phrases, or boolean queries and view results ranked by relevance.

---

## Architecture

```
+---------------------+        +-------------------------+        +----------------+
|                     |  POST  |                         |        |                |
|   React Frontend    | -----> |   Spring Boot Backend   | -----> |  PostgreSQL    |
|   (Vite + TS)       |        |   (Lucene + JPA)        |        |  (metadata)    |
|   localhost:5173     |        |   localhost:8080         |        |  port 5432     |
|                     | <----- |                         |        |                |
+---------------------+  JSON  +-------------------------+        +----------------+
                                        |
                                        v
                                +----------------+
                                | Research-       |
                                | Articles/       |
                                | (PDF files)     |
                                +----------------+
```

| Component | Directory | Tech Stack |
|-----------|-----------|------------|
| Backend | `IntelliSearch-IR-Platform/` | Java 21, Spring Boot 3.3, Lucene 9.10, PDFBox 3.0, PostgreSQL |
| Frontend | `IntelliSearch/` | React 19, TypeScript, Vite, Tailwind CSS 4, React Query |
| Articles | `Research-Articles/` | 100+ research paper PDFs |

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 21+ | https://adoptium.net/ |
| Maven | 3.9+ | https://maven.apache.org/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 14+ | https://www.postgresql.org/ |

---

## Setup Guide

### Step 1: Set Up the Database

1. Start your PostgreSQL server.

2. Create the database and schema:

```sql
CREATE DATABASE "IntelliSearch";

-- Connect to IntelliSearch, then:
CREATE SCHEMA documents;
```

3. Run the migration scripts to create tables and insert sample article metadata:

```sql
-- Run these in order from:
-- IntelliSearch-IR-Platform/src/main/resources/db/migration/
-- V1__create_article_meta.sql   (creates the tables)
-- V2__insert_sample_data.sql    (not actual file name — check directory for latest)
```

### Step 2: Configure the Backend

There are two ways to provide database credentials:

**Option A: Environment variables (recommended)**

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=your_database_password
export PDF_STORAGE_DIR="/absolute/path/to/Research-Articles"
```

**Option B: Edit `application.yml` directly**

Open `IntelliSearch-IR-Platform/src/main/resources/application.yml` and update:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/IntelliSearch
    username: postgres          # <-- your DB username
    password: your_password     # <-- your DB password

app:
  pdf:
    storage-dir: /absolute/path/to/Research-Articles   # <-- path to your PDF folder
```

> **Important:** The `storage-dir` must be the absolute path to the folder containing
> your research article PDF files (the `Research-Articles/` directory in this repo).

### Step 3: Place Research Article PDFs

The `Research-Articles/` folder contains the PDF files that get indexed. Each PDF filename
must match the `documentFileName` column in the `documents.research_articles_meta` database
table.

If you are starting fresh, you can:
- Add your own PDFs to the `Research-Articles/` folder
- Insert corresponding metadata rows into the `documents.research_articles_meta` table

### Step 4: Start the Backend

```bash
cd IntelliSearch-IR-Platform

# Build
./mvnw clean package -DskipTests

# Run
./mvnw spring-boot:run
```

On startup, the backend will:
1. Connect to PostgreSQL and load all article metadata
2. Read each PDF from `PDF_STORAGE_DIR` and extract text via PDFBox
3. Build a Lucene full-text index at `./lucene-index/`
4. Start the REST API on `http://localhost:8080`

### Step 5: Start the Frontend

```bash
cd IntelliSearch

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs at `http://localhost:5173` and connects to the backend at the URL
defined in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

### Step 6: Search

Open `http://localhost:5173` in your browser. Type a query and press Enter or click Search.

**Supported query syntax:**
- Keywords: `deep learning`
- Phrase: `"neural network"`
- Fuzzy: `reccomendation~` (handles typos)
- Boolean: `transformer AND healthcare`
- Exclusion: `machine learning NOT supervised`

---

## Configuration Reference

### Backend (`application.yml`)

| Property | Env Variable | Default | Description |
|----------|-------------|---------|-------------|
| `spring.datasource.username` | `DB_USERNAME` | `postgres` | PostgreSQL username |
| `spring.datasource.password` | `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `spring.datasource.url` | — | `jdbc:postgresql://localhost:5432/IntelliSearch` | JDBC connection URL |
| `app.lucene.index-dir` | `LUCENE_INDEX_DIR` | `./lucene-index` | Where Lucene stores its index |
| `app.pdf.storage-dir` | `PDF_STORAGE_DIR` | *(must be set)* | Absolute path to the PDF folder |
| `server.port` | — | `8080` | Backend HTTP port |

### Frontend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

---

## Database Schema

The application uses a PostgreSQL database named `IntelliSearch` with a `documents` schema.

### `documents.research_articles_meta`

| Column | Type | Description |
|--------|------|-------------|
| `documentID` | INT (PK) | Unique article identifier |
| `documentTitle` | VARCHAR(255) | Article title |
| `documentAuthor` | VARCHAR(255) | Author(s) |
| `documentPublishingVenue` | VARCHAR(255) | Journal / conference |
| `documentPublishingYear` | SMALLINT | Publication year |
| `documentLink` | VARCHAR(255) | External URL |
| `documentKeywords` | VARCHAR(255) | Comma-separated keywords |
| `researchArea` | VARCHAR(100) | Research domain |
| `documentSummary` | TEXT | Brief summary |
| `documentAbstract` | TEXT | Full abstract |
| `documentFileName` | VARCHAR(255) | PDF filename (must match a file in `PDF_STORAGE_DIR`) |

### `documents.research_articles_docuements`

| Column | Type | Description |
|--------|------|-------------|
| `articleId` | BIGSERIAL (PK) | Auto-increment ID |
| `documentID` | BIGINT (FK) | References `research_articles_meta.documentID` |
| `document` | BYTEA | Binary PDF content |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Full-text search with pagination |
| POST | `/api/documents/upload` | Upload document PDFs (base64) |
| GET | `/api/documents/{id}/content` | Retrieve document PDF as base64 |

See `IntelliSearch-IR-Platform/README.md` for full API documentation and curl examples.

---

## Utility Scripts

### `fetch_research_articles.py`

A standalone Python script to query the database and list all indexed articles.

**Setup:**
```bash
pip install psycopg2-binary
```

**Configure** the script by editing the variables at the top:
```python
DB_PASSWORD = "your_password_here"   # <-- your PostgreSQL password
ARTICLE_FOLDER_LOCATION = "/path/to/Research-Articles/"  # <-- your PDF folder path
```

**Run:**
```bash
python IntelliSearch-IR-Platform/fetch_research_articles.py
```

---

## Project Structure

```
IntelliSearch-IR-Platform-System/
|
+-- IntelliSearch-IR-Platform/       # Spring Boot Backend
|   +-- src/main/java/               # Java source code
|   +-- src/main/resources/          # Config + SQL migrations
|   +-- pom.xml                      # Maven dependencies
|   +-- fetch_research_articles.py   # Python utility script
|   +-- README.md                    # Backend documentation
|
+-- IntelliSearch/                   # React Frontend
|   +-- src/                         # TypeScript/React source
|   +-- package.json                 # npm dependencies
|   +-- .env                         # API base URL config
|   +-- README.md                    # Frontend documentation
|
+-- Research-Articles/               # PDF research papers
|   +-- *.pdf                        # 100+ article PDFs
|
+-- README.md                        # This file
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend fails with `Connection refused` | Ensure PostgreSQL is running on port 5432 |
| `Password authentication failed` | Check `DB_USERNAME` / `DB_PASSWORD` env vars or `application.yml` |
| No search results returned | Database may be empty — run the SQL migration scripts |
| PDFs not indexed | Verify `PDF_STORAGE_DIR` points to the correct folder and filenames match the DB |
| Frontend shows network error | Ensure the backend is running on port 8080 |
| Port conflict | Change `server.port` in `application.yml` or `VITE_API_BASE_URL` in `.env` |
| CORS error in browser | The backend allows `http://localhost:5173` by default — check `CorsConfig.java` |
