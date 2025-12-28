import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não está definida. Por favor, configure seu arquivo .env.local"
  );
}

// Criar conexão singleton para evitar múltiplas conexões em desenvolvimento
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

// Re-exportar tipos do schema
export * from "./schema";
