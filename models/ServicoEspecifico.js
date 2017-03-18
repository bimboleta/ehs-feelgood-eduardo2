"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.ServicoEspecificoModelGenerator = (sequelize) => {
    return sequelize.define("ServicoEspecifico", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        disponivel: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
};
