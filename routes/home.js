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
        function getUserContratos(user) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user && user.type === "Cliente") {
                    let cliente = yield Database_1.Cliente.find({ where: { cpf: user.cpf }, include: [{ model: Database_1.Contrato, include: [Database_1.Service] }] });
                    return cliente.Contratos.map(c => {
                        c.url = `cliente/contrato/${c.id}`;
                        return c;
                    });
                }
                return [];
            });
        }
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
            res.render('index', { title: 'Home', user: req["user"], contratos: yield getUserContratos(req["user"]) });
        }));
        // Selecionar serviço
        app.post("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let query = req["body"];
            let services = yield Database_1.Service.findAll({
                where: {
                    name: {
                        $like: `%${query.serviceName}%`
                    },
                    enabled: true
                }
            });
            res.render("index", {
                title: "Home", services: services.map(s => {
                    return {
                        name: s.name,
                        description: s.description,
                        contractRoute: `/cliente/contratar-servico/${s.id}`
                    };
                }), user: req["user"],
                contratos: yield getUserContratos(req["user"])
            });
        }));
        app.get("/cliente/contratar-servico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user = req["user"];
            let servico = yield Database_1.Service.findById(req.params["id"]);
            if (user.type === "Cliente" && servico) {
                let cliente = yield Database_1.Cliente.find({ where: { cpf: user.cpf } });
                let contrato = yield Database_1.Contrato.create({
                    ServiceId: req.params["id"],
                    ClienteId: cliente.id
                });
                res.redirect("/");
            }
            else {
                res.sendStatus(403);
            }
        }));
        // Integrador dash
        app.get("/integrador", (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req["user"] && req["user"].type === "Integrador") {
                let integrador = yield Database_1.Integrador.find({
                    where: { cnpj: req["user"].cnpj },
                    include: [{ model: Database_1.Service, include: [{ model: Database_1.Contrato, include: [Database_1.Service, Database_1.Cliente] }] }]
                });
                let contratos = [];
                integrador.Services.forEach(s => s.Contratos.forEach(c => {
                    c.url = "/integrador/contrato/" + c.id;
                    contratos.push(c);
                }));
                integrador.Services = integrador.Services.filter(s => s.enabled);
                res.render("integrador", {
                    title: "Integrador", user: req["user"], services: integrador.Services.map(s => {
                        return {
                            name: s.name,
                            description: s.description,
                            deleteRoute: `/integrador/deletar-servico/${s.id}`
                        };
                    }), contratos: contratos
                });
                return;
            }
            res.redirect("/");
        }));
        app.get("/integrador/deletar-servico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let service = yield Database_1.Service.findById(req.params["id"]);
            if (service.IntegradorId === integrador.id) {
                service.enabled = false;
                yield service.save();
            }
            res.redirect("/integrador");
        }));
        app.post("/integrador/adicionar-servico", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let formData = req["body"];
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            yield Database_1.Service.create({ name: formData.serviceName, description: formData.serviceDescription, IntegradorId: integrador.id });
            res.redirect("/integrador");
        }));
        app.get("/cliente/contrato/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let cliente = yield Database_1.Cliente.find({ where: { cpf: req["user"].cpf } });
            let contrato = yield Database_1.Contrato.find({ where: { ClienteId: cliente.id, id: req.params["id"] }, include: [Database_1.Service] });
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma = contrato.cronograma.map(estado => {
                return {
                    estado: estado
                };
            });
            contrato.estado = contrato.estado || "";
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            res.render("cliente/contrato", { contrato, title: "Contrato" });
        }));
        app.get("/integrador/contrato/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma = contrato.cronograma.map(estado => {
                return {
                    estado: estado,
                    setRoute: `/integrador/contrato/${contrato.id}/fixar-estado/${estado}`,
                    deleteRoute: `/integrador/contrato/${contrato.id}/deletar-estado/${estado}`
                };
            });
            contrato.estado = contrato.estado || "";
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            contrato.gastos = contrato.gastos.map(gasto => {
                gasto.deleteUrl = `/integrador/contrato/${contrato.id}/deletar-gasto/${gasto.name}`;
                return gasto;
            });
            if (contrato.Service.IntegradorId === integrador.id) {
                res.render("integrador/contrato", { contrato, title: "Contrato" });
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.post("/integrador/contrato/:id/novo-estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            if (contrato.Service.IntegradorId === integrador.id) {
                contrato.cronograma = JSON.parse(contrato.cronograma) || [];
                contrato.cronograma.push(req["body"]["estado"]);
                contrato.cronograma = JSON.stringify(contrato.cronograma);
                yield contrato.save();
                res.redirect("/integrador/contrato/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/integrador/contrato/:id/fixar-estado/:estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            if (contrato.Service.IntegradorId === integrador.id) {
                contrato.estado = req.params["estado"];
                yield contrato.save();
                res.redirect("/integrador/contrato/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/integrador/contrato/:id/deletar-estado/:estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            if (contrato.Service.IntegradorId === integrador.id) {
                contrato.cronograma = JSON.parse(contrato.cronograma) || [];
                contrato.cronograma = contrato.cronograma.filter(c => c !== req.params["estado"]);
                contrato.cronograma = JSON.stringify(contrato.cronograma);
                yield contrato.save();
                res.redirect("/integrador/contrato/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.post("/integrador/contrato/:id/criar-gasto", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            if (contrato.Service.IntegradorId === integrador.id) {
                contrato.gastos = JSON.parse(contrato.gastos) || [];
                contrato.gastos.push(req["body"]);
                contrato.gastos = JSON.stringify(contrato.gastos);
                yield contrato.save();
                res.redirect("/integrador/contrato/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/integrador/contrato/:id/deletar-gasto/:name", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contrato = yield Database_1.Contrato.find({ where: { id: req.params["id"] }, include: [Database_1.Service] });
            if (contrato.Service.IntegradorId === integrador.id) {
                contrato.gastos = JSON.parse(contrato.gastos) || [];
                contrato.gastos = contrato.gastos.filter(gasto => gasto.name !== req.params["name"]);
                contrato.gastos = JSON.stringify(contrato.gastos);
                yield contrato.save();
                res.redirect("/integrador/contrato/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
    });
};
