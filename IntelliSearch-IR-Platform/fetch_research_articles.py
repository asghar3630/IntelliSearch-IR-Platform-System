"""
Fetch research article metadata from PostgreSQL.

Connects to the IntelliSearch database and retrieves all rows from
documents.research_articles_meta, appending a constructed filePathName
to each result dictionary.
"""

import sys
import psycopg2
import psycopg2.extras

# ── Configuration ──────────────────────────────────────────────────────────────
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "IntelliSearch"
DB_USER = "postgres"
DB_PASSWORD = "your_password_here"  # TODO: Replace with your PostgreSQL password
DB_SCHEMA = "documents"
DB_TABLE = "research_articles_meta"

# TODO: Change this to the absolute path where your article PDFs are stored.
ARTICLE_FOLDER_LOCATION = "C:/path/to/your/Research-Articles/"
# ───────────────────────────────────────────────────────────────────────────────


def get_connection():
    """Create and return a new psycopg2 connection."""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


def fetch_all_articles() -> list[dict]:
    """
    Query documents.research_articles_meta and return every row as a dict.

    Each dict contains all table columns plus a constructed 'filePathName'
    built from ARTICLE_FOLDER_LOCATION + "documentFileName".
    """
    query = f"""
        SELECT
            "documentID",
            "documentTitle",
            "documentAuthor",
            "documentPublishingVenue",
            "documentPublishingYear",
            "documentLink",
            "documentKeywords",
            "researchArea",
            "documentSummary",
            "documentAbstract",
            "documentFileName"
        FROM {DB_SCHEMA}.{DB_TABLE}
        ORDER BY "documentID";
    """

    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            rows = cur.fetchall()

        articles = []
        for row in rows:
            article = dict(row)
            article["filePathName"] = (
                ARTICLE_FOLDER_LOCATION + article["documentFileName"]
            )
            articles.append(article)

        print(f"[OK] Fetched {len(articles)} article(s) from {DB_SCHEMA}.{DB_TABLE}")
        return articles

    except psycopg2.OperationalError as e:
        print(f"[ERROR] Database connection failed: {e}", file=sys.stderr)
        raise
    except psycopg2.Error as e:
        print(f"[ERROR] Query failed: {e}", file=sys.stderr)
        raise
    finally:
        if conn is not None:
            conn.close()


def test_connection() -> bool:
    """Verify that we can connect to the database and the target table exists."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            # Check the table is reachable
            cur.execute(
                f"""
                SELECT COUNT(*) FROM {DB_SCHEMA}.{DB_TABLE};
                """
            )
            count = cur.fetchone()[0]
        print(f"[OK] Connection successful — {DB_SCHEMA}.{DB_TABLE} has {count} row(s)")
        return True
    except psycopg2.OperationalError as e:
        print(f"[FAIL] Cannot connect to database: {e}", file=sys.stderr)
        return False
    except psycopg2.Error as e:
        print(f"[FAIL] Table check failed: {e}", file=sys.stderr)
        return False
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    print("=" * 70)
    print("  IntelliSearch — Research Articles Metadata Fetcher")
    print("=" * 70)

    # Step 1: test connectivity
    print("\n--- Connection Test ---")
    if not test_connection():
        sys.exit(1)

    # Step 2: fetch and display all articles
    print("\n--- Fetching Articles ---")
    articles = fetch_all_articles()

    print("\n--- Results ---")
    for article in articles:
        print("-" * 60)
        for key, value in article.items():
            # Truncate long fields for readability
            display = str(value)
            if len(display) > 120:
                display = display[:117] + "..."
            print(f"  {key:30s} : {display}")
    print("-" * 60)
    print(f"\nTotal articles: {len(articles)}")
