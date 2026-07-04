
const { Pool } = require("pg");


// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "authdb",
//   password: "tani@2005",
//   port: 5432,
// });





const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;