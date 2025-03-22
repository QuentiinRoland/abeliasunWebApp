import React, { useState } from "react";
import { updateEmployee } from "../../services/employeeService";

export const EmployeeDetailsModal = ({ employee, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateEmployee = async () => {
    try {
      await updateEmployee(employee.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-6">Détails de l'employé</h2>
        
        {!isEditing ? (
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Nom</h3>
              <p className="text-lg">{employee.name || "Non spécifié"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Email</h3>
              <p className="text-lg">{employee.email || "Non spécifié"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Téléphone</h3>
              <p className="text-lg">{employee.phone || "Non spécifié"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-gray-500">Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-500">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-500">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mt-1"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                onClick={handleUpdateEmployee}
              >
                Enregistrer
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-full hover:bg-gray-400"
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-full hover:bg-gray-400"
                onClick={onClose}
              >
                Fermer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal