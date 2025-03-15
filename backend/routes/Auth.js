const express = require("express");
const { getAuth } = require("firebase-admin/auth");
const admin = require("firebase-admin");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Auth API is running!");
});

router.post("/createUser", async (req, res) => {
  const { email, password, displayName, currentUserEmail, currentUserToken } =
    req.body;

  if (
    !email ||
    !password ||
    !displayName ||
    !currentUserEmail ||
    !currentUserToken
  ) {
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires." });
  }

  try {
    // Vérifie le token Firebase de l'utilisateur actuel
    const decodedToken = await admin.auth().verifyIdToken(currentUserToken);
    console.log("Token valide pour l'utilisateur :", decodedToken.email);

    // Créer le nouvel utilisateur
    const auth = getAuth();
    const newUser = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log("Nouvel utilisateur créé :", newUser);

    const db = admin.firestore();
    await db.collection("users").doc(newUser.uid).set({
      displayName,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Nouvel utilisateur créé avec succès",
      newUser: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur.",
      error: error.message,
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const listUsers = async (nextPageToken) => {
      const result = [];
      const listUsersResult = await getAuth().listUsers(1000, nextPageToken);
      result.push(...listUsersResult.users);
      if (listUsersResult.pageToken) {
        const moreUsers = await listUsers(listUsersResult.pageToken);
        result.push(...moreUsers);
      }
      return result;
    };

    const users = await listUsers();
    res.json(users);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs Firebase :",
      error
    );
    res
      .status(500)
      .json({ error: "Impossible de récupérer les utilisateurs Firebase." });
  }
});

router.delete("/delete/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    await getAuth().deleteUser(uid);
    res.json({ message: `Utilisateur avec UID ${uid} supprimé.` });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'utilisateur Firebase :",
      error
    );
    res
      .status(500)
      .json({ error: "Impossible de supprimer l'utilisateur Firebase." });
  }
});

module.exports = router;
