
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "authdb",
  password: "tani@2005",
  port: 5432,
});

module.exports = pool;