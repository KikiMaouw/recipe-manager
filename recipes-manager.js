import readline from 'readline';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import chalk from 'chalk';


dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function testConnection(){ 
    const connectionBD = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    try {
        await connectionBD.connect();
        console.log(`\nDatabase ${chalk.green('connectée')}.`);
    } catch (err) {
        console.error(chalk.red(`Erreur de connexion à la base de données`, error));
    } finally {
        if (connectionBD) {
            await connectionBD.end();
        }
    }
}

await testConnection();