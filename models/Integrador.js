"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.IntegradorModelGenerator = (sequelize) => {
    return sequelize.define("Integrador", {
        cnpj: Sequelize.STRING
    });
};
