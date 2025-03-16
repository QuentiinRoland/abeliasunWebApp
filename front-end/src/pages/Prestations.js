import React, { useState, useEffect } from "react";
import { getServices, addService, deleteService, updateService } from "../services/prestationsService";

const Prestations = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    numberInvoice: "",
    customerId: "",
    pictures: []
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les factures. Veuillez réessayer plus tard.");
      console.error("Erreur lors du chargement des factures :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      const newInvoice = await addService(formData);
      setInvoices([...invoices, newInvoice]);
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().substring(0, 10),
        numberInvoice: "",
        customerId: "",
        pictures: []
      });
    } catch (err) {
      setError("Erreur lors de l'ajout de la facture.");
      console.error("Erreur lors de l'ajout de la facture :", err);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        await deleteService(id);
        setInvoices(invoices.filter(invoice => invoice.id !== id));
        if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice(null);
        }
      } catch (err) {
        setError("Erreur lors de la suppression de la facture.");
        console.error("Erreur lors de la suppression :", err);
      }
    }
  };

  const handleEditInvoice = (invoice) => {
    setFormData({
      date: new Date(invoice.date).toISOString().substring(0, 10),
      numberInvoice: invoice.numberInvoice || "",
      customerId: invoice.customerId || "",
      pictures: invoice.pictures || []
    });
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      const updatedInvoice = await updateService(selectedInvoice.id, formData);
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedInvoice.id ? updatedInvoice : invoice
      ));
      setShowForm(false);
      setSelectedInvoice(null);
      setFormData({
        date: new Date().toISOString().substring(0, 10),
        numberInvoice: "",
        customerId: "",
        pictures: []
      });
    } catch (err) {
      setError("Erreur lors de la mise à jour de la facture.");
      console.error("Erreur lors de la mise à jour :", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Format de date pour l'affichage
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des factures...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
      <strong className="font-bold">Erreur !</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Factures</h1>
      
      <div className="mb-6">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            setSelectedInvoice(null);
            setFormData({
              date: new Date().toISOString().substring(0, 10),
              numberInvoice: "",
              customerId: "",
              pictures: []
            });
            setShowForm(true);
          }}
        >
          Ajouter une facture
        </button>
      </div>

      {/* Formulaire d'ajout/édition */}
      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{selectedInvoice ? "Modifier la facture" : "Ajouter une facture"}</h2>
          <form onSubmit={selectedInvoice ? handleUpdateInvoice : handleAddInvoice}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberInvoice">
                Numéro de facture
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                id="numberInvoice"
                name="numberInvoice"
                value={formData.numberInvoice}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerId">
                ID Client
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {selectedInvoice ? "Mettre à jour" : "Ajouter"}
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedInvoice(null);
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des factures */}
      <div className="bg-white shadow-md rounded overflow-hidden">
        {invoices.length === 0 ? (
          <p className="text-center py-4 text-gray-600">Aucune facture disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Numéro</th>
                  <th className="py-3 px-6 text-center">Client</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{invoice.id}</td>
                    <td className="py-3 px-6 text-left">{formatDate(invoice.date)}</td>
                    <td className="py-3 px-6 text-left">{invoice.numberInvoice}</td>
                    <td className="py-3 px-6 text-center">
                      {invoice.customer ? invoice.customer.name : invoice.customerId}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 focus:outline-none"
                          title="Voir détails"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded hover:bg-yellow-200 focus:outline-none"
                          title="Modifier"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 focus:outline-none"
                          title="Supprimer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Affichage détaillé d'une facture */}
      {selectedInvoice && !showForm && (
        <div className="mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-2xl font-semibold mb-4">Détails de la facture N°{selectedInvoice.numberInvoice}</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2"><span className="font-semibold">ID:</span> {selectedInvoice.id}</p>
            <p className="mb-2"><span className="font-semibold">Date:</span> {formatDate(selectedInvoice.date)}</p>
            <p className="mb-2">
              <span className="font-semibold">Client:</span> {selectedInvoice.customer ? selectedInvoice.customer.name : selectedInvoice.customerId}
            </p>
            
            {/* Affichage des images si disponibles */}
            {selectedInvoice.pictures && selectedInvoice.pictures.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Images:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedInvoice.pictures.map((pic, index) => (
                    <div key={index} className="border rounded p-2">
                      <img src={pic} alt={`Facture ${selectedInvoice.numberInvoice} - Image ${index + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Affichage du tagline si disponible */}
            {selectedInvoice.tagline && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Signature:</h3>
                <div className="border rounded p-2">
                  <img src={selectedInvoice.tagline} alt="Signature" className="max-w-full h-auto" />
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setSelectedInvoice(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestations;