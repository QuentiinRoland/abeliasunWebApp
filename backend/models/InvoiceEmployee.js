const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InvoiceEmployee = sequelize.define("InvoiceEmployee", {
  hours: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = InvoiceEmployee;
