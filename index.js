require("dotenv").config(); // Charger les variables d'environnement
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const Customer = require("./models/Customer");
const customerRoutes = require("./routes/customer");
const employeeRoutes = require("./routes/Employee");
const servicesRoutes = require("./routes/Services");
const InvoiceRoutes = require("./routes/Invoice");
const Invoice = require("./models/Invoice");
const invoiceEmployeesRouter = require("./routes/invoiceEmployee");
const defineAssociations = require("./models/association");
const emailRoutes = require("./routes/Email");
const app = express();
const admin = require("firebase-admin");
const authRoutes = require("./routes/Auth");

const serviceAccount = require("./config/abeliasun-firebase-adminsdk-2mpxl-48e16b1656.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin SDK initialisé !");

// Middleware
app.use(bodyParser.json());

app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/invoices", InvoiceRoutes);
app.use("/api/invoice-employees", invoiceEmployeesRouter);
app.use("/api", emailRoutes);
app.use("/api/auth", authRoutes);

sequelize
  .authenticate()
  .then(() => console.log("Databse connected"))
  .catch((err) => console.error("Database error", err));

defineAssociations();

sequelize
  .sync() // `force: true` recrée les tables à chaque redémarrage (utile en dev)
  .then(() => console.log("Database synced successfully"))
  .catch((err) => console.error("Error syncing database:", err));

// Route par défaut pour tester
app.get("/api", (req, res) => {
  res.send(
    "API is running. Available endpoints: /api/auth/createUser, /api/auth/... "
  );
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Démarrage du serveur
app.listen(process.env.PORT || 4000, () => {
  console.log(
    `Server running on https://abeliasun-backend-5c08804f47f8.herokuapp.com/api`
  );
});
