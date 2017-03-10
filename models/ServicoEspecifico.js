"use strict";
const Sequelize = require("sequelize");
exports.ServicoEspecificoModelGenerator = (sequelize) => {
    return sequelize.define("ServicoEspecifico", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        disponivel: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
};
