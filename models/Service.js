"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.ServiceModelGenerator = (sequelize) => {
    return sequelize.define("Service", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        disponivel: Sequelize.BOOLEAN,
        enabled: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
};
