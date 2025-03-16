import React, { useState, useEffect } from "react";
import { getServices, addService, deleteService, updateService } from "../services/prestationsService";
import PrestationPDF, { PrestationPDFDownload } from "../components/pdfReport";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { createRoot } from 'react-dom/client';

const Prestations = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    numberInvoice: "",
    customerId: "",
    pictures: [],
    tagline: "",
    employeeIds: [],
    serviceIds: [],
    subServiceIds: []
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
        pictures: [],
        tagline: "",
        employeeIds: [],
        serviceIds: [],
        subServiceIds: []
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
      pictures: invoice.pictures || [],
      tagline: invoice.tagline || "",
      employeeIds: invoice.employees ? invoice.employees.map(emp => emp.id) : [],
      serviceIds: invoice.associatedServices ? invoice.associatedServices.map(svc => svc.id) : [],
      subServiceIds: invoice.selectedSubServices ? invoice.selectedSubServices.map(sub => sub.id) : []
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
        pictures: [],
        tagline: "",
        employeeIds: [],
        serviceIds: [],
        subServiceIds: []
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

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData({ ...formData, [name]: selectedValues });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const reader = new FileReader();

    files.forEach(file => {
      reader.onloadend = () => {
        setFormData(prevData => ({
          ...prevData,
          pictures: [...prevData.pictures, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTaglineUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prevData => ({
          ...prevData,
          tagline: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailTo) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    
    try {
      setSendingEmail(true);
      
      const formData = new FormData();
      formData.append('email', emailTo);
      
      const pdfBlob = await new Promise((resolve, reject) => {
        try {
          const container = document.createElement('div');
          container.style.display = 'none';
          document.body.appendChild(container);
          
          const root = createRoot(container);
          
          root.render(
            <BlobProvider document={<PrestationPDF invoice={selectedInvoice} />}>
              {({ blob, loading, error }) => {
                if (error) {
                  reject(error);
                  return null;
                }
                
                if (!loading && blob) {
                  setTimeout(() => {
                    resolve(blob);
                    root.unmount();
                    container.remove();
                  }, 0);
                }
                return null;
              }}
            </BlobProvider>
          );
        } catch (error) {
          reject(error);
        }
      });
      
      formData.append('pdfFile', pdfBlob, `prestation_${selectedInvoice.numberInvoice}.pdf`);
      
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/invoices/${selectedInvoice.id}/send-email`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }
      
      setSendingEmail(false);
      setShowEmailForm(false);
      setEmailTo("");
      alert("Le rapport a été envoyé avec succès à " + emailTo);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email.");
      console.error("Erreur lors de l'envoi de l'email :", err);
      setSendingEmail(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Prestations</h1>
      
      <div className="mb-6">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            setSelectedInvoice(null);
            setFormData({
              date: new Date().toISOString().substring(0, 10),
              numberInvoice: "",
              customerId: "",
              pictures: [],
              tagline: "",
              employeeIds: [],
              serviceIds: [],
              subServiceIds: []
            });
            setShowForm(true);
          }}
        >
          Ajouter une prestation
        </button>
      </div>

      {/* Formulaire d'ajout/édition */}
      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{selectedInvoice ? "Modifier la prestation" : "Ajouter une prestation"}</h2>
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
                Numéro de prestation
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
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceIds">
                Services
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="serviceIds"
                name="serviceIds"
                multiple
                value={formData.serviceIds}
                onChange={handleMultiSelectChange}
              >
                {/* Options pour les services */}
                <option value="1">Entretien</option>
                <option value="2">Aménagement</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs services</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pictures">
                Images
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="pictures"
                name="pictures"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.pictures.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {formData.pictures.map((pic, index) => (
                    <div key={index} className="relative">
                      <img src={pic} alt={`Preview ${index}`} className="h-24 w-24 object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={() => {
                          const newPictures = [...formData.pictures];
                          newPictures.splice(index, 1);
                          setFormData({ ...formData, pictures: newPictures });
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tagline">
                Signature
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="tagline"
                name="tagline"
                accept="image/*"
                onChange={handleTaglineUpload}
              />
              {formData.tagline && (
                <div className="mt-2">
                  <img src={formData.tagline} alt="Signature Preview" className="h-24 object-contain rounded" />
                  <button
                    type="button"
                    className="ml-2 bg-red-500 text-white rounded px-2 py-1 text-xs"
                    onClick={() => setFormData({ ...formData, tagline: "" })}
                  >
                    Supprimer
                  </button>
                </div>
              )}
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
          <p className="text-center py-4 text-gray-600">Aucune prestation disponible</p>
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
                        <PDFDownloadLink
                          document={<PrestationPDF invoice={invoice} />}
                          fileName={`prestation_${invoice.numberInvoice}.pdf`}
                          className="bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 focus:outline-none"
                        >
                          {({ blob, url, loading, error }) =>
                            loading ? "..." : "PDF"
                          }
                        </PDFDownloadLink>
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
          <h2 className="text-2xl font-semibold mb-4">Détails de la prestation N°{selectedInvoice.numberInvoice}</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2"><span className="font-semibold">ID:</span> {selectedInvoice.id}</p>
            <p className="mb-2"><span className="font-semibold">Date:</span> {formatDate(selectedInvoice.date)}</p>
            <p className="mb-2">
              <span className="font-semibold">Client:</span> {selectedInvoice.customer ? selectedInvoice.customer.name : selectedInvoice.customerId}
            </p>
            
            {/* Affichage des services */}
            {selectedInvoice.associatedServices && selectedInvoice.associatedServices.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Services:</h3>
                <ul className="list-disc pl-5">
                  {selectedInvoice.associatedServices.map((service, index) => (
                    <li key={index} className="mb-1">{service.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Affichage des images si disponibles */}
            {selectedInvoice.pictures && selectedInvoice.pictures.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Images:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedInvoice.pictures.map((pic, index) => (
                    <div key={index} className="border rounded p-2">
                      <img src={pic} alt={`Prestation ${selectedInvoice.numberInvoice} - Image ${index + 1}`} className="w-full h-auto" />
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
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setSelectedInvoice(null)}
              >
                Fermer
              </button>
              
              <PDFDownloadLink
                document={<PrestationPDF invoice={selectedInvoice} />}
                fileName={`prestation_${selectedInvoice.numberInvoice}.pdf`}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {({ blob, url, loading, error }) =>
                  loading ? "Génération du PDF..." : "Télécharger PDF"
                }
              </PDFDownloadLink>
              
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setShowEmailForm(true)}
              >
                Envoyer par email
              </button>
              
              <button 
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setShowPdfPreview(true)}
              >
                Prévisualiser PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'envoi par email */}
      {showEmailForm && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Envoyer la prestation par email</h3>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailTo">
                  Adresse email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="email"
                  id="emailTo"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  required
                  placeholder="exemple@domaine.com"
                />
              </div>
              <div className="flex justify-between">
                <button 
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmailTo("");
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de prévisualisation PDF */}
      {showPdfPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 h-5/6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Prévisualisation PDF</h3>
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow bg-gray-100 rounded">
              <iframe
                title="PDF Preview"
                className="w-full h-full"
                src={URL.createObjectURL(
                  new Blob([<PrestationPDF invoice={selectedInvoice} />], { type: 'application/pdf' })
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestations;