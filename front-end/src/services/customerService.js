// src/services/customersService.js
import axios from "axios";
const API_URL = "https://abeliasun-backend-5c08804f47f8.herokuapp.com";

export const getCustomers = async () => {
  try {
    console.log("🔍 Requête envoyée à :", `${API_URL}/api/customers`); // Debug URL
    const response = await axios.get(`${API_URL}/api/customers`);
    console.log("🔍 Réponse brute reçue :", response); // Debug Response

    if (!response.ok) throw new Error("Erreur lors du chargement des clients");

    const data = await response.json();
    console.log("🔍 Données reçues :", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur API :", error);
    return [];
  }
};

export const addCustomers = async (data) => {
  try {
    console.log("📡 Données envoyées à l'API :", data);
    const response = await axios.post(`${API_URL}/api/customers`, data);
    console.log("✅ Réponse de l'API :", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du client", error);
    throw error;
  }
};

export const deleteCustomers = async (id) => {
  try {
    console.log("🗑️ Suppression du client avec l'ID :", id);
    const response = await axios.delete(`${API_URL}/api/customers/${id}`);
    console.log("✅ Réponse de l'API (suppression) :", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression du client :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateCustomers = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/api/customers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la modification du client :",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
