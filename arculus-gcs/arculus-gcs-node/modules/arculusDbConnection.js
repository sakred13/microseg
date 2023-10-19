const mysql = require('mysql2');
const fs = require('fs-extra');

const dbConfig = JSON.parse(fs.readFileSync('configs/dbconfigs.json'));

// Create a connection pool to handle multiple connections to the database
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: dbConfig.connectionLimit
});

module.exports = pool;