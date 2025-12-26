import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { vaccineLibrary, medicationLibrary } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const commonVaccines = [
  { name: "V10 (Déctupla)", description: "Protege contra cinomose, parvovirose, hepatite, leptospirose, parainfluenza, coronavírus e adenovírus", intervalDays: 365, dosesRequired: 3, isCommon: true },
  { name: "V8 (Óctupla)", description: "Protege contra cinomose, parvovirose, hepatite, leptospirose, parainfluenza e adenovírus", intervalDays: 365, dosesRequired: 3, isCommon: true },
  { name: "Antirrábica", description: "Proteção contra raiva", intervalDays: 365, dosesRequired: 1, isCommon: true },
  { name: "Gripe Canina (Tosse dos Canis)", description: "Proteção contra traqueobronquite infecciosa", intervalDays: 365, dosesRequired: 1, isCommon: true },
  { name: "Giárdia", description: "Proteção contra giardíase", intervalDays: 365, dosesRequired: 2, isCommon: true },
  { name: "Leishmaniose", description: "Proteção contra leishmaniose visceral", intervalDays: 365, dosesRequired: 3, isCommon: true },
];

const commonMedications = [
  { name: "Simparic", type: "preventive", description: "Antipulgas e carrapatos (comprimido mastigável)", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "NexGard", type: "preventive", description: "Antipulgas e carrapatos (comprimido mastigável)", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "Bravecto", type: "preventive", description: "Antipulgas e carrapatos (comprimido mastigável - 3 meses)", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "Revolution", type: "preventive", description: "Antipulgas, carrapatos e vermes (tópico)", commonDosage: "Aplicação tópica mensal", isCommon: true },
  { name: "Advocate", type: "preventive", description: "Antipulgas e vermes (tópico)", commonDosage: "Aplicação tópica mensal", isCommon: true },
  { name: "Drontal Plus", type: "preventive", description: "Vermífugo de amplo espectro", commonDosage: "1 comprimido por 10kg", isCommon: true },
  { name: "Endogard", type: "preventive", description: "Vermífugo e prevenção de dirofilariose", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "Heartgard Plus", type: "preventive", description: "Prevenção de dirofilariose (verme do coração)", commonDosage: "Mastigável mensal", isCommon: true },
  { name: "Predsin", type: "treatment", description: "Anti-inflamatório e imunossupressor", commonDosage: "Conforme prescrição veterinária", isCommon: true },
  { name: "Meloxicam", type: "treatment", description: "Anti-inflamatório não esteroidal", commonDosage: "0.1mg/kg a cada 24h", isCommon: true },
  { name: "Amoxicilina", type: "treatment", description: "Antibiótico de amplo espectro", commonDosage: "10-20mg/kg a cada 12h", isCommon: true },
  { name: "Cefalexina", type: "treatment", description: "Antibiótico para infecções bacterianas", commonDosage: "15-30mg/kg a cada 12h", isCommon: true },
  { name: "Ômega 3", type: "supplement", description: "Suplemento para pele, pelagem e articulações", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "Condroitina + Glucosamina", type: "supplement", description: "Suplemento para articulações", commonDosage: "Conforme peso do animal", isCommon: true },
  { name: "Probióticos", type: "supplement", description: "Suplemento para saúde intestinal", commonDosage: "Conforme indicação do produto", isCommon: true },
];

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Seed vaccines
    console.log("📋 Inserindo vacinas comuns...");
    for (const vaccine of commonVaccines) {
      await db.insert(vaccineLibrary).values(vaccine).onConflictDoUpdate({ target: vaccineLibrary.name, set: { name: vaccine.name } });
    }
    console.log(`✅ ${commonVaccines.length} vacinas inseridas`);

    // Seed medications
    console.log("💊 Inserindo medicamentos comuns...");
    for (const medication of commonMedications) {
      await db.insert(medicationLibrary).values(medication).onConflictDoUpdate({ target: medicationLibrary.name, set: { name: medication.name } });
    }
    console.log(`✅ ${commonMedications.length} medicamentos inseridos`);

    console.log("🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    await client.end();
    process.exit(1);
  }

  await client.end();
  process.exit(0);
}

seed();

}

seed();
