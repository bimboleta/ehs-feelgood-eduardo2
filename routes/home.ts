import * as express from "express";
import { Service, Integrador, Contrato, Cliente, Fornecedor, ContratoServicoEspecifico, ServicoEspecifico } from '../models/Database';
import * as jwt from "jsonwebtoken";
import { SecretKey } from '../utils/Keys';

interface IUser {
    type: "Cliente" | "Fornecedor" | "Integrador"
    cpf?: string
    cnpj?: string
}

export = async function (app: express.Application) {

    // auth stubs
    app.get("/loginCliente", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", jwt.sign({
            type: "Cliente",
            cpf: "391.854.828-70"
        }, SecretKey));
        res.redirect("/");
    });
    app.get("/loginIntegrador", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", jwt.sign({
            type: "Integrador",
            cnpj: "02.032.012/060-12"
        }, SecretKey));
        res.redirect("/");
    });
    app.get("/loginFornecedor", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", jwt.sign({
            type: "Fornecedor",
            cnpj: "02.032.012/060-13"
        }, SecretKey));
        res.redirect("/");
    });

    // logout
    app.get("/logout", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", null);
        res.redirect("/");
    });

    async function getUserContratos(user: IUser): Promise<any[]> {
        if (user && user.type === "Cliente") {
            let cliente = await Cliente.find({ where: { cpf: user.cpf }, include: [{ model: Contrato, include: [Service] }] });
            return cliente.Contratos.map(c => {
                c.url = `cliente/contrato/${c.id}`;
                return c;
            });
        }
        return [];
    }

    // home page
    app.get('/', async (req: express.Request, res: express.Response) => {
        if (req["user"]) {
            if (req["user"].type === "Fornecedor") {
                res.redirect("/fornecedor");
                return;
            } else if (req["user"].type === "Integrador") {
                res.redirect("/integrador");
                return;
            }
        }
        res.render('index', {
            title: 'Home', user: req["user"], contratos: await getUserContratos(req["user"]),
            searchRoute: "/"
        })
    });


    // Selecionar serviço
    app.post("/", async (req: express.Request, res: express.Response) => {
        let query: {
            serviceName: string
        } = req["body"];
        let services = await Service.findAll({
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
                }
            }), user: req["user"],
            contratos: await getUserContratos(req["user"]),
            searchRoute: "/"
        })
    });

    app.get("/cliente/contratar-servico/:id", async (req: express.Request, res: express.Response) => {
        let user: IUser = req["user"];
        let servico = await Service.findById(req.params["id"]);
        if (user.type === "Cliente" && servico) {
            let cliente = await Cliente.find({ where: { cpf: user.cpf } });
            let contrato = await Contrato.create({
                ServiceId: req.params["id"],
                ClienteId: cliente.id
            });
            res.redirect("/");
        } else {
            res.sendStatus(403);
        }
    });

    // Integrador dash
    app.get("/integrador", async (req: express.Request, res: express.Response) => {
        if (req["user"] && req["user"].type === "Integrador") {
            let integrador = await Integrador.find({
                where: { cnpj: req["user"].cnpj },
                include: [{ model: Service, include: [{ model: Contrato, include: [Service, Cliente] }] }]
            });
            let contratos = [];
            integrador.Services.forEach(s => s.Contratos.forEach(c => {
                c.url = "/integrador/contrato/" + c.id
                contratos.push(c);
            }));
            integrador.Services = integrador.Services.filter(s => s.enabled);
            res.render("integrador", {
                title: "Integrador", user: req["user"], services: integrador.Services.map(s => {
                    return {
                        name: s.name,
                        description: s.description,
                        deleteRoute: `/integrador/deletar-servico/${s.id}`
                    }
                }), contratos: contratos, addRoute: "/integrador/adicionar-servico",
                includeRouteToServicoEspecifico: true
            });
            return;
        }
        res.redirect("/");
    });

    app.get("/integrador/deletar-servico/:id", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let service = await Service.findById(req.params["id"]);
        if (service.IntegradorId === integrador.id) {
            service.enabled = false;
            await service.save();
        }
        res.redirect("/integrador");
    });

    app.post("/integrador/adicionar-servico", async (req: express.Request, res: express.Response) => {
        let formData: {
            serviceName: string
            serviceDescription: string
        } = req["body"];
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        await Service.create({ name: formData.serviceName, description: formData.serviceDescription, IntegradorId: integrador.id });
        res.redirect("/integrador");
    });

    app.get("/cliente/contrato/:id", async (req: express.Request, res: express.Response) => {
        let cliente = await Cliente.find({ where: { cpf: req["user"].cpf } });
        let contrato = await Contrato.find({ where: { ClienteId: cliente.id, id: req.params["id"] }, include: [Service] });
        contrato.cronograma = JSON.parse(contrato.cronograma) || [];
        contrato.cronograma = contrato.cronograma.map(estado => {
            return {
                estado: estado
            }
        })
        contrato.estado = contrato.estado || "";
        contrato.gastos = JSON.parse(contrato.gastos) || [];
        res.render("cliente/contrato", { contrato, title: "Contrato", user: req["user"] })
    });

    app.get("/integrador/contrato/:id", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        contrato.cronograma = JSON.parse(contrato.cronograma) || [];
        contrato.cronograma = contrato.cronograma.map(estado => {
            return {
                estado: estado,
                setRoute: `/integrador/contrato/${contrato.id}/fixar-estado/${estado}`,
                deleteRoute: `/integrador/contrato/${contrato.id}/deletar-estado/${estado}`
            }
        })
        contrato.estado = contrato.estado || "";
        contrato.gastos = JSON.parse(contrato.gastos) || [];
        contrato.gastos = contrato.gastos.map(gasto => {
            gasto.deleteUrl = `/integrador/contrato/${contrato.id}/deletar-gasto/${gasto.name}`
            return gasto;
        })
        if (contrato.Service.IntegradorId === integrador.id) {
            res.render("integrador/contrato", { contrato, title: "Contrato",
            includeRouteToServicoEspecifico: true, user: req["user"] })
        } else {
            res.sendStatus(401);
        }
    });

    app.post("/integrador/contrato/:id/novo-estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        if (contrato.Service.IntegradorId === integrador.id) {
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma.push(req["body"]["estado"]);
            contrato.cronograma = JSON.stringify(contrato.cronograma);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/fixar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        if (contrato.Service.IntegradorId === integrador.id) {
            contrato.estado = req.params["estado"];
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/deletar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        if (contrato.Service.IntegradorId === integrador.id) {
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma = contrato.cronograma.filter(c => c !== req.params["estado"]);
            contrato.cronograma = JSON.stringify(contrato.cronograma);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.post("/integrador/contrato/:id/criar-gasto", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        if (contrato.Service.IntegradorId === integrador.id) {
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            contrato.gastos.push(req["body"]);
            contrato.gastos = JSON.stringify(contrato.gastos);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/deletar-gasto/:name", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contrato = await Contrato.find({ where: { id: req.params["id"] }, include: [Service] });
        if (contrato.Service.IntegradorId === integrador.id) {
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            contrato.gastos = contrato.gastos.filter(gasto => gasto.name !== req.params["name"]);
            contrato.gastos = JSON.stringify(contrato.gastos);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    async function getIntegradorContratoServicoEspecificos(user: IUser): Promise<any[]> {
        if (user && user.type === "Integrador") {
            let integrador = await Integrador.find({ where: { cnpj: user.cnpj }, include: [{ model: ContratoServicoEspecifico, include: [ServicoEspecifico] }] });
            return integrador.ContratoServicoEspecificos.map(c => {
                c.Service = c.ServicoEspecifico;
                c.url = `/integrador/contrato-servico-especifico/${c.id}`;
                return c;
            });
        }
        return [];
    }

    // home page
    app.get('/integrador/servicos-especificos', async (req: express.Request, res: express.Response) => {
        if (req["user"]) {
            if (req["user"].type === "Fornecedor") {
                res.redirect("/fornecedor");
                return;
            } else if (req["user"].type === "Cliente") {
                res.redirect("/");
                return;
            }
        }
        res.render('index', {
            title: 'Home', user: req["user"], contratos: await getIntegradorContratoServicoEspecificos(req["user"]),
            searchRoute: "/integrador/servicos-especificos",
            includeRouteToServicoEspecifico: true
        })
    });


    // Selecionar serviço
    app.post("/integrador/servicos-especificos", async (req: express.Request, res: express.Response) => {
        let query: {
            serviceName: string
        } = req["body"];
        let services = await ServicoEspecifico.findAll({
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
                }
            }), user: req["user"],
            contratos: await getUserContratos(req["user"]),
            searchRoute: "/integrador/servicos-especificos",
            includeRouteToServicoEspecifico: true
        })
    });

    app.get("/integrador/contratar-servico-especifico/:id", async (req: express.Request, res: express.Response) => {
        let user: IUser = req["user"];
        let servico = await ServicoEspecifico.findById(req.params["id"]);
        if (user.type === "Integrador" && servico) {
            let integrador = await Integrador.find({ where: { cnpj: user.cnpj } });
            let contrato = await ContratoServicoEspecifico.create({
                ServicoEspecificoId: req.params["id"],
                IntegradorId: integrador.id
            });
            res.redirect("/integrador/servicos-especificos");
        } else {
            res.sendStatus(403);
        }
    });

    // Integrador dash
    app.get("/fornecedor", async (req: express.Request, res: express.Response) => {
        if (req["user"] && req["user"].type === "Fornecedor") {
            let fornecedor = await Fornecedor.find({
                where: { cnpj: req["user"].cnpj },
                include: [{ model: ServicoEspecifico, include: [{ model: ContratoServicoEspecifico, include: [ServicoEspecifico, Integrador] }] }]
            });

            // AQUI
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
                    }
                }), contratos: contratos, addRoute: "/fornecedor/adicionar-servico-especifico"
            });
            return;
        }
        res.redirect("/");
    });

    app.get("/fornecedor/deletar-servico-especifico/:id", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let service = await ServicoEspecifico.findById(req.params["id"]);
        if (service.FornecedorId === fornecedor.id) {
            service.disponivel = false;
            await service.save();
        }
        res.redirect("/fornecedor");
    });

    app.post("/fornecedor/adicionar-servico-especifico", async (req: express.Request, res: express.Response) => {
        let formData: {
            serviceName: string
            serviceDescription: string
        } = req["body"];
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        await ServicoEspecifico.create({ name: formData.serviceName, description: formData.serviceDescription, FornecedorId: fornecedor.id });
        res.redirect("/fornecedor");
    });

    app.get("/integrador/contrato-servico-especifico/:id", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { IntegradorId: integrador.id, id: req.params["id"] }, include: [ServicoEspecifico] });
        contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
        contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.map(estado => {
            return {
                estado: estado
            }
        })
        contratoServicoEspecifico.estado = contratoServicoEspecifico.estado || "";
        contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
        contratoServicoEspecifico.Service = contratoServicoEspecifico.ServicoEspecifico;
        res.render("cliente/contrato", { contrato: contratoServicoEspecifico, title: "Contrato",
            includeRouteToServicoEspecifico: true, user: req["user"] })
    });

    app.get("/fornecedor/contrato-servico-especifico/:id", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
        contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.map(estado => {
            return {
                estado: estado,
                setRoute: `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/fixar-estado/${estado}`,
                deleteRoute: `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/deletar-estado/${estado}`
            }
        })
        contratoServicoEspecifico.estado = contratoServicoEspecifico.estado || "";
        contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
        contratoServicoEspecifico.gastos = contratoServicoEspecifico.gastos.map(gasto => {
            gasto.deleteUrl = `/fornecedor/contrato-servico-especifico/${contratoServicoEspecifico.id}/deletar-gasto/${gasto.name}`
            return gasto;
        })
        contratoServicoEspecifico.Service = contratoServicoEspecifico.ServicoEspecifico;
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            res.render("integrador/contrato", {
                user: req["user"],
                contrato: contratoServicoEspecifico, title: "Contrato"
                , addStateRoute: `/fornecedor/contrato-servico-especifico/${req.params["id"]}/novo-estado`,
                addSpentRoute: `/fornecedor/contrato-servico-especifico/${req.params["id"]}/criar-gasto`
            })
        } else {
            res.sendStatus(401);
        }
    });

    app.post("/fornecedor/contrato-servico-especifico/:id/novo-estado", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
            contratoServicoEspecifico.cronograma.push(req["body"]["estado"]);
            contratoServicoEspecifico.cronograma = JSON.stringify(contratoServicoEspecifico.cronograma);
            await contratoServicoEspecifico.save();
            res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/fornecedor/contrato-servico-especifico/:id/fixar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            contratoServicoEspecifico.estado = req.params["estado"];
            await contratoServicoEspecifico.save();
            res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/fornecedor/contrato-servico-especifico/:id/deletar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            contratoServicoEspecifico.cronograma = JSON.parse(contratoServicoEspecifico.cronograma) || [];
            contratoServicoEspecifico.cronograma = contratoServicoEspecifico.cronograma.filter(c => c !== req.params["estado"]);
            contratoServicoEspecifico.cronograma = JSON.stringify(contratoServicoEspecifico.cronograma);
            await contratoServicoEspecifico.save();
            res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.post("/fornecedor/contrato-servico-especifico/:id/criar-gasto", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
            contratoServicoEspecifico.gastos.push(req["body"]);
            contratoServicoEspecifico.gastos = JSON.stringify(contratoServicoEspecifico.gastos);
            await contratoServicoEspecifico.save();
            res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/fornecedor/contrato-servico-especifico/:id/deletar-gasto/:name", async (req: express.Request, res: express.Response) => {
        let fornecedor = await Fornecedor.find({ where: { cnpj: req["user"].cnpj } });
        let contratoServicoEspecifico = await ContratoServicoEspecifico.find({ where: { id: req.params["id"] }, include: [ServicoEspecifico] });
        if (contratoServicoEspecifico.ServicoEspecifico.FornecedorId === fornecedor.id) {
            contratoServicoEspecifico.gastos = JSON.parse(contratoServicoEspecifico.gastos) || [];
            contratoServicoEspecifico.gastos = contratoServicoEspecifico.gastos.filter(gasto => gasto.name !== req.params["name"]);
            contratoServicoEspecifico.gastos = JSON.stringify(contratoServicoEspecifico.gastos);
            await contratoServicoEspecifico.save();
            res.redirect("/fornecedor/contrato-servico-especifico/" + req.params["id"]);
        } else {
            res.sendStatus(401);
        }
    });
}
