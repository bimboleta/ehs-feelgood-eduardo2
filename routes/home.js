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
            res.render('index', {
                title: 'Home', user: req["user"], contratos: yield getUserContratos(req["user"]),
                searchRoute: "/"
            });
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
                contratos: yield getUserContratos(req["user"]),
                searchRoute: "/"
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
                    }), contratos: contratos, addRoute: "/integrador/adicionar-servico",
                    includeRouteToServicoEspecifico: true
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
            res.render("cliente/contrato", { contrato, title: "Contrato", user: req["user"] });
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
                res.render("integrador/contrato", { contrato, title: "Contrato",
                    includeRouteToServicoEspecifico: true, user: req["user"] });
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
        function getIntegradorContratoServicoEspecificos(user) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user && user.type === "Integrador") {
                    let integrador = yield Database_1.Integrador.find({ where: { cnpj: user.cnpj }, include: [{ model: Database_1.ContratoServicoEspecifico, include: [Database_1.ServicoEspecifico] }] });
                    return integrador.ContratoServicoEspecificos.map(c => {
                        c.Service = c.ServicoEspecifico;
                        c.url = `/integrador/contrato-servico-especifico/${c.id}`;
                        return c;
                    });
                }
                return [];
            });
        }
        // home page
        app.get('/integrador/servicos-especificos', (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req["user"]) {
                if (req["user"].type === "Fornecedor") {
                    res.redirect("/fornecedor");
                    return;
                }
                else if (req["user"].type === "Cliente") {
                    res.redirect("/");
                    return;
                }
            }
            res.render('index', {
                title: 'Home', user: req["user"], contratos: yield getIntegradorContratoServicoEspecificos(req["user"]),
                searchRoute: "/integrador/servicos-especificos",
                includeRouteToServicoEspecifico: true
            });
        }));
        // Selecionar serviço
        app.post("/integrador/servicos-especificos", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let query = req["body"];
            let services = yield Database_1.ServicoEspecifico.findAll({
                where: {
                    name: {
                        $like: `%${query.serviceName}%`
                    },
                    disponivel: true
                }
            });
            res.render("index", {
                title: "Home", services: services.map(s => {
                    return {
                        name: s.name,
                        description: s.description,
                        contractRoute: `/integrador/contratar-servico-especifico/${s.id}`
                    };
                }), user: req["user"],
                contratos: yield getUserContratos(req["user"]),
                searchRoute: "/integrador/servicos-especificos",
                includeRouteToServicoEspecifico: true
            });
        }));
        app.get("/integrador/contratar-servico-especifico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user = req["user"];
            let servico = yield Database_1.ServicoEspecifico.findById(req.params["id"]);
            if (user.type === "Integrador" && servico) {
                let integrador = yield Database_1.Integrador.find({ where: { cnpj: user.cnpj } });
                let contrato = yield Database_1.ContratoServicoEspecifico.create({
                    ServicoEspecificoId: req.params["id"],
                    IntegradorId: integrador.id
                });
                res.redirect("/integrador/servicos-especificos");
            }
            else {
                res.sendStatus(403);
            }
        }));
        // Integrador dash
        app.get("/fornecedor", (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req["user"] && req["user"].type === "Fornecedor") {
                let fornecedor = yield Database_1.Fornecedor.find({
                    where: { cnpj: req["user"].cnpj },
                    include: [{ model: Database_1.ServicoEspecifico, include: [{ model: Database_1.ContratoServicoEspecifico, include: [Database_1.ServicoEspecifico, Database_1.Integrador] }] }]
                });
                let contratos = [];
                fornecedor.ServicoEspecificos.forEach(s => s.ContratoServicoEspecificos.forEach(c => {
                    c.url = "/fornecedor/contrato-servico-especifico/" + c.id;
                    c.Service = c.ServicoEspecifico;
                    contratos.push(c);
                }));
                fornecedor.ServicoEspecificos = fornecedor.ServicoEspecificos.filter(s => s.disponivel);
                res.render("integrador", {
                    title: "Fornecedor", user: req["user"], services: fornecedor.ServicoEspecificos.map(s => {
                        return {
                            name: s.name,
                            description: s.description,
                            deleteRoute: `/fornecedor/deletar-servico-especifico/${s.id}`
                        };
                    }), contratos: contratos, addRoute: "/fornecedor/adicionar-servico-especifico"
                });
                return;
            }
            res.redirect("/");
        }));
        app.get("/fornecedor/deletar-servico-especifico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let service = yield Database_1.ServicoEspecifico.findById(req.params["id"]);
            if (service.FornecedorId === fornecedor.id) {
                service.disponivel = false;
                yield service.save();
            }
            res.redirect("/fornecedor");
        }));
        app.post("/fornecedor/adicionar-servico-especifico", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let formData = req["body"];
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            yield Database_1.ServicoEspecifico.create({ name: formData.serviceName, description: formData.serviceDescription, FornecedorId: fornecedor.id });
            res.redirect("/fornecedor");
        }));
        app.get("/integrador/contrato-servico-especifico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let integrador = yield Database_1.Integrador.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { IntegradorId: integrador.id, id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
            contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.map(estado => {
                return {
                    estado: estado
                };
            });
            contratoServicoEspecifico.estado = contratoServicoEspecifico.estado || "";
            contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
            contratoServicoEspecifico.Service = contratoServicoEspecifico.ServicoEspecifico;
            res.render("cliente/contrato", { contrato: contratoServicoEspecifico, title: "Contrato",
                includeRouteToServicoEspecifico: true, user: req["user"] });
        }));
        app.get("/fornecedor/contrato-servico-especifico/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
            contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.map(estado => {
                return {
                    estado: estado,
                    setRoute: `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/fixar-estado/${estado}`,
                    deleteRoute: `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/deletar-estado/${estado}`
                };
            });
            contratoServicoEspecifico.estado = contratoServicoEspecifico.estado || "";
            contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
            contratoServicoEspecifico.gastos = contratoServicoEspecifico.gastos.map(gasto => {
                gasto.deleteUrl = `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/deletar-gasto/${gasto.name}`;
                return gasto;
            });
            contratoServicoEspecifico.Service = contratoServicoEspecifico.ServicoEspecifico;
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                res.render("integrador/contrato", {
                    user: req["user"],
                    contrato: contratoServicoEspecifico, title: "Contrato",
                    addStateRoute: `/fornecedor/contrato-servico-especifico/${req.params["id"]}/novo-estado`,
                    addSpentRoute: `/fornecedor/contrato-servico-especifico/${req.params["id"]}/criar-gasto`
                });
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.post("/fornecedor/contrato-servico-especifico/:id/novo-estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
                contratoServicoEspecifico.cronograma.push(req["body"]["estado"]);
                contratoServicoEspecifico.cronograma = JSON.stringify(contratoServicoEspecifico.cronograma);
                yield contratoServicoEspecifico.save();
                res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/fornecedor/contrato-servico-especifico/:id/fixar-estado/:estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                contratoServicoEspecifico.estado = req.params["estado"];
                yield contratoServicoEspecifico.save();
                res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/fornecedor/contrato-servico-especifico/:id/deletar-estado/:estado", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
                contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.filter(c => c !== req.params["estado"]);
                contratoServicoEspecifico.cronograma = JSON.stringify(contratoServicoEspecifico.cronograma);
                yield contratoServicoEspecifico.save();
                res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.post("/fornecedor/contrato-servico-especifico/:id/criar-gasto", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
                contratoServicoEspecifico.gastos.push(req["body"]);
                contratoServicoEspecifico.gastos = JSON.stringify(contratoServicoEspecifico.gastos);
                yield contratoServicoEspecifico.save();
                res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
        app.get("/fornecedor/contrato-servico-especifico/:id/deletar-gasto/:name", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let fornecedor = yield Database_1.Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
            let contratoServicoEspecifico = yield Database_1.ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [Database_1.ServicoEspecifico] });
            if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
                contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
                contratoServicoEspecifico.gastos = contratoServicoEspecifico.gastos.filter(gasto => gasto.name !== req.params["name"]);
                contratoServicoEspecifico.gastos = JSON.stringify(contratoServicoEspecifico.gastos);
                yield contratoServicoEspecifico.save();
                res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
            }
            else {
                res.sendStatus(401);
            }
        }));
    });
};
