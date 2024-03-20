const sequelize = require("../db/index");
const { DataTypes } = require("sequelize");

const UserBook = sequelize.define("UserBook", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = UserBook;
