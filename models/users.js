'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Users.init(
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Please input your full name",
          },
          notContains: {
            args: [" "],
            msg: "Name cannot with spaces",
          },
          len: {
            args: [3, 100],
            msg: "Name at least 3 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email already exists",
        },
        validate: {
          notEmpty: {
            args: true,
            msg: "Please input your email",
          },
          isEmail: {
            args: true,
            msg: "Email is not valid",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Please input your password",
          },
          len: {
            args: [7, 100],
            msg: "Password minimum 7 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};