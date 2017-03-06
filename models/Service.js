"use strict";
const Sequelize = require("sequelize");
exports.ServiceModelGenerator = (sequelize) => {
    return sequelize.define("Service", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        disponivel: Sequelize.BOOLEAN
    });
};
