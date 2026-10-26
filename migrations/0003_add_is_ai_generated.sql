-- Migration: 0003_add_is_ai_generated.sql
ALTER TABLE posts ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0;
