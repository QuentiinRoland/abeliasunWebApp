import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.labels, // Les labels des barres
    datasets: [
      {
        label: "Nombre de clients", // Titre de la série
        data: data.values, // Valeurs de chaque barre
        backgroundColor: "rgba(75,192,192,0.2)", // Couleur de fond des barres
        borderColor: "rgba(75,192,192,1)", // Couleur du bord des barres
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Graphique des clients", // Titre du graphique
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Clients: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
