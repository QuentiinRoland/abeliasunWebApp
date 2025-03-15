const Employee = require("./Employee");
const InvoiceEmployee = require("./InvoiceEmployee");
const Invoice = require("./Invoice");

// Définition des associations
const defineAssociations = () => {
  // Relation entre Employee et InvoiceEmployee
  Employee.hasMany(InvoiceEmployee);
  InvoiceEmployee.belongsTo(Employee);

  // Relation entre Invoice et InvoiceEmployee
  Invoice.hasMany(InvoiceEmployee);
  InvoiceEmployee.belongsTo(Invoice);
};

module.exports = defineAssociations;
