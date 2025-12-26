import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function test() {
  console.log('\n🔍 TESTANDO CONEXÃO COM BANCO...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não encontrada\n');
    return;
  }
  
  console.log('✅ DATABASE_URL encontrada\n');
  
  const sql = postgres(dbUrl);
  
  try {
    console.log('1️⃣ Testando conexão...');
    await sql`SELECT 1 as test`;
    console.log('   ✅ Conexão OK\n');
    
    console.log('2️⃣ Verificando tabela users...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'users'
      ) as exists
    `;
    
    if (!tableCheck[0].exists) {
      console.log('   ❌ Tabela users NÃO EXISTE!\n');
      await sql.end();
      return;
    }
    console.log('   ✅ Tabela users existe\n');
    
    console.log('3️⃣ Verificando colunas...');
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log('   Colunas:', columns.map(c => c.column_name).join(', '));
    console.log('');
    
    console.log('4️⃣ Buscando usuário...');
    const users = await sql`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'rodrigorochameire@gmail.com'
    `;
    
    if (users.length === 0) {
      console.log('   ⚠️  Usuário NÃO ENCONTRADO\n');
    } else {
      console.log('   ✅ Usuário encontrado!');
      console.log('   - ID:', users[0].id);
      console.log('   - Nome:', users[0].name);
      console.log('   - Email:', users[0].email);
      console.log('   - Role:', users[0].role);
      console.log('');
    }
    
    console.log('✅ TESTE CONCLUÍDO!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  } finally {
    await sql.end();
  }
}

test();
node scripts/test-db.js

pnpm run db:test


