'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Messages.init(
    {
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      senderId: DataTypes.INTEGER,
      message: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Messages",
    }
  );
  return Messages;
};