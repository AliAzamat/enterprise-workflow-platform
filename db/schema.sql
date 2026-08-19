-- The enterprise SYSTEM OF RECORD. This Postgres database is the source of
-- truth for employees and documents. The gateway never invents data; it reads
-- and writes HERE through the service layer.

CREATE TABLE employees (
    id          TEXT PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    department  TEXT NOT NULL
);

CREATE TABLE documents (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    source      TEXT NOT NULL,            -- 'wiki' | 'hr-policy' | 'runbook'
    -- departments allowed to see this doc; empty array = visible to everyone
    visible_to  TEXT[] NOT NULL DEFAULT '{}',
    body        TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
