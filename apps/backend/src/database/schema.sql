-- TimescaleDB schema for Fermi Explorer tick streaming
-- Create database: CREATE DATABASE fermi_ticks;
-- Enable TimescaleDB extension: CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Ticks table (main hypertable)
CREATE TABLE IF NOT EXISTS ticks (
    tick_number BIGINT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    vdf_input TEXT NOT NULL,
    vdf_output TEXT NOT NULL,
    vdf_proof TEXT NOT NULL,
    vdf_iterations BIGINT NOT NULL,
    transaction_batch_hash TEXT NOT NULL,
    previous_output TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tick_number, timestamp)
);

-- Convert to hypertable (partitioned by timestamp for time-series optimization)
SELECT create_hypertable('ticks', 'timestamp', if_not_exists => TRUE);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    tx_hash TEXT NOT NULL,
    tick_number BIGINT NOT NULL,
    sequence_number BIGINT NOT NULL,
    tx_id TEXT NOT NULL,
    payload BYTEA,
    signature BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    nonce BIGINT NOT NULL,
    tx_timestamp TIMESTAMPTZ NOT NULL,
    ingestion_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tx_hash, tick_number)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ticks_tick_number ON ticks (tick_number);
CREATE INDEX IF NOT EXISTS idx_ticks_timestamp ON ticks (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tick_number ON transactions (tick_number);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions (tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_timestamp ON transactions (tx_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_public_key ON transactions (public_key);

-- Compression policy (compress data older than 7 days)
SELECT add_compression_policy('ticks', INTERVAL '7 days', if_not_exists => TRUE);

-- Retention policy (keep data for 1 year)
SELECT add_retention_policy('ticks', INTERVAL '1 year', if_not_exists => TRUE);

-- Continuous aggregate for hourly tick stats
CREATE MATERIALIZED VIEW IF NOT EXISTS ticks_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', timestamp) AS hour,
    COUNT(*) as tick_count,
    AVG((SELECT COUNT(*) FROM transactions WHERE tick_number = ticks.tick_number)) as avg_transactions_per_tick,
    MIN(tick_number) as min_tick_number,
    MAX(tick_number) as max_tick_number
FROM ticks
GROUP BY hour
WITH NO DATA;

-- Refresh policy for the continuous aggregate
SELECT add_continuous_aggregate_policy('ticks_hourly',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Daily transaction stats
CREATE MATERIALIZED VIEW IF NOT EXISTS transactions_daily
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', tx_timestamp) AS day,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT public_key) as unique_addresses,
    AVG(nonce) as avg_nonce
FROM transactions
GROUP BY day
WITH NO DATA;

-- Refresh policy for daily stats
SELECT add_continuous_aggregate_policy('transactions_daily',
    start_offset => INTERVAL '1 week',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE);