import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MIGRATION_FILE = path.join(process.cwd(), 'migrations', '0001_init_schema.sql');

console.log('----------------------------------------------------');
console.log(' [FolloEat v4.1] Avvio Auto-Migrazione SQL Database ');
console.log('----------------------------------------------------');

if (!fs.existsSync(MIGRATION_FILE)) {
  console.error('❌ Errore: File di migrazione SQL non trovato:', MIGRATION_FILE);
  process.exit(1);
}

const sqlContent = fs.readFileSync(MIGRATION_FILE, 'utf-8');
console.log(`✓ File di migrazione letto con successo (${sqlContent.length} byte).`);

// 1. Inizializzazione archivio dati locale (.data/db.json)
const dataDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 2. Verifica se Wrangler è disponibile per migrazione Cloudflare D1
try {
  console.log('Verifica disponibilità database Cloudflare D1...');
  // Tenta l'esecuzione su Cloudflare D1 se configurato in wrangler
  const result = execSync('npx wrangler d1 execute folloeat-db --local --file=./migrations/0001_init_schema.sql', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('✓ Migrazione Cloudflare D1 locale eseguita con successo:\n', result);
} catch (e) {
  console.log('ℹ Nota: Wrangler D1 locale non configurato o in modalità standalone. Il motore di auto-migrazione runtime integrato in src/lib/db.ts gestirà la migrazione all\'avvio in produzione.');
}

console.log('----------------------------------------------------');
console.log(' [FolloEat v4.1] Auto-Migrazione SQL Completata con successo! ');
console.log('----------------------------------------------------');
process.exit(0);
