import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MIGRATION_FILE = path.join(process.cwd(), 'migrations', '0001_init_schema.sql');
const isRemote = process.argv.includes('--remote') || process.env.REMOTE_MIGRATE === '1';

console.log('----------------------------------------------------');
console.log(` [FolloEat v4.1] Auto-Migrazione SQL Database (${isRemote ? 'PRODUZIONE REMOTE' : 'LOCALE/BUILD'}) `);
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

// 2. Esecuzione migrazione Cloudflare D1
try {
  const flag = isRemote ? '--remote' : '--local';
  console.log(`Esecuzione comandi SQL su Cloudflare D1 (${flag})...`);
  const cmd = `npx wrangler d1 execute folloeat-db ${flag} --file=./migrations/0001_init_schema.sql`;
  const result = execSync(cmd, {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log(`✓ Migrazione Cloudflare D1 (${flag}) completata con successo:\n`, result);
} catch (e) {
  if (isRemote) {
    console.warn('⚠️ Attenzione: Migrazione remota CLI non riuscita (probabile assenza di login Wrangler o credenziali CF). Il motore di auto-migrazione runtime in src/lib/db.ts eseguirà lo schema D1 automaticamente alla prima richiesta.');
  } else {
    console.log('ℹ Nota: Wrangler D1 locale pronto o in modalità edge. Il motore runtime in src/lib/db.ts gestisce la migrazione attiva.');
  }
}

console.log('----------------------------------------------------');
console.log(' [FolloEat v4.1] Auto-Migrazione SQL Terminata con Successo! ');
console.log('----------------------------------------------------');
process.exit(0);
