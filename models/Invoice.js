const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Customer = require("./Customer");
const Employee = require("./Employee");
const InvoiceEmployee = require("./InvoiceEmployee");
const Service = require("./Service");
const SubService = require("./SubService");

const Invoice = sequelize.define("Invoice", {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  numberInvoice: {
    type: DataTypes.INTEGER,
  },
  pictures: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
  },
  tagline: {
    type: DataTypes.TEXT,
  },
});

Invoice.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

Invoice.belongsToMany(Employee, {
  through: InvoiceEmployee,
  as: "employees",
});

Employee.belongsToMany(Invoice, {
  through: InvoiceEmployee,
  as: "invoices",
});

Invoice.belongsToMany(Service, {
  through: "InvoiceServices",
  as: "associatedServices",
});

Service.belongsToMany(Invoice, {
  through: "InvoiceServices",
  as: "invoices",
});

Invoice.belongsToMany(SubService, {
  through: "InvoiceSubServices",
  as: "selectedSubServices",
});

SubService.belongsToMany(Invoice, {
  through: "InvoiceSubServices",
  as: "invoices",
});

module.exports = Invoice;
