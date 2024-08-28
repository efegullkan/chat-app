const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Message = sequelize.define('Message', {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isSeen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
  });

module.exports = Message;