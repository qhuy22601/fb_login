const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const {User} = require("./AuthModel")


const Friend = sequelize.define(
  "Friend",
  {
    isFriend:{
        type: DataTypes.BOOLEAN
    },
    isUserRequested:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
 
  },
  {
    timestamps: false,
  }
);

module.exports = Friend;
