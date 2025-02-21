const express = require("express");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee"); // Assure-toi que le chemin est correct
const InvoiceEmployee = require("../models/InvoiceEmployee"); // Si utilisé pour associer les employés
const Service = require("../models/Service");
const SubService = require("../models/SubService");

const PDFDocument = require("pdfkit");

const router = express.Router();

// Route pour créer une facture
// routes/invoices.js
router.post("/", async (req, res) => {
  console.log(
    "Données reçues par le serveur:",
    JSON.stringify(req.body, null, 2)
  );
  console.log("Données reçues - tagline présente?:", !!req.body.tagline);
  if (req.body.tagline) {
    console.log("Longueur de la tagline:", req.body.tagline.length);
  }
  try {
    const {
      customerId,
      date,
      numberInvoice,
      employeeHours,
      tagline,
      associatedServices,
      selectedSubServices,
      pictures,
    } = req.body;

    console.log("Création de la facture avec les données:", {
      customerId,
      date,
      numberInvoice,
      tagline,
    });
    const invoice = await Invoice.create({
      customerId,
      date,
      numberInvoice,
      tagline,
      pictures,
      employeeHours,
    });
    console.log("Facture créée:", JSON.stringify(invoice, null, 2));

    if (associatedServices && associatedServices.length > 0) {
      console.log(
        "Tentative d'ajout des services associés:",
        associatedServices
      );
      for (let serviceId of associatedServices) {
        const service = await Service.findByPk(serviceId);
        if (service) {
          await invoice.addAssociatedService(service);
          console.log(`Service ${serviceId} ajouté à la facture`);
        } else {
          console.log(`Service ${serviceId} non trouvé`);
        }
      }
    }

    if (employeeHours && employeeHours.length > 0) {
      for (const eh of employeeHours) {
        await InvoiceEmployee.create({
          InvoiceId: invoice.id,
          EmployeeId: eh.employeeId,
          hours: eh.hours,
          date: date,
        });
      }
    }

    const addedServices = await invoice.getAssociatedServices();
    console.log(
      "Services associés après ajout:",
      JSON.stringify(addedServices, null, 2)
    );

    if (selectedSubServices && selectedSubServices.length > 0) {
      await invoice.addSelectedSubServices(selectedSubServices);
    }

    // Récupérer la facture avec les relations
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["name", "email"],
        },
        {
          model: Employee,
          as: "employees",
          through: {
            as: "InvoiceEmployee",
            attributes: ["hours"],
          },
        },
        {
          model: Service,
          as: "associatedServices",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: SubService,
          as: "selectedSubServices",
          through: { attributes: [] },
        },
      ],
    });

    console.log(
      "Facture complète récupérée:",
      JSON.stringify(fullInvoice, null, 2)
    );

    res.status(201).json(fullInvoice);
  } catch (error) {
    console.error("Erreur lors de la création de la facture :", error);
    res.status(400).json({ error: error.message, stack: error.stack });
  }
});

// Route pour récupérer toutes les factures
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        {
          model: Customer,
          as: "customer", // Utilise l'alias défini dans le modèle
          attributes: ["name", "email"], // Les champs que tu veux récupérer
        },
        {
          model: Employee,
          as: "employees",
          through: {
            as: "InvoiceEmployee",
            attributes: ["hours"],
          },
        },
        {
          model: Service,
          as: "associatedServices",
          through: {
            attributes: [], // On spécifie juste les attributs qu'on veut de la table de jointure
          },
          attributes: ["name", "id"],
        },
        {
          model: SubService,
          as: "selectedSubServices",
          through: { attributes: [] },
        },
      ],
    });
    res.json(invoices);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des factures :",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer une facture par ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer", attributes: ["name", "email"] },
        {
          model: Employee,
          as: "employees",
          through: {
            as: "InvoiceEmployee",
            attributes: ["hours"],
          },
        },
        {
          model: Service,
          as: "associatedServices",
          through: {
            attributes: [], // On spécifie juste les attributs qu'on veut de la table de jointure
          },
          attributes: ["name", "id"],
        },
        {
          model: SubService,
          as: "selectedSubServices",
          through: { attributes: [] },
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    res.json(invoice);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la facture :",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour une facture
router.put("/:id", async (req, res) => {
  const { id } = req.params; // ID de la facture
  const updatedData = req.body; // Données envoyées pour la mise à jour

  console.log("ID reçu pour mise à jour :", id);
  console.log("Données reçues :", JSON.stringify(updatedData, null, 2));

  try {
    // Vérifie si la facture existe
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      console.error(`Facture avec l'ID ${id} non trouvée`);
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    // Mettre à jour les champs simples
    await invoice.update({
      date: updatedData.date,
      numberInvoice: updatedData.numberInvoice,
      customerId: updatedData.customerId,
      tagline: updatedData.tagline,
      pictures: updatedData.pictures,
    });

    // Gérer les relations (services, sous-services, employés)
    if (updatedData.associatedServices) {
      console.log(
        "Mise à jour des services associés :",
        updatedData.associatedServices
      );
      await invoice.setAssociatedServices(updatedData.associatedServices);
    }

    if (updatedData.selectedSubServices) {
      console.log(
        "Mise à jour des sous-services :",
        updatedData.selectedSubServices
      );
      await invoice.setSelectedSubServices(updatedData.selectedSubServices);
    }

    if (updatedData.employeeHours) {
      console.log(
        "Mise à jour des heures par employé :",
        updatedData.employeeHours
      );
      // Supprimer les anciennes heures
      await InvoiceEmployee.destroy({ where: { InvoiceId: id } });
      // Ajouter les nouvelles heures
      for (const empHours of updatedData.employeeHours) {
        await InvoiceEmployee.create({
          InvoiceId: id,
          EmployeeId: empHours.employeeId,
          hours: empHours.hours,
        });
      }
    }

    // Récupérer la facture mise à jour avec ses relations
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Customer, as: "customer", attributes: ["name", "email"] },
        {
          model: Employee,
          as: "employees",
          through: { as: "InvoiceEmployee", attributes: ["hours"] },
        },
        {
          model: Service,
          as: "associatedServices",
          through: { attributes: [] },
          attributes: ["name", "id"],
        },
        {
          model: SubService,
          as: "selectedSubServices",
          through: { attributes: [] },
        },
      ],
    });

    console.log(
      "Facture mise à jour :",
      JSON.stringify(updatedInvoice, null, 2)
    );
    res.json(updatedInvoice);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture :", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      console.error(`Facture avec l'ID ${req.params.id} introuvable`);
      return res.status(404).json({ error: "Facture non trouvée" });
    }

    await invoice.destroy();
    console.log(`Facture avec l'ID ${req.params.id} supprimée`);
    res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
