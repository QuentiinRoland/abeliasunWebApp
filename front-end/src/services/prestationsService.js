// src/services/servicesService.js
import axios from "axios";
const API_URL = "https://abeliasun-backend-5c08804f47f8.herokuapp.com";

/**
 * Récupère toutes les prestations (services) disponibles
 * @returns {Promise<Array>} Liste des prestations
 */
export const getServices = async () => {
  try {
    console.log("🔍 Requête envoyée à :", `${API_URL}/api/invoices`);
    const response = await axios.get(`${API_URL}/api/invoices`);
    console.log("🔍 Données reçues :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur API (récupération des prestations) :", error);
    return [];
  }
};

/**
 * Ajoute une nouvelle prestation
 * @param {Object} data - Données de la prestation à créer
 * @returns {Promise<Object>} Prestation créée
 */
export const addService = async (data) => {
  try {
    console.log("📡 Données envoyées à l'API :", data);
    const response = await axios.post(`${API_URL}/api/invoices`, data);
    console.log("✅ Réponse de l'API :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la prestation :", error);
    throw error;
  }
};

/**
 * Supprime une prestation par son ID
 * @param {number|string} id - ID de la prestation à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteService = async (id) => {
  try {
    console.log("🗑️ Suppression de la prestation avec l'ID :", id);
    const response = await axios.delete(`${API_URL}/api/invoices/${id}`);
    console.log("✅ Réponse de l'API (suppression) :", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression de la prestation :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

/**
 * Met à jour une prestation existante
 * @param {number|string} id - ID de la prestation à modifier
 * @param {Object} data - Nouvelles données de la prestation
 * @returns {Promise<Object>} Prestation mise à jour
 */
export const updateService = async (id, data) => {
  try {
    console.log("🔄 Mise à jour de la prestation avec l'ID :", id);
    const response = await axios.put(`${API_URL}/api/invoices/${id}`, data);
    console.log("✅ Réponse de l'API (mise à jour) :", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la modification de la prestation :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

/**
 * Récupère une prestation spécifique par son ID
 * @param {number|string} id - ID de la prestation à récupérer
 * @returns {Promise<Object>} Prestation trouvée
 */
export const getServiceById = async (id) => {
  try {
    console.log("🔍 Récupération de la prestation avec l'ID :", id);
    const response = await axios.get(`${API_URL}/api/invoices/${id}`);
    console.log("🔍 Prestation trouvée :", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de la prestation :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};