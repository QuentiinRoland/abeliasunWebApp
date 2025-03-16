import React, { useState, useEffect } from "react";
import {
  getCustomers,
  addCustomers,
  deleteCustomers,
} from "../services/customerService";
import { CustomerDetailsModal } from "../components/Modal/customerDetails";
import { FaTrash, FaFileExcel } from "react-icons/fa";
import { ExcelImportModal } from "../components/ExcelImport"; // Importation du nouveau composant

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // État pour la modal d'import
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [additionalEmail, setAdditionalEmail] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false); // État pour notifier l'importation réussie
  const [importedCount, setImportedCount] = useState(0); // Compteur de clients importés

  useEffect(() => {
    refreshCustomer();
  }, []);

  const refreshCustomer = async () => {
    const data = await getCustomers();
    setCustomers(data);
    setFilteredCustomers(data);
  };
  
  useEffect(() => {
    const fetchCustomers = async () => {
      console.log("Fetching customers...");
      const data = await getCustomers();
      console.log("Customers fetched:", data);
      setCustomers(data);
      setFilteredCustomers(data);
    };
    fetchCustomers();
  }, []);

  // Réinitialiser l'état d'importation après 5 secondes
  useEffect(() => {
    if (importSuccess) {
      const timer = setTimeout(() => {
        setImportSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const result = customers.filter((customer) =>
      customer.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredCustomers(result);
  };

  const handleAddCustomer = async () => {
    try {
      const customerData = {
        name,
        email,
        phone,
        street,
        city,
        postalCode,
        additionalEmail,
      };
      console.log("Adding customer:", customerData);
      const newCustomer = await addCustomers(customerData);
      if (newCustomer) {
        console.log("New customer added:", newCustomer);
        setCustomers((prevCustomer) => [...prevCustomer, newCustomer]);
        setFilteredCustomers((prevCustomer) => [...prevCustomer, newCustomer]);
        await refreshCustomer();
      }
      setShowModal(false);
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du client :", error);
    }
  };

  const handleShowDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseModal = async () => {
    setSelectedCustomer(null);
    await refreshCustomer();
  };

  const handleDeleteCustomer = async (customerId) => {
    await deleteCustomers(customerId);
    setCustomers((prevCustomer) =>
      prevCustomer.filter((customer) => customer.id !== customerId)
    );
    setFilteredCustomers((prevCustomer) =>
      prevCustomer.filter((customer) => customer.id !== customerId)
    );
    await refreshCustomer();
  };

  // Gestionnaire pour l'importation réussie
  const handleImportSuccess = (count) => {
    setImportedCount(count);
    setImportSuccess(true);
    refreshCustomer(); // Rafraîchir la liste des clients
  };

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Liste des clients</h1>

        {importSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>
              <strong>Importation réussie!</strong> {importedCount} clients ont été importés avec succès.
            </span>
            <button onClick={() => setImportSuccess(false)} className="text-green-700">
              <FaTrash size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex items-center">
            <h2 className="text-lg font-semibold mr-2">Total clients :</h2>
            <p className="text-3xl font-bold text-green-700">
              {customers.length}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm px-6 py-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 rounded-lg px-4 py-2 flex-grow bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-full shadow-sm hover:bg-green-700 transition duration-300"
              onClick={() => setShowModal(true)}
            >
              Ajouter un client
            </button>
          </div>
        </div>

        <div className="mt-6">
          <table className="min-w-full table-auto bg-white border rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                {[
                  "Nom",
                  "Email",
                  "Téléphone",
                  "Rue",
                  "Ville",
                  "Code postal",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-sm font-semibold border-b"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="px-4 py-2">{customer.name}</td>
                    <td className="px-4 py-2">{customer.email}</td>
                    <td className="px-4 py-2">{customer.phone}</td>
                    <td className="px-4 py-2">{customer.street}</td>
                    <td className="px-4 py-2">{customer.city}</td>
                    <td className="px-4 py-2">{customer.postalCode}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
                          onClick={() => handleShowDetails(customer)}
                        >
                          Détail
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            onClose={handleCloseModal}
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Ajouter un client</h2>
              <input
                type="text"
                placeholder="Nom du client"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Rue"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
                />
                <input
                  type="text"
                  placeholder="Code postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
                />
              </div>
              <input
                type="email"
                placeholder="Email du client"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                  onClick={handleAddCustomer}
                >
                  Confirmer
                </button>
                <button
                  className="bg-gray-300 px-4 py-2 rounded-full hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'importation Excel */}
        <div className="flex justify-end mt-6">
          <button 
            className="bg-green-600 text-white px-6 py-2 rounded-full shadow-sm hover:bg-green-700 flex items-center gap-2"
            onClick={() => setShowImportModal(true)}
          >
            <FaFileExcel />
            Importer un fichier Excel
          </button>
        </div>

        {/* Modal d'importation Excel */}
        <ExcelImportModal 
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
}