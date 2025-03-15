const { Sequelize } = require("sequelize");
require("dotenv").config();

// Log the DATABASE_URL for debugging (but mask the password portion)
const dbUrl = process.env.DATABASE_URL || '';
const maskedUrl = dbUrl.replace(/:[^:]*@/, ':******@');
console.log("🔍 DATABASE_URL utilisé :", maskedUrl);

let sequelize;

// Use DATABASE_URL if available (Heroku provides this)
if (process.env.DATABASE_URL) {
  // Use the URL directly
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Allows self-signed certificates
      },
    },
    logging: console.log, // Enable logging temporarily for debugging
  });
} else {
  // Fallback to individual config variables (for local development)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: console.log,
    }
  );
}

module.exports = sequelize;