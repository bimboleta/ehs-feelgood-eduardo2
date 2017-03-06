"use strict";
const Sequelize = require("sequelize");
exports.FornecedorModelGenerator = (sequelize) => {
    return sequelize.define("Fornecedor", {
        cnpj: Sequelize.STRING
    });
};
