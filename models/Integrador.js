"use strict";
const Sequelize = require("sequelize");
exports.IntegradorModelGenerator = (sequelize) => {
    return sequelize.define("Integrador", {
        cnpj: Sequelize.STRING
    });
};
