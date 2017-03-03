"use strict";
const Sequelize = require("sequelize");
exports.ClienteModelGenerator = (sequelize) => {
    return sequelize.define("Cliente", {
        cpf: Sequelize.STRING
    });
};
