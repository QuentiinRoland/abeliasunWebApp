const cors = require("cors");
const express = require("express");
const sequelize = require("./models");
const app = express();
const customerRoutes = require("./routes/customerRoutes");

// Autoriser les requêtes depuis ton frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Remplace par l'URL de ton frontend en prod
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Si tu envoies des cookies ou des sessions
  })
);
app.use(express.json());

app.use("/api/customers", customerRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Base de données synchronisée");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Serveur démarré sur le port 5000");
    });
  })
  .catch((err) => {
    console.error("Erreur de synchronisation de la base de données :", err);
  });
