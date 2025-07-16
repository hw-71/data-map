import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Middleware
origins = [
    "http://localhost:3000",  # The origin of our frontend app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
        )
        return conn
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {e}")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/schemas/{schema_name}/tables")
def get_tables_in_schema(schema_name: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Query to get table names, estimated row counts, and total size with custom formatting
            query = """
            SELECT
                t.table_name,
                c.reltuples::bigint AS estimated_row_count,
                CASE
                    WHEN pg_total_relation_size(t.table_schema || '.' || t.table_name) >= 1024 * 1024 * 1024 THEN
                        TRIM(to_char(pg_total_relation_size(t.table_schema || '.' || t.table_name) / (1024.0 * 1024.0 * 1024.0), '999.99')) || ' GB'
                    ELSE
                        TRIM(to_char(pg_total_relation_size(t.table_schema || '.' || t.table_name) / (1024.0 * 1024.0), '999.99')) || ' MB'
                END AS total_size
            FROM
                information_schema.tables t
            JOIN
                pg_class c ON c.relname = t.table_name
            JOIN
                pg_namespace n ON n.oid = c.relnamespace
            WHERE
                t.table_schema = %s
                AND n.nspname = %s
                AND t.table_type = 'BASE TABLE'
            ORDER BY
                t.table_name;
            """
            cur.execute(query, (schema_name, schema_name))
            tables = [
                {
                    "table_name": row[0],
                    "estimated_row_count": row[1],
                    "total_size": row[2],
                }
                for row in cur.fetchall()
            ]
            return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables for schema {schema_name}: {e}")
    finally:
        conn.close()
