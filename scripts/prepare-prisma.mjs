import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL || '';
const isSqlite = dbUrl.startsWith('file:');
const schemaPath = 'prisma/schema.prisma';
const generatedSchemaPath = 'prisma/schema.generated.prisma';

let schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (isSqlite) {
  console.log('Detected SQLite DATABASE_URL. Preparing local schema...');
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  fs.writeFileSync(generatedSchemaPath, schemaContent);
  execSync('npx prisma generate --schema=prisma/schema.generated.prisma', { stdio: 'inherit' });
  execSync('npx prisma db push --schema=prisma/schema.generated.prisma', { stdio: 'inherit' });
} else {
  console.log('Detected PostgreSQL DATABASE_URL. Using default schema...');
  execSync('npx prisma generate', { stdio: 'inherit' });
}
