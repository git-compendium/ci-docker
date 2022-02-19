// Datei: npm-security/server.js
const express = require('express');
const Sqlite = require('better-sqlite3');
// const path = require('path');
const routes = require('./routes');

const app = express();

const port = process.env.PORT || 3001;
const picDB = process.env.picDB || 'pictures.db';

const db = new Sqlite(picDB);
db.exec('CREATE TABLE IF NOT EXISTS pic (id TEXT, date NUMBER, thumbnail BLOB, mime TEXT, size TEXT, filename TEXT, hasExif NUMBER)');

app.set('db', db);
app.use('/', express.static('./'));
app.use('/api', routes);
app.listen(port, () => {
  console.log('API-Server auf Port ', port);
});

module.exports = app; // for mocha/chai tests
