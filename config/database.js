const { Sequelize } = require("sequelize");
require("dotenv").config();

console.log("🔍 DATABASE_URL utilisé :", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: process.env.DATABASE_URL.includes("localhost")
    ? {} // Pas de SSL en local
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
});

module.exports = sequelize;
