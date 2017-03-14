"use strict";
const Sequelize = require("sequelize");
exports.TarifacaoModelGenerator = (sequelize) => {
    return sequelize.define("Tarifacao", {
        identificador: { type: Sequelize.STRING, unique: true },
        tempo: { type: Sequelize.DOUBLE, defaultValue: 0 }
    });
};
