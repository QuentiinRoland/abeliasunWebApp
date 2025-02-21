const prestations = [
  {
    id: 1,
    name: "Entretien",
    subservices: [
      { id: 1, name: "Abattage" },
      { id: 2, name: "Abattage/élagages" },
      { id: 3, name: "Broyage" },
      { id: 4, name: "Engrais" },
      { id: 5, name: "Écorces" },
      { id: 6, name: "Feuilles ramassage/soufflage" },
      { id: 7, name: "Finitions bords" },
      { id: 8, name: "Nettoyage Haute pression/brosse mécanique" },
      { id: 9, name: "Nettoyage parterres" },
      { id: 10, name: "Nettoyage terrasses/chemins/parking" },
      { id: 11, name: "Plantations annuelles" },
      { id: 12, name: "Pulvérisation mauvaise herbes" },
      { id: 13, name: "Taille grandes haies" },
      { id: 14, name: "Taille petites haies" },
      { id: 15, name: "Taille arbustes/massifs" },
      { id: 16, name: "Tonte" },
      { id: 17, name: "Traitement pelouses (engrais/pulvérisation)" },
    ],
  },
  {
    id: 2,
    name: "Aménagement",
    subservices: [
      { id: 21, name: "Aménagement extérieur" },
      { id: 22, name: "Aménagement pierre" },
    ],
  },
];

module.exports = prestations;
