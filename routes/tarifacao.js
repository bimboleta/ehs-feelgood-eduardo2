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
const MARK_UP = 289000;
module.exports = function (app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.get("/tarifacao", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let tarifacoes = yield Database_1.Tarifacao.findAll();
            tarifacoes.forEach((tarifacao) => tarifacao.valor = tarifacao.tempo * AZURE_RATING * (1 + MARK_UP / 100));
            res.render('tarifacao', {
                title: 'Home', user: req["user"], tarifacoes,
                searchRoute: "/"
            });
        }));
    });
};
