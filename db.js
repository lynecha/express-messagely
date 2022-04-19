"use strict";

/** Database connection for messagely. */


const { Client } = require("pg");
//const { DB_URI } = require("./config");

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgres://postgres:1084314Lyne!@localhost:5432/messagely_test"
    : "postgres://postgres:1084314Lyne!@localhost:5432/messagely";
let db = new Client({
  connectionString: DB_URI,
});

db.connect();


module.exports = db;




// const { Client } = require("pg");
// const { DB_URI } = require("./config");

// const db = new Client(DB_URI);

// db.connect();


// module.exports = db;

