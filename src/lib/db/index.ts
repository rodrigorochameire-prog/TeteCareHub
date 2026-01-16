import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

// ==========================================
// CONFIGURAÇÃO DE CONEXÃO
// ==========================================

/**
 * Configurações do pool de conexões
 * Otimizado para ambiente serverless (Vercel) com Supabase
 */
const POOL_CONFIG = {
  // Número máximo de conexões no pool
  // Em serverless, 3-5 é um bom equilíbrio
  max: 3,
  
  // Timeout de conexão ociosa (segundos)
  idle_timeout: 20,
  
  // Timeout para estabelecer conexão (segundos)
  connect_timeout: 10,
  
  // Desabilitar prepared statements (OBRIGATÓRIO para PgBouncer em modo transaction)
  prepare: false,
  
  // Configurações SSL para Supabase
  ssl: "require",
  
  // Não fazer fetch de tipos - mais rápido para cold start
  fetch_types: false,
} as const;

// Singleton para conexão do banco
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

/**
 * Obtém a URL do banco de dados
 * Suporta tanto DATABASE_URL quanto POSTGRES_URL
 */
function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!url) {
    throw new Error(
      "❌ DATABASE_URL não está definida. Configure seu arquivo .env.local"
    );
  }
  
  // Corrigir senha com caracteres especiais (URL encode se necessário)
  // Detecta padrão postgresql://user:password@host
  const match = url.match(/^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/);
  if (match) {
    const [, prefix, password, suffix] = match;
    // Se a senha tem caracteres que precisam de encoding
    if (password.includes('[') || password.includes(']') || password.includes('*') || password.includes('%')) {
      // encodeURIComponent não codifica * e outros, fazemos manualmente
      let encodedPassword = encodeURIComponent(password);
      // Encode adicional para asterisco (*)
      encodedPassword = encodedPassword.replace(/\*/g, '%2A');
      url = prefix + encodedPassword + suffix;
      console.log('[DB] Password encoding applied');
    }
  }
  
  return url;
}

/**
 * Cria conexão com o banco de dados PostgreSQL
 * Usa singleton para evitar múltiplas conexões em desenvolvimento
 */
function createConnection(): postgres.Sql {
  const databaseUrl = getDatabaseUrl();
  
  // Log da conexão apenas em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    const urlParts = databaseUrl.split("@");
    const host = urlParts[1]?.split("/")[0] || "unknown";
    console.log(`🔌 Conectando ao PostgreSQL: ${host}`);
  }
  
  // Conexão otimizada para serverless
  const conn = postgres(databaseUrl, POOL_CONFIG);

  return conn;
}

/**
 * Obtém a instância do banco de dados (lazy initialization)
 * Só inicializa a conexão quando realmente precisa
 */
function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!globalForDb.conn) {
    globalForDb.conn = createConnection();
  }

  if (!globalForDb.db) {
    globalForDb.db = drizzle(globalForDb.conn, { 
      schema,
      // Log de queries apenas em desenvolvimento
      logger: process.env.NODE_ENV === "development" && process.env.LOG_QUERIES === "true"
        ? {
            logQuery: (query, params) => {
              console.log(`[SQL] ${query.substring(0, 100)}...`);
            },
          }
        : undefined,
    });
  }

  return globalForDb.db;
}

/**
 * Proxy para lazy initialization
 * Exportar db como getter lazy para evitar conexão durante build
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const database = getDb();
    const value = database[prop as keyof typeof database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

/**
 * Pré-aquece a conexão com o banco
 * Chame isso no início das funções serverless para evitar cold start
 */
export async function warmupConnection(): Promise<void> {
  try {
    // Força inicialização da conexão
    const database = getDb();
    // Query leve para estabelecer conexão
    await database.execute(sql`SELECT 1`);
  } catch {
    // Ignora erros - é só warmup
  }
}

/**
 * Verifica se a conexão com o banco está funcionando
 */
export async function testConnection(): Promise<boolean> {
  try {
    const conn = globalForDb.conn ?? createConnection();
    const result = await conn`SELECT 1 as test`;
    return result.length > 0;
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco:", error);
    return false;
  }
}

/**
 * Verifica a saúde do banco de dados com mais detalhes
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  latency: number;
  poolSize?: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    const conn = globalForDb.conn ?? createConnection();
    await conn`SELECT 1`;
    
    return {
      connected: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fecha a conexão com o banco (para cleanup)
 * Útil para testes ou graceful shutdown
 */
export async function closeConnection(): Promise<void> {
  if (globalForDb.conn) {
    await globalForDb.conn.end();
    globalForDb.conn = undefined;
    globalForDb.db = undefined;
    
    if (process.env.NODE_ENV === "development") {
      console.log("🔌 Conexão com PostgreSQL fechada");
    }
  }
}

/**
 * Executa uma transação com retry automático em caso de deadlock
 */
export async function withTransaction<T>(
  fn: (tx: typeof db) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.transaction(fn as any);
    } catch (error: any) {
      lastError = error;
      
      // Código de erro de deadlock no PostgreSQL
      if (error?.code === "40P01" && attempt < maxRetries) {
        // Espera exponencial antes de retry
        await new Promise((resolve) => 
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Re-exportar tipos, schema e helpers
export * from "./schema";
export * from "./schema-enhanced";
export * from "./helpers";
