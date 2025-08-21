import { Database } from "bun:sqlite";

export interface SqliteOptions {
  path: string;
}

export class TickDb {
  db: Database;

  insertTick: any;
  insertTx: any;
  upsertState: any;
  getState: any;
  insertDecoded?: any;

  constructor(opts: SqliteOptions) {
    this.db = new Database(opts.path, { create: true, readwrite: true });
    this.pragmas();
    this.migrate();
    this.prepareStatements();
  }

  pragmas() {
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=NORMAL;
      PRAGMA busy_timeout=5000;
      PRAGMA temp_store=MEMORY;
      PRAGMA mmap_size=268435456;
    `);
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ticks (
        tick_number INTEGER PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        vdf_input TEXT NOT NULL,
        vdf_output TEXT NOT NULL,
        vdf_proof TEXT NOT NULL,
        vdf_iterations INTEGER NOT NULL,
        transaction_batch_hash TEXT NOT NULL,
        previous_output TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        tx_hash TEXT NOT NULL,
        tick_number INTEGER NOT NULL,
        sequence_number INTEGER NOT NULL,
        tx_id TEXT NOT NULL,
        payload BLOB,
        signature BLOB NOT NULL,
        public_key BLOB NOT NULL,
        nonce INTEGER NOT NULL,
        tx_timestamp INTEGER NOT NULL,
        ingestion_timestamp INTEGER NOT NULL,
        PRIMARY KEY (tx_hash, tick_number)
      );

      CREATE TABLE IF NOT EXISTS ingestion_state (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL
      );
    `);

    // Optional decoded cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions_decoded (
        tx_hash TEXT PRIMARY KEY,
        payload_text TEXT
      );
    `);
  }

  prepareStatements() {
    this.insertTick = this.db.query(`
      INSERT INTO ticks (
        tick_number, timestamp, vdf_input, vdf_output, vdf_proof,
        vdf_iterations, transaction_batch_hash, previous_output
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tick_number) DO NOTHING;
    `);

    this.insertTx = this.db.query(`
      INSERT INTO transactions (
        tx_hash, tick_number, sequence_number, tx_id, payload, signature,
        public_key, nonce, tx_timestamp, ingestion_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tx_hash, tick_number) DO NOTHING;
    `);

    this.upsertState = this.db.query(`
      INSERT INTO ingestion_state (key, value) VALUES ('last_committed_tick', ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `);

    this.getState = this.db.query<{ value: number }, number>(
      `SELECT value FROM ingestion_state WHERE key='last_committed_tick'`
    );

    this.insertDecoded = this.db.query(`
      INSERT INTO transactions_decoded (tx_hash, payload_text)
      VALUES (?, ?)
      ON CONFLICT(tx_hash) DO UPDATE SET payload_text=excluded.payload_text;
    `);
  }

  begin() {
    this.db.exec("BEGIN");
  }

  commit() {
    this.db.exec("COMMIT");
  }

  rollback() {
    this.db.exec("ROLLBACK");
  }
}

