import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaTimes, FaCheck } from 'react-icons/fa';

// Service pour importer les clients
const importCustomersFromExcel = async (customers) => {
  try {
    const response = await fetch('/api/customers/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customers }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'importation des clients:', error);
    throw error;
  }
};

export const ExcelImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [mappings, setMappings] = useState({
    name: '',
    email: '',
    additionalEmail: '',
    phone: '',
    street: '',
    city: '',
    postalCode: ''
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [importStats, setImportStats] = useState(null);

  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Récupérer la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          // Récupérer les en-têtes (première ligne)
          const excelHeaders = jsonData[0];
          setHeaders(excelHeaders);
          
          // Prévisualiser quelques lignes
          const previewData = jsonData.slice(1, Math.min(6, jsonData.length)); // 5 premières lignes après les en-têtes
          setPreview(previewData);

          // Tentative de mapping automatique
          const autoMapping = {};
          excelHeaders.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('nom') || lowerHeader.includes('name')) {
              autoMapping.name = header;
            } else if (lowerHeader.includes('email') && !lowerHeader.includes('additional')) {
              autoMapping.email = header;
            } else if (lowerHeader.includes('additionalEmail') || lowerHeader.includes('additional email')) {
              autoMapping.additionalEmail = header;
            } else if (lowerHeader.includes('tel') || lowerHeader.includes('phone')) {
              autoMapping.phone = header;
            } else if (lowerHeader.includes('rue') || lowerHeader.includes('street') || lowerHeader.includes('adresse')) {
              autoMapping.street = header;
            } else if (lowerHeader.includes('ville') || lowerHeader.includes('city')) {
              autoMapping.city = header;
            } else if (lowerHeader.includes('code') || lowerHeader.includes('postal') || lowerHeader.includes('zip')) {
              autoMapping.postalCode = header;
            }
          });
          
          setMappings(autoMapping);
          setStep(2);
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel:', error);
        setError('Le fichier sélectionné n\'est pas un fichier Excel valide.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Gestion du changement de mapping
  const handleMappingChange = (customerField, excelColumn) => {
    setMappings({
      ...mappings,
      [customerField]: excelColumn
    });
  };

  // Préparation des données
  const prepareData = () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir en JSON avec les en-têtes
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transformer les données selon le mapping
        const mappedCustomers = jsonData.map(row => {
          const customer = {};
          
          // Pour chaque champ du modèle Customer
          Object.keys(mappings).forEach(field => {
            const excelColumn = mappings[field];
            
            if (excelColumn && row[excelColumn] !== undefined) {
              if (field === 'additionalEmail') {
                // Traiter le champ additionalEmail comme un tableau JSON
                const emails = row[excelColumn] ? String(row[excelColumn]).split(',').map(email => email.trim()) : [];
                customer[field] = emails;
              } else if (field === 'postalCode') {
                // Convertir le code postal en nombre
                customer[field] = row[excelColumn] ? parseInt(row[excelColumn], 10) : null;
              } else {
                customer[field] = row[excelColumn];
              }
            }
          });
          
          return customer;
        });
        
        // Filtrer les clients valides (avec les champs obligatoires)
        const validCustomers = mappedCustomers.filter(customer => 
          customer.name && customer.email && customer.phone && customer.street
        );

        setCustomers(validCustomers);
        setImportStats({
          total: mappedCustomers.length,
          valid: validCustomers.length,
          invalid: mappedCustomers.length - validCustomers.length
        });
        
        setLoading(false);
        setStep(3);
      } catch (error) {
        console.error('Erreur lors de la préparation des données:', error);
        setError('Erreur lors de la préparation des données. Vérifiez le format du fichier.');
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Importer les données
  const importData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await importCustomersFromExcel(customers);
      
      if (result.success) {
        setStep(4);
        // Notifier le parent du succès
        if (onImportSuccess) {
          onImportSuccess(result.importedCount || customers.length);
        }
      } else {
        setError(result.message || 'Erreur lors de l\'importation des clients.');
      }
    } catch (error) {
      setError('Erreur lors de la communication avec le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFile(null);
    setHeaders([]);
    setPreview([]);
    setMappings({
      name: '',
      email: '',
      additionalEmail: '',
      phone: '',
      street: '',
      city: '',
      postalCode: ''
    });
    setStep(1);
    setLoading(false);
    setCustomers([]);
    setError(null);
    setImportStats(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Importation de clients depuis Excel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  step === s 
                    ? 'bg-green-600 text-white' 
                    : step > s 
                      ? 'bg-green-300 text-white' 
                      : 'bg-gray-300 text-gray-700'
                }`}>
                  {s}
                </div>
                <div className="text-sm text-center">
                  {s === 1 && "Sélection du fichier"}
                  {s === 2 && "Mapping des colonnes"}
                  {s === 3 && "Validation des données"}
                  {s === 4 && "Importation terminée"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
              <FaFileExcel size={48} className="mx-auto mb-4 text-green-600" />
              <p className="mb-4">Sélectionnez un fichier Excel (.xlsx, .xls)</p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="bg-green-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-green-700"
              >
                Parcourir...
              </label>
            </div>
            {file && (
              <div className="bg-green-100 p-3 rounded-lg flex items-center">
                <FaFileExcel className="text-green-600 mr-2" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Mapping des colonnes Excel avec les champs client</h3>
            <p className="mb-4 text-gray-600">Veuillez associer chaque colonne de votre fichier Excel aux champs correspondants du modèle client.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <select
                  value={mappings.name}
                  onChange={(e) => handleMappingChange('name', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <select
                  value={mappings.email}
                  onChange={(e) => handleMappingChange('email', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Emails additionnels
                </label>
                <select
                  value={mappings.additionalEmail}
                  onChange={(e) => handleMappingChange('additionalEmail', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Les emails multiples doivent être séparés par des virgules</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <select
                  value={mappings.phone}
                  onChange={(e) => handleMappingChange('phone', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rue <span className="text-red-500">*</span>
                </label>
                <select
                  value={mappings.street}
                  onChange={(e) => handleMappingChange('street', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ville
                </label>
                <select
                  value={mappings.city}
                  onChange={(e) => handleMappingChange('city', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Code postal
                </label>
                <select
                  value={mappings.postalCode}
                  onChange={(e) => handleMappingChange('postalCode', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  <option value="">-- Sélectionner une colonne --</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Aperçu des données</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    {headers.map((header, index) => (
                      <th key={index} className="border p-2 text-left text-sm">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border p-2 text-sm">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Validation des données</h3>
            
            {importStats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-lg font-bold">{importStats.total}</p>
                  <p className="text-sm">Total des lignes</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-lg font-bold">{importStats.valid}</p>
                  <p className="text-sm">Clients valides</p>
                </div>
                <div className={`p-4 rounded-lg ${importStats.invalid > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <p className="text-lg font-bold">{importStats.invalid}</p>
                  <p className="text-sm">Données ignorées</p>
                </div>
              </div>
            )}
            
            <p className="mb-4 text-sm text-gray-600">
              Les lignes avec des champs obligatoires manquants (nom, email, téléphone, rue) seront ignorées pendant l'importation.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">Aperçu des clients à importer</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left text-sm">Nom</th>
                    <th className="border p-2 text-left text-sm">Email</th>
                    <th className="border p-2 text-left text-sm">Téléphone</th>
                    <th className="border p-2 text-left text-sm">Rue</th>
                    <th className="border p-2 text-left text-sm">Ville</th>
                    <th className="border p-2 text-left text-sm">Code postal</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 5).map((customer, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border p-2 text-sm">{customer.name}</td>
                      <td className="border p-2 text-sm">{customer.email}</td>
                      <td className="border p-2 text-sm">{customer.phone}</td>
                      <td className="border p-2 text-sm">{customer.street}</td>
                      <td className="border p-2 text-sm">{customer.city || '-'}</td>
                      <td className="border p-2 text-sm">{customer.postalCode || '-'}</td>
                    </tr>
                  ))}
                  {customers.length > 5 && (
                    <tr>
                      <td colSpan="6" className="border p-2 text-center text-sm text-gray-500">
                        + {customers.length - 5} autres clients
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Importation réussie!</h3>
            <p className="mb-4">
              {importStats?.valid} clients ont été importés avec succès.
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-3">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file}
              >
                Continuer
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Retour
              </button>
              <button
                onClick={prepareData}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!mappings.name || !mappings.email || !mappings.phone || !mappings.street || loading}
              >
                {loading ? 'Chargement...' : 'Valider le mapping'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Retour
              </button>
              <button
                onClick={importData}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={customers.length === 0 || loading}
              >
                {loading ? 'Importation en cours...' : `Importer ${customers.length} clients`}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100"
              >
                Nouvelle importation
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                Terminer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};