const mongoose = require('mongoose');
// diambil dari app/config.js
const { dbHost, dbPass, dbName, dbPort, dbUser } = require('../app/config');

mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`);
const db = mongoose.connection;

module.exports = db;