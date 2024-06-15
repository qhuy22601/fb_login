const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const User = sequelize.define(
  "User",
  {
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 20],
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
      validate: {
        len: [1, 20],
        is: /^[a-zA-Z0-9 ]*$/,
      },
    },
    locationX: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
    locationY: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);


// const UserFriend = sequelize.define(
//   "UserFriend",
//   {
//     isFriend: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//   },
//   { tableName: "userfriend", timestamps: false }
// );


// User.belongsToMany(User, {
//   as: "Friend",
//   foreignKey: "userId",
//   through: UserFriend,
// });

module.exports = User;
