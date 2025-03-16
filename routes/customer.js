const express = require("express");
const Customer = require("../models/Customer");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.phone) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

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

router.post('/import', async (req, res) => {
  try {
    const { customers } = req.body;
    
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée client valide fournie' });
    }
    
    const validCustomers = customers.filter(customer => 
      customer.name && customer.email && customer.phone && customer.street
    );
    
    if (validCustomers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun client valide trouvé. Assurez-vous que tous les champs obligatoires sont remplis.' 
      });
    }
    
    const emails = validCustomers.map(c => c.email);
    const uniqueEmails = new Set(emails);
    
    if (emails.length !== uniqueEmails.size) {
      return res.status(400).json({ 
        success: false, 
        message: 'Des adresses email en double ont été détectées. Chaque client doit avoir une adresse email unique.' 
      });
    }
    
    const existingEmails = await Customer.findAll({
      where: {
        email: emails
      },
      attributes: ['email']
    });
    
    if (existingEmails.length > 0) {
      const duplicateEmails = existingEmails.map(e => e.email);
      return res.status(400).json({ 
        success: false, 
        message: `Les adresses email suivantes existent déjà: ${duplicateEmails.join(', ')}` 
      });
    }
    
    const createdCustomers = await Customer.bulkCreate(validCustomers);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Importation réussie', 
      importedCount: createdCustomers.length 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'importation des clients:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'importation des clients', 
      error: error.message 
    });
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
