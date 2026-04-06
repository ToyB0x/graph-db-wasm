declare module "lbug-wasm" {
  class Database {
    constructor(
      databasePath: string,
      bufferPoolSize?: number,
      maxNumThreads?: number,
      enableCompression?: boolean,
      readOnly?: boolean,
      autoCheckpoint?: boolean,
      checkpointThreshold?: number,
    );
    init(): Promise<void>;
    close(): Promise<void>;
  }

  class Connection {
    constructor(database: Database, numThreads?: number | null);
    init(): Promise<void>;
    query(statement: string): Promise<QueryResult>;
    prepare(statement: string): Promise<PreparedStatement>;
    execute(
      preparedStatement: PreparedStatement,
      params?: Record<string, unknown>,
    ): Promise<QueryResult>;
    setMaxNumThreadForExec(numThreads: number): Promise<void>;
    setQueryTimeout(timeout: number): Promise<void>;
    close(): Promise<void>;
  }

  class PreparedStatement {
    isSuccess(): boolean;
    getErrorMessage(): Promise<string>;
  }

  class QueryResult {
    isSuccess(): boolean;
    getErrorMessage(): Promise<string>;
    getColumnNames(): Promise<string[]>;
    getColumnTypes(): Promise<string[]>;
    getNumColumns(): Promise<number>;
    getNumTuples(): Promise<number>;
    getQuerySummary(): Promise<{ executionTime: number; compilingTime: number }>;
    hasNext(): boolean;
    getNext(): Promise<unknown[]>;
    getAllRows(): Promise<unknown[][]>;
    getAllObjects(): Promise<Record<string, unknown>[]>;
    resetIterator(): Promise<void>;
    hasNextQueryResult(): boolean;
    getNextQueryResult(): Promise<QueryResult>;
    close(): Promise<void>;
  }

  interface FS {
    readFile(path: string): Promise<Buffer>;
    writeFile(path: string, data: string | Buffer): Promise<void>;
    mkdir(path: string): Promise<void>;
    unlink(path: string): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    rmdir(path: string): Promise<void>;
    stat(path: string): Promise<Record<string, unknown>>;
    readDir(path: string): Promise<string[]>;
  }

  const lbug: {
    init(): Promise<void>;
    close(): Promise<void>;
    getVersion(): Promise<string>;
    setWorkerPath(workerPath: string): void;
    Database: typeof Database;
    Connection: typeof Connection;
    PreparedStatement: typeof PreparedStatement;
    QueryResult: typeof QueryResult;
    FS: FS;
  };

  export default lbug;
}
