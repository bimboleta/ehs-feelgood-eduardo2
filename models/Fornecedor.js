"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.FornecedorModelGenerator = (sequelize) => {
    return sequelize.define("Fornecedor", {
        cnpj: Sequelize.STRING
    });
};
