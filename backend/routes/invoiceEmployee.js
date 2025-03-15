const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const InvoiceEmployee = require("../models/InvoiceEmployee");
const Employee = require("../models/Employee");
const Invoice = require("../models/Invoice");

// Route pour récupérer les heures travaillées
router.get("/hours", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log("Recherche des heures entre:", {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    const hours = await InvoiceEmployee.findAll({
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email"],
        },
        {
          model: Invoice,
          where: {
            date: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          attributes: ["date"],
        },
      ],
      attributes: ["hours", "EmployeeId", "InvoiceId"],
    });

    console.log("Heures trouvées:", JSON.stringify(hours, null, 2));

    res.json(hours);
  } catch (error) {
    console.error("Erreur lors de la récupération des heures:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer tous les InvoiceEmployees
router.get("/", async (req, res) => {
  try {
    const invoiceEmployees = await InvoiceEmployee.findAll({
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email"],
        },
        {
          model: Invoice,
          attributes: ["id", "numberInvoice", "date"],
        },
      ],
    });
    res.json(invoiceEmployees);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des InvoiceEmployees:",
      error
    );
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
