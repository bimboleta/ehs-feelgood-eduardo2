"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Sequelize = require("sequelize");
const Service_1 = require("./Service");
const Contrato_1 = require("./Contrato");
const Cliente_1 = require("./Cliente");
const Integrador_1 = require("./Integrador");
const ContratoServicoEspecifico_1 = require("./ContratoServicoEspecifico");
const Fornecedor_1 = require("./Fornecedor");
const ServicoEspecifico_1 = require("./ServicoEspecifico");
const Tarifacao_1 = require("./Tarifacao");
exports.sequelize = new Sequelize('e-feelgood', 'kiki', 'bobobobo!1', {
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
exports.Cliente = Cliente_1.ClienteModelGenerator(exports.sequelize);
exports.Contrato = Contrato_1.ContratoModelGenerator(exports.sequelize);
exports.ContratoServicoEspecifico = ContratoServicoEspecifico_1.ContratoServicoEspecificoModelGenerator(exports.sequelize);
exports.Fornecedor = Fornecedor_1.FornecedorModelGenerator(exports.sequelize);
exports.Integrador = Integrador_1.IntegradorModelGenerator(exports.sequelize);
exports.Service = Service_1.ServiceModelGenerator(exports.sequelize);
exports.ServicoEspecifico = ServicoEspecifico_1.ServicoEspecificoModelGenerator(exports.sequelize);
exports.Tarifacao = Tarifacao_1.TarifacaoModelGenerator(exports.sequelize);
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
exports.sequelize.sync({ force: false }).then(() => __awaiter(this, void 0, void 0, function* () {
    // let cliente = await Cliente.create({cpf: "391.854.828-70"});
    // let integrador = await Integrador.create({cnpj: "02.032.012/060-12"});
    // let parede = await Service.create({name: "Construir parede", description: "Parede legal", IntegradorId: integrador.id, disponivel: true});
    // await Service.create({name: "Assentar piso", description: "Os pisos mais bonitos que você já viu", IntegradorId: integrador.id, disponivel: true});
    // await Service.create({name: "Instalar seu fogão", description: "O fogão vai ficar melhor que nunca e sem problemas", IntegradorId: integrador.id, disponivel: true});
    // await Contrato.create({ClienteId: cliente.id, ServiceId: parede.id});
    // let fornecedor = await Fornecedor.create({cnpj: "02.032.012/060-13"});
    // let furarParede = await ServicoEspecifico.create({name: "Furar parede", description: "Faço todos os furos", FornecedorId: fornecedor.id, disponivel: true});
    // let pintarParede = await ServicoEspecifico.create({name: "Pintar parede", description: "Pintar paredes de quaisquer cores", FornecedorId: fornecedor.id, disponivel: true});
}));
