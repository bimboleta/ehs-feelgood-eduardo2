"use strict";
const Sequelize = require("sequelize");
const Service_1 = require("./Service");
const Contrato_1 = require("./Contrato");
const Cliente_1 = require("./Cliente");
const Integrador_1 = require("./Integrador");
const ContratoServicoEspecifico_1 = require("./ContratoServicoEspecifico");
const Fornecedor_1 = require("./Fornecedor");
const ServicoEspecifico_1 = require("./ServicoEspecifico");
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
exports.Cliente = Cliente_1.ClienteModelGenerator(sequelize);
exports.Contrato = Contrato_1.ContratoModelGenerator(sequelize);
exports.ContratoServicoEspecifico = ContratoServicoEspecifico_1.ContratoServicoEspecificoModelGenerator(sequelize);
exports.Fornecedor = Fornecedor_1.FornecedorModelGenerator(sequelize);
exports.Integrador = Integrador_1.IntegradorModelGenerator(sequelize);
exports.Service = Service_1.ServiceModelGenerator(sequelize);
exports.ServicoEspecifico = ServicoEspecifico_1.ServicoEspecificoModelGenerator(sequelize);
exports.Contrato.belongsTo(exports.Service);
exports.Contrato.belongsTo(exports.Cliente);
exports.Service.hasMany(exports.Contrato);
exports.Cliente.hasMany(exports.Contrato);
exports.Service.belongsTo(exports.Integrador);
exports.Integrador.hasMany(exports.Service);
exports.ContratoServicoEspecifico.belongsTo(exports.Integrador);
exports.ContratoServicoEspecifico.belongsTo(exports.ServicoEspecifico);
exports.ServicoEspecifico.hasMany(exports.ContratoServicoEspecifico);
exports.Integrador.hasMany(exports.ContratoServicoEspecifico);
exports.ServicoEspecifico.belongsTo(exports.Fornecedor);
exports.Fornecedor.hasMany(exports.ServicoEspecifico);
sequelize.sync({ force: true }).then(() => {
    exports.Service.create({ name: "Construir parede", description: "Parede legal" });
});
