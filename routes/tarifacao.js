"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Database_1 = require("../models/Database");
const AZURE_RATING = 0.092 / (60 * 60);
const MARK_UP = 2890000;
const AZURE_DATA_RATING = 74 / (5 * 1000 * 1000 * 1000);
Number.prototype.formatMoney = function (c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
module.exports = function (app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.get("/tarifacao", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let tarifacoes = yield Database_1.Tarifacao.findAll();
            for (let i = 0; i < tarifacoes.length; i++) {
                let t = tarifacoes[i];
                let cliente = yield Database_1.Cliente.find({ where: { cpf: t.identificador } });
                let numerosDeLinhasNoBanco = 1;
                if (cliente) {
                    numerosDeLinhasNoBanco += yield Database_1.Contrato.count({ where: { ClienteId: cliente.id } });
                }
                else {
                    let integrador = yield Database_1.Integrador.find({ where: { cnpj: t.identificador } });
                    if (integrador) {
                        numerosDeLinhasNoBanco += yield Database_1.Service.count({ where: { IntegradorId: integrador.id } });
                        numerosDeLinhasNoBanco += yield Database_1.ContratoServicoEspecifico.count({ where: { IntegradorId: integrador.id } });
                    }
                    else {
                        let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: t.identificador } });
                        numerosDeLinhasNoBanco += yield Database_1.ServicoEspecifico.count({ where: { FornecedorId: fornecedor.id } });
                    }
                }
                t.numerosDeLinhasNoBanco = numerosDeLinhasNoBanco;
            }
            tarifacoes.forEach((tarifacao) => tarifacao.valor =
                tarifacao.tempo * AZURE_RATING * (1 + MARK_UP / 100) +
                    tarifacao.numerosDeLinhasNoBanco * 200 * AZURE_DATA_RATING * (1 + MARK_UP / 100));
            res.render('tarifacao', {
                title: 'Home', user: req["user"], tarifacoes,
                searchRoute: "/"
            });
        }));
    });
};
