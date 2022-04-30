const dotenv = require('dotenv');
const path = require('path'); // librari bawaan nodejs

dotenv.config();

module.exports = {
    rootPath: path.resolve(__dirname, '..'), // dirname = directori saat ini, '..' = keluar satu langkah dari directori sekarang
    secretkey: process.env.SECRET_KEY, // diambil dari file .env
    serviceName: process.env.SERVICE_NAME,
    dbHost: process.env.DB_HOST, // process = bawaan nodejs, .env automatis membaca file env dikarekan dotenv.config(); dijalankan
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME
}