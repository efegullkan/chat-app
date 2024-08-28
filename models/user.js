const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const User = sequelize.define("user", {
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resim: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'not-pp.jpg'
    },
    socketId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastActive: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {timestamps: true});

module.exports = User;