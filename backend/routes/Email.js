const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const router = express.Router();

// Configuration de multer pour gérer les fichiers
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
});

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Route pour l'envoi d'email
router.post("/send-invoice-email", upload.single("pdf"), async (req, res) => {
  const pdfFile = req.file;

  try {
    if (!pdfFile) {
      throw new Error("Aucun fichier PDF fourni");
    }

    const { recipients, subject, message } = req.body;

    if (!recipients) {
      throw new Error("Aucun destinataire spécifié");
    }

    const recipientsList = JSON.parse(recipients);

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: recipientsList.join(", "),
      subject: subject,
      text: message,
      attachments: [
        {
          filename: pdfFile.originalname || "facture.pdf",
          path: pdfFile.path,
        },
      ],
    });

    res.json({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email",
      error: error.message,
    });
  }
});

module.exports = router;
