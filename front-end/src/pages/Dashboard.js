import React, { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import BarChart from "../components/BarChart";
import { FaDollarSign, FaUsers, FaChartLine } from "react-icons/fa";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });

  const totalCustomers = customers.length;
  const totalInvoices = 120;
  const totalAmount = 50000;
  const topServices = [
    { name: "Service A", count: 30 },
    { name: "Service B", count: 45 },
    { name: "Service C", count: 15 },
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomers();
      setCustomers(data);

      const labels = data.map((customer) => customer.name);
      const values = data.map(() => Math.floor(Math.random() * 100));

      setChartData({ labels, values });
    };
    fetchCustomers();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Clients Totals</h3>
              <p className="text-lg">{totalCustomers}</p>
            </div>
            <FaUsers size={40} className="text-blue-500" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Total Facturé</h3>
              <p className="text-lg">${totalAmount}</p>
            </div>
            <FaDollarSign size={40} className="text-green-500" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Factures Générées</h3>
              <p className="text-lg">{totalInvoices}</p>
            </div>
            <FaChartLine size={40} className="text-yellow-500" />
          </div>
        </div>

        {/* Graphique des clients */}
        <BarChart data={chartData} />

        {/* Top 3 des Services */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Top 3 des Services</h2>
        <ul className="list-disc pl-6">
          {topServices.map((service, index) => (
            <li key={index} className="text-lg">
              {service.name}: {service.count} demandes
            </li>
          ))}
        </ul>

        {/* Derniers Clients */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Derniers Clients</h2>
        <ul className="list-disc pl-6">
          {customers.slice(0, 5).map((customer) => (
            <li key={customer.id} className="text-lg">
              {customer.name} - {customer.email}
            </li>
          ))}
        </ul>

        {/* Comparaison Mensuelle */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Comparaison Mensuelle
        </h2>
        <div className="flex gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
            <p className="text-xl">
              Ce mois-ci: <span className="font-semibold">${1200}</span>
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
            <p className="text-xl">
              Le mois dernier: <span className="font-semibold">${1000}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
