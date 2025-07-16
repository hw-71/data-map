# Overview

### Context</br>

We're going to build a data map website that visualizes the up-to-date state of a corporate data warehouse. I'm a
data engineer who mostly uses Python, PostgreSQL, Airflow, and AWS. I also have software engineering experience, and
I'm familiar with web-related technologies including React, Next.js, and TypeScript. The data warehouse is a
PostgreSQL DB on AWS RDS.

### Purpose</br>

The website is going to be the single source of truth for the current state of data we have at my company. We do have
a wide variety of data, of which I'm in charge of managing. Unfortunately, most of the employees know what kind of
data or how much of data we have, as only a few employees have access to the DB for security purposes. So this
website is going to be the representation of the DB, but better in readability and easier to understand, even for those
who are not familiar with technology or data.

### Cautions
- authentication: As the website is going to show the kinds of data we have, only authenticated users should be
  allowed to access. 

# Plan

## 1. Technology Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Python with FastAPI
- **Authentication**: Secure authentication system
- **Database**: PostgreSQL on AWS RDS

## 2. Data to be Shown
- **Structural Information**: Schemas, tables, columns (name, data type, description)
- **Usage and Health Metrics**: Row counts, table size, last updated time
- **Relational Information**: Table relationships

## 3. How to Get Data
- **Backend API**: A backend API will connect to the PostgreSQL data warehouse in a read-only capacity.
- **Fetching Structural Metadata**: Use `information_schema` to get schema, table, and column information.
- **Fetching Usage and Health Metrics**: Use `pg_class` and `pg_total_relation_size()` for row counts and table size. A separate metadata table will be created to track the last updated time.

## 4. Deployment/
- **Development**: The backend will be run locally, connecting to the DB via QueryPie.
- **Production**: The backend will be containerized with Docker and deployed to AWS EKS.

# Progress

- **Project Setup**: Created a monorepo with a Next.js frontend and a FastAPI backend.
- **Database Connection**: The backend successfully connects to the PostgreSQL database.
- **Core Feature**: Implemented a page that displays tables from the `out_gov` schema, including their estimated row counts and formatted table sizes (MB/GB).
- **UX Improvements**:
  - Separated tables with zero (potentially stale) row counts for easy review.
  - Added a Korean explanation for the zero-row-count phenomenon.

# Next Steps

- **Table Details Page**: Create a new page that shows the columns and other details for a specific table when a user clicks on it.
- **Implement Authentication**: Add a secure login system to protect the website.
- **Visualize Table Relationships**: Begin creating the interactive data map to show how tables are connected.

# Instructions
- When I ask questions, always explain in plain words first. Do not dump code implementation straight away if not asked.
- Ask questions if you feel like you don't have enough information to move.