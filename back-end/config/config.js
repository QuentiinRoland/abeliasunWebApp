require("dotenv").config();

module.exports = {
  development: {
    username: "postgres",
    password: "password",
    database: "dev_database",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL", // Utiliser DATABASE_URL pour Heroku
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
