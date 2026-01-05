import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const results: string[] = [];
  
  try {
    // 1. daily_logs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        log_date TIMESTAMP NOT NULL,
        source VARCHAR(50) NOT NULL,
        mood VARCHAR(50),
        stool VARCHAR(50),
        appetite VARCHAR(50),
        notes TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ daily_logs criada");

    // 2. training_logs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS training_logs (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        log_date TIMESTAMP NOT NULL,
        command VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        success_rate INTEGER,
        duration INTEGER,
        treats INTEGER,
        method VARCHAR(100),
        notes TEXT,
        video_url TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ training_logs criada");

    // 3. training_commands
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS training_commands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20),
        steps TEXT,
        tips TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ training_commands criada");

    // 4. behavior_logs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS behavior_logs (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        log_date TIMESTAMP NOT NULL,
        behavior_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50),
        trigger_event TEXT,
        context TEXT,
        response TEXT,
        notes TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ behavior_logs criada");

    // 5. vaccines
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vaccines (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        vaccine_date TIMESTAMP NOT NULL,
        next_dose TIMESTAMP,
        batch_number VARCHAR(100),
        vet_name VARCHAR(200),
        clinic_name VARCHAR(200),
        notes TEXT,
        document_url TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ vaccines criada");

    // 6. medications
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        time_of_day VARCHAR(100),
        instructions TEXT,
        prescribing_vet VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ medications criada");

    // 7. preventives
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS preventives (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        product_name VARCHAR(200),
        application_date TIMESTAMP NOT NULL,
        next_application TIMESTAMP,
        weight_at_application INTEGER,
        notes TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ preventives criada");

    // 8. documents
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size INTEGER,
        description TEXT,
        document_date TIMESTAMP,
        expiry_date TIMESTAMP,
        is_verified BOOLEAN DEFAULT false,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ documents criada");

    // 9. wall_posts
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wall_posts (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER REFERENCES pets(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        media_type VARCHAR(50),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ wall_posts criada");

    // 10. calendar_events
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        event_type VARCHAR(50) NOT NULL,
        pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
        is_all_day BOOLEAN DEFAULT false,
        is_recurring BOOLEAN DEFAULT false,
        recurrence_pattern VARCHAR(50),
        recurrence_end TIMESTAMP,
        location VARCHAR(200),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'scheduled',
        reminder_minutes INTEGER,
        color VARCHAR(20),
        notes TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ calendar_events criada");

    // 11. notifications
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        action_url TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ notifications criada");

    // 12. packages (créditos)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        credits INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        stripe_price_id VARCHAR(200),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ packages criada");

    // 13. transactions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        pet_id INTEGER REFERENCES pets(id),
        package_id INTEGER REFERENCES packages(id),
        credits INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        stripe_payment_id VARCHAR(200),
        stripe_invoice_id VARCHAR(200),
        amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push("✅ transactions criada");

    // Criar índices importantes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_daily_logs_pet ON daily_logs(pet_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_logs_pet ON training_logs(pet_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    results.push("✅ Índices criados");

    return NextResponse.json({
      success: true,
      message: "Todas as tabelas foram criadas/verificadas!",
      results,
    });
  } catch (error: any) {
    console.error("Erro ao criar tabelas:", error);
    return NextResponse.json(
      { 
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

