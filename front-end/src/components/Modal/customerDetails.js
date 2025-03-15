import React, { useState } from "react";
import { getCustomers, updateCustomers } from "../../services/customerService";

export const CustomerDetailsModal = ({ customer, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(customer);
  const [isLoading, setIsLoading] = useState(false);

  if (!customer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateData = async () => {
    setIsLoading(true);
    try {
      const { createdAt, updatedAt, ...sanitizedData } = formData;

      sanitizedData.id = parseInt(sanitizedData.id, 10);
      sanitizedData.postalCode = parseInt(sanitizedData.postalCode, 10);

      if (Array.isArray(sanitizedData.additionalEmail)) {
        sanitizedData.additionalEmail = JSON.stringify(
          sanitizedData.additionalEmail
        );
      }

      console.log("Données nettoyées complètes :", sanitizedData);
      await updateCustomers(sanitizedData.id, sanitizedData);

      const updatedCustomer = await getCustomers(sanitizedData.id);
      setFormData(updatedCustomer);

      alert("Client mis à jour avec succès !");
      onClose(sanitizedData);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour :",
        error.response?.data || error
      );
      alert("Erreur lors de la mise à jour des informations du client.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Modifier les détails du clients" : "Détails du client"}
        </h2>
        {isEditing ? (
          <>
            <div className="space-y-2">
              <div>
                <label className="block font-medium">Nom :</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-medium">Email :</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-medium">
                  Emails additionnels :
                </label>
                <textarea
                  name="additionalEmail"
                  value={
                    Array.isArray(formData.additionalEmail)
                      ? formData.additionalEmail.join(", ")
                      : formData.additionalEmail
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      additionalEmail: e.target.value
                        .split(",")
                        .map((email) => email.trim()),
                    });
                  }}
                  className="w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block font-medium">Téléphone :</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-medium">Rue :</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-medium">Ville :</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block font-medium">Code postal :</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleUpdateData}
                className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Enregistrer"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>Nom :</strong> {customer.name}
            </p>
            <p>
              <strong>Email :</strong> {customer.email}
            </p>
            <p>
              <strong>Email additionnel</strong> {customer.additionalEmail}
            </p>
            <p>
              <strong>Téléphone :</strong> {customer.phone}
            </p>
            <p>
              <strong>Rue :</strong> {customer.street}
            </p>
            <p>
              <strong>Ville :</strong> {customer.city}
            </p>
            <p>
              <strong>Code postal :</strong> {customer.postalCode}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#48A136] text-white px-4 py-2 mt-4 rounded-md"
              >
                Modifier
              </button>
              <button
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md"
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
