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
const jwt = require("jsonwebtoken");
const Keys_1 = require("../utils/Keys");
module.exports = function (app) {
    return __awaiter(this, void 0, void 0, function* () {
        // auth stubs
        app.get("/loginCliente", (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.cookie("authorization", jwt.sign({
                type: "Cliente",
                cpf: "391.854.828-70"
            }, Keys_1.SecretKey));
            res.redirect("/");
        }));
        app.get("/loginIntegrador", (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.cookie("authorization", jwt.sign({
                type: "Integrador",
                cnpj: "02.032.012/060-12"
            }, Keys_1.SecretKey));
            res.redirect("/");
        }));
        app.get("/loginFornecedor", (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.cookie("authorization", jwt.sign({
                type: "Fornecedor",
                cnpj: "02.032.012/060-13"
            }, Keys_1.SecretKey));
            res.redirect("/");
        }));
        // logout
        app.get("/logout", (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.cookie("authorization", null);
            res.redirect("/");
        }));
        // home page
        app.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req["user"]) {
                if (req["user"].type === "Fornecedor") {
                    res.redirect("/fornecedor");
                    return;
                }
                else if (req["user"].type === "Integrador") {
                    res.redirect("/integrador");
                    return;
                }
            }
            res.render('index', { title: 'Home', user: req["user"] });
        }));
        // Selecionar serviço
        app.post("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let query = req["body"];
            let services = yield Database_1.Service.findAll({
                where: {
                    name: {
                        $like: `%${query.serviceName}%`
                    }
                }
            });
            res.render("index", { title: "Home", services: services.map(s => s.name), user: req["user"] });
        }));
        // Integrador dash
        app.get("/integrador", (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req["user"] && req["user"].type === "Integrador") {
                let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj }, include: [Database_1.Service] });
                res.render("integrador", { title: "Integrador", user: req["user"], services: integrador.Services.map(s => s.name) });
                return;
            }
            res.redirect("/");
        }));
    });
};
