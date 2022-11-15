const client = require('mongoose');
const config = require('config');
const logger = require('../config/logger');

let _db;
function initDb(callback) {
    if (_db) {
        return callback(null, _db);
    }
    client.connect(config.db.connectionString, config.db.connectionOptions,
        function (err, db) {
            if (err) {
                return callback(err);
            }
            logger.info("DB initialized - connected to: " + config.db.connectionString);
            _db = db;
            return callback(null, _db);
        });
}

async function clearDb() {
    try {
        await client.connection.dropDatabase();
    } catch (e) {
        logger.error(e);
    }

}

function getDb() {
    return _db;
}

async function closeDb() {
    try {
        await client.connection.close();
    } catch (e) {
        logger.error(e);
    }
}

module.exports = {
    getDb,
    initDb,
    clearDb,
    closeDb
};