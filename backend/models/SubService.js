const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Service = require("./Service");

const SubService = sequelize.define("SubService", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

SubService.belongsTo(Service, { foreignKey: "serviceId", as: "service" });
Service.hasMany(SubService, { foreignKey: "serviceId", as: "subservices" });

module.exports = SubService;
