const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smart_sports_booking",
  password: "karan020905",
  port: 5432,
});

module.exports = pool;