"use strict";
const Sequelize = require("sequelize");
exports.PrestadorModelGenerator = (sequelize) => {
    return sequelize.define("Prestador", {
        cnpj: Sequelize.STRING
    });
};
