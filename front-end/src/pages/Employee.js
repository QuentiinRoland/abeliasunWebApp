import React, { useEffect, useState } from "react";
import { addEmployee, getEmployee, deleteEmployee as removeEmployee, updateEmployee } from "../services/employeeService";
import EmployeeDetailsModal from "../components/Modal/employeeDetailsModal";
import { FaTrash } from "react-icons/fa";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    refreshEmployee();
  }, []);

  const refreshEmployee = async () => {
    const data = await getEmployee();
    setEmployees(data);
  };
  
  useEffect(() => {
    const fetchEmployees = async () => {
      console.log("Fetching employees...");
      setLoading(true);
      const data = await getEmployee();
      console.log("Employees fetched:", data);
      setEmployees(data || []);
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await removeEmployee(employeeId);
      setEmployees((prevEmployees) => 
        prevEmployees.filter((employee) => employee.id !== employeeId)
      );
      await refreshEmployee();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const employeeData = {
        name,
        email,
        phone,
      };
      console.log("Adding employee:", employeeData);
      const newEmployee = await addEmployee(employeeData);
      if (newEmployee) {
        console.log("New employee added:", newEmployee);
        setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
        await refreshEmployee();
      }
      setShowModal(false);
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
    }
  };

  const handleShowDetails = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseModal = async () => {
    setSelectedEmployee(null);
    await refreshEmployee();
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-gray-500">Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Liste des employés</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex items-center">
            <h2 className="text-lg font-semibold mr-2">Total employés :</h2>
            <p className="text-3xl font-bold text-green-700">
              {employees.length}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm px-6 py-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher un employé..."
              className="border border-gray-300 rounded-lg px-4 py-2 flex-grow bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-full shadow-sm hover:bg-green-700 transition duration-300"
              onClick={() => setShowModal(true)}
            >
              Ajouter un employé
            </button>
          </div>
        </div>

        <div className="mt-6">
          <table className="min-w-full table-auto bg-white border rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                {["Nom", "Email", "Téléphone", "Actions"].map((header) => (
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
              {employees.length > 0 ? (
                employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="px-4 py-2">{employee.name}</td>
                    <td className="px-4 py-2">{employee.email}</td>
                    <td className="px-4 py-2">{employee.phone}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
                          onClick={() => handleShowDetails(employee)}
                        >
                          Détail
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Aucun employé trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedEmployee && (
          <EmployeeDetailsModal
            employee={selectedEmployee}
            onClose={handleCloseModal}
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Ajouter un employé</h2>
              <input
                type="text"
                placeholder="Nom de l'employé"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <input
                type="email"
                placeholder="Email de l'employé"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full"
              />
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                  onClick={handleAddEmployee}
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
      </div>
    </div>
  );
};

export default Employee;