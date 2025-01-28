const express = require("express");
const Customer = require("../models/Customer");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Validation des données
    if (!req.body.name || !req.body.email || !req.body.phone) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // S'assurer que additionalEmail est un tableau
    const customerData = {
      ...req.body,
      additionalEmail: Array.isArray(req.body.additionalEmail)
        ? req.body.additionalEmail
        : [],
    };

    const customer = await Customer.create(customerData);
    res.status(201).json(customer);
  } catch (err) {
    console.error("Erreur création client:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Cet email existe déjà" });
    }

    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const customer = await Customer.findAll();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, additionalEmail, phone, street, city, postalCode } =
      req.body;
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.additionalEmail = additionalEmail || customer.additionalEmail;
    customer.phone = phone || customer.phone;
    customer.street = street || customer.street;
    customer.city = city || customer.city;
    customer.postalCode = postalCode || customer.postalCode;

    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    await customer.destroy();
    console.log(`Client avec l'ID ${req.params.id} supprimée`);
    res.json({ message: "Client supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
