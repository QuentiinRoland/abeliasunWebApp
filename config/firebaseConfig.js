const admin = require("firebase-admin");
const serviceAccount = require("./abeliasun-firebase-adminsdk-2mpxl-48e16b1656.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://abeliasun.firebaseio.com",
});

async function setAdminRole(userEmail) {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Rôle admin attribué à ${userEmail}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle admin :", error);
  }
}

setAdminRole("jimmy@abeliasun.be");
setAdminRole("quentinroland12@gmail.com");
setAdminRole("info@abeliasun.be");
module.exports = admin;
