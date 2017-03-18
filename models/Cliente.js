"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.ClienteModelGenerator = (sequelize) => {
    return sequelize.define("Cliente", {
        cpf: { type: Sequelize.STRING, unique: true }
    });
};
