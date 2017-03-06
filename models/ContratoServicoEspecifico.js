"use strict";
const Sequelize = require("sequelize");
exports.ContratoServicoEspecificoModelGenerator = (sequelize) => {
    let model = sequelize.define("ContratoServicoEspecifico", {
        estado: Sequelize.TEXT,
        gastos: Sequelize.TEXT,
        cronograma: Sequelize.TEXT
    });
    return model;
};
