import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoAbeliasun from "../assets/logos/abeliasunLogo.png";
import {
  FiHome,
  FiBarChart,
  FiUser,
  FiSettings,
  FiBriefcase,
} from "react-icons/fi";

const Navbar = () => {
  const location = useLocation(); // Pour connaître la page active

  const navItems = [
    { to: "/", label: "Accueil", icon: <FiHome size={20} /> },
    { to: "/clients", label: "Clients", icon: <FiUser size={20} /> },
    {
      to: "/prestations",
      label: "Prestations",
      icon: <FiBarChart size={20} />,
    },
    { to: "/employes", label: "Employés", icon: <FiBriefcase size={20} /> },
    { to: "/account", label: "Compte", icon: <FiSettings size={20} /> },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-100 p-5 flex flex-col items-center border-r border-gray-300">
      <div className="flex items-center justify-center mb-8">
        <img
          src={logoAbeliasun}
          alt="Logo"
          className="w-32 h-32 object-contain"
        />
      </div>

      <ul className="w-full">
        {navItems.map((item) => (
          <li key={item.to} className="w-full mb-4">
            <Link
              to={item.to}
              className={`flex items-center text-lg font-medium p-2 rounded-md transition duration-300 ${
                location.pathname === item.to
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-green-500 hover:text-white"
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
