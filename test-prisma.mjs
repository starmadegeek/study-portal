process.env.DATABASE_URL = 'file:./dev.db';
import { PrismaClient } from './src/generated/client/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({ url: 'file:./dev.db' });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({
  adapter,
  __internal: {
    configOverride: (e) => ({
      ...e,
      datasource: {
        url: "file:./dev.db"
      }
    })
  }
});

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS:', users);
}

main().catch(console.error);
