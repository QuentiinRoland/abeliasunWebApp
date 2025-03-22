import React, { useEffect, useState } from "react";
import { addEmployee, getEmployee, deleteEmployee as removeEmployee, updateEmployee } from "../services/employeeService";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployee();
      setEmployees(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await removeEmployee(employeeId);
      setEmployees((prevEmployees) => 
        prevEmployees.filter((employee) => employee.id !== employeeId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Modes distincts pour éviter les confusions
  const handleAddNew = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setEditMode(false);
    setSelectedEmployeeId(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    if (!employee) return;
    
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
    });
    setEditMode(true);
    setSelectedEmployeeId(employee.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode && selectedEmployeeId) {
        const updatedEmployee = await updateEmployee(selectedEmployeeId, formData);
        setEmployees(
          employees.map((emp) => 
            emp.id === selectedEmployeeId ? updatedEmployee : emp
          )
        );
      } else {
        const newEmployee = await addEmployee(formData);
        setEmployees([...employees, newEmployee]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error(`Impossible de ${editMode ? 'modifier' : 'ajouter'} l'employé`, error);
    }
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-gray-500">Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Liste des employés</h2>
        <button 
          onClick={handleAddNew} 
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          Ajouter un employé
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editMode ? "Modifier l'employé" : "Ajouter un employé"}
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                >
                  {editMode ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center">
          <p className="text-gray-500 italic">Aucun employé trouvé</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-12 gap-4 font-bold bg-gray-100 p-3 rounded">
            <div className="col-span-3">Nom</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Téléphone</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {employees
            .filter(employee => employee)
            .map((employee) => (
              <div key={employee.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-white rounded shadow">
                <div className="col-span-3 font-medium">{employee.name}</div>
                <div className="col-span-4 overflow-hidden overflow-ellipsis">{employee.email}</div>
                <div className="col-span-3">{employee.phone}</div>
                <div className="col-span-2 flex space-x-2">
                  <button 
                    onClick={() => handleEdit(employee)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Employee;