import os
import psycopg2
from psycopg2.sql import SQL, Identifier
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
            # Query to get table names, descriptions, row counts, and size
            query = """
            SELECT
                t.table_name,
                c.reltuples::bigint AS estimated_row_count,
                CASE
                    WHEN pg_total_relation_size(t.table_schema || '.' || t.table_name) >= 1024 * 1024 * 1024 THEN
                        TRIM(to_char(pg_total_relation_size(t.table_schema || '.' || t.table_name) / (1024.0 * 1024.0 * 1024.0), '999.99')) || ' GB'
                    ELSE
                        TRIM(to_char(pg_total_relation_size(t.table_schema || '.' || t.table_name) / (1024.0 * 1024.0), '999.99')) || ' MB'
                END AS total_size,
                d.description
            FROM
                information_schema.tables t
            JOIN
                pg_class c ON c.relname = t.table_name
            JOIN
                pg_namespace n ON n.oid = c.relnamespace
            LEFT JOIN
                pg_catalog.pg_description d ON d.objoid = c.oid AND d.objsubid = 0
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
                    "description": row[3],
                }
                for row in cur.fetchall()
            ]
            return {"tables": tables}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching tables for schema {schema_name}: {e}",
        )
    finally:
        conn.close()


@app.get("/api/schemas/{schema_name}/tables/{table_name}")
def get_table_details(schema_name: str, table_name: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            query = """
            SELECT
                d.description
            FROM
                information_schema.tables t
            JOIN
                pg_class c ON c.relname = t.table_name
            JOIN
                pg_namespace n ON n.oid = c.relnamespace
            LEFT JOIN
                pg_catalog.pg_description d ON d.objoid = c.oid AND d.objsubid = 0
            WHERE
                t.table_schema = %s
                AND n.nspname = %s
                AND t.table_name = %s
                AND t.table_type = 'BASE TABLE';
            """
            cur.execute(query, (schema_name, schema_name, table_name))
            description = cur.fetchone()
            if description:
                return {"description": description[0]}
            else:
                return {"description": None}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching details for table {table_name}: {e}",
        )
    finally:
        conn.close()


@app.get("/api/schemas/{schema_name}/tables/{table_name}/columns")
def get_table_columns(schema_name: str, table_name: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # First, get the column names and data types
            query = """
            SELECT
                c.column_name,
                c.data_type,
                d.description
            FROM
                information_schema.columns c
            LEFT JOIN
                pg_catalog.pg_description d ON d.objoid = (
                    SELECT pc.oid
                    FROM pg_catalog.pg_class pc
                    JOIN pg_catalog.pg_namespace pn ON pn.oid = pc.relnamespace
                    WHERE pn.nspname = c.table_schema AND pc.relname = c.table_name
                ) AND d.objsubid = c.ordinal_position
            WHERE
                c.table_schema = %s
                AND c.table_name = %s
            ORDER BY
                c.ordinal_position;
            """
            cur.execute(query, (schema_name, table_name))
            columns_metadata = cur.fetchall()

            columns_data = []
            for col_name, col_type, col_description in columns_metadata:
                # For each column, fetch 1 sample data point
                # Using psycopg2.sql to safely quote identifiers
                sample_query = SQL("SELECT {} FROM {}.{} WHERE {} IS NOT NULL LIMIT 1").format(
                    Identifier(col_name),
                    Identifier(schema_name),
                    Identifier(table_name),
                    Identifier(col_name)
                )
                cur.execute(sample_query)
                samples = [row[0] for row in cur.fetchall()]
                
                columns_data.append({
                    "column_name": col_name,
                    "data_type": col_type,
                    "description": col_description,
                    "sample_data": samples,
                })

            return {"columns": columns_data}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching columns for table {table_name}: {e}",
        )
    finally:
        conn.close()
