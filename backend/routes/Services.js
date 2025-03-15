const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const SubService = require("../models/SubService");

router.get("/", async (req, res) => {
  try {
    console.log("Route /api/services appelée");
    const services = await Service.findAll({
      include: [
        {
          model: SubService,
          as: "subservices",
        },
      ],
    });
    console.log("Services trouvés:", JSON.stringify(services, null, 2));
    res.json(services);
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajoutez temporairement cette route de test
router.get("/test", async (req, res) => {
  try {
    // Test Services
    const servicesCount = await Service.count();
    console.log("Nombre de services:", servicesCount);

    // Test SubServices
    const subServicesCount = await SubService.count();
    console.log("Nombre de sous-services:", subServicesCount);

    // Récupération directe
    const services = await Service.findAll();
    console.log("Services bruts:", JSON.stringify(services, null, 2));

    res.json({
      servicesCount,
      subServicesCount,
      services,
    });
  } catch (error) {
    console.error("Erreur test:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
