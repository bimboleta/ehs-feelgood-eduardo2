"use strict";
const Sequelize = require("sequelize");
const Service_1 = require("./Service");
const Contrato_1 = require("./Contrato");
const Prestador_1 = require("./Prestador");
const Cliente_1 = require("./Cliente");
const sequelize = new Sequelize('e-feelgood', 'kiki', 'bobobobo!1', {
    host: 'e-feelgood.database.windows.net',
    dialect: 'mssql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        encrypt: true
    }
});
exports.Service = Service_1.ServiceModelGenerator(sequelize);
exports.Contrato = Contrato_1.ContratoModelGenerator(sequelize);
exports.Cliente = Cliente_1.ClienteModelGenerator(sequelize);
exports.Prestador = Prestador_1.PrestadorModelGenerator(sequelize);
exports.Contrato.belongsTo(exports.Service);
exports.Contrato.belongsTo(exports.Cliente);
exports.Contrato.belongsTo(exports.Prestador);
exports.Service.hasMany(exports.Contrato);
exports.Service.belongsTo(exports.Prestador);
exports.Prestador.hasMany(exports.Contrato);
exports.Prestador.hasMany(exports.Service);
exports.Cliente.hasMany(exports.Contrato);
sequelize.sync({ force: true }).then(() => {
    exports.Service.create({ name: "Construir parede", description: "Parede legal" });
});
