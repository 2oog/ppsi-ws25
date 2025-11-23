import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function main() {
    try {
        console.log('Testing connection...');
        const result = await client`SELECT 1`;
        console.log('Connection successful:', result);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await client.end();
    }
}

main();
