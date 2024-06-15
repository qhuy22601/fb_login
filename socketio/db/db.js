const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("chat", "root", "password", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

module.exports = sequelize;