const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { getAuth } = require("firebase-admin/auth");

// Récupérer tous les employés
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un employé par ID
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouvel employé
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newEmployee = await Employee.create({ name, email, phone });
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour un employé
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un employé
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    await employee.destroy();
    res.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
