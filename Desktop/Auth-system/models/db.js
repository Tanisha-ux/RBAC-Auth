
const { Pool } = require("pg");
const dotenv=require("dotenv");

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "authdb",
//   password: "tani@2005",
//   port: 5432,
// });



dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;