"use strict";
const Sequelize = require("sequelize");
exports.ContratoModelGenerator = (sequelize) => {
    let model = sequelize.define("Contrato", {
        estado: Sequelize.TEXT,
        gastos: Sequelize.TEXT,
        cronograma: Sequelize.TEXT
    });
    return model;
};
