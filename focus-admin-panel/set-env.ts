import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const envProd = `export const environment = {
  production: true,
  apiUrl: '${process.env['API_URL']}'
};
`;

const envDev = `export const environment = {
  production: false,
  apiUrl: '${process.env['API_URL']}'
};
`;

fs.writeFileSync('./src/environments/environment.prod.ts', envProd);
fs.writeFileSync('./src/environments/environment.ts', envDev);

console.log('Environments generados desde .env');