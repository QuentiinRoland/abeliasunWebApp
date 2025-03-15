const { Sequelize } = require("sequelize");
require("dotenv").config();

console.log("🔍 DATABASE_URL utilisé :", process.env.DATABASE_URL);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Permet de contourner les erreurs de certificat auto-signé
      },
    },
  }
);

module.exports = sequelize;
