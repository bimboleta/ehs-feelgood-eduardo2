import * as express from "express";
import { Service, Integrador, Contrato, Cliente, Fornecedor } from '../models/Database';
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
        res.render('index', { title: 'Home', user: req["user"], contratos: await getUserContratos(req["user"]) })
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
            contratos: await getUserContratos(req["user"])
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
                }), contratos: contratos
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
        let cliente = await Cliente.find({where: {cpf: req["user"].cpf}});
        let contrato = await Contrato.find({where: {ClienteId: cliente.id, id: req.params["id"]}, include: [Service]});
        contrato.cronograma = JSON.parse(contrato.cronograma) || [];
        contrato.cronograma = contrato.cronograma.map(estado => {
            return {
                estado: estado
            }
        })
        contrato.estado = contrato.estado || "";
        contrato.gastos = JSON.parse(contrato.gastos) || [];
        res.render("cliente/contrato", {contrato, title: "Contrato"})
    });

    app.get("/integrador/contrato/:id", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
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
        if(contrato.Service.IntegradorId === integrador.id){
            res.render("integrador/contrato", {contrato, title: "Contrato"})
        }else{
            res.sendStatus(401);
        }
    });

    app.post("/integrador/contrato/:id/novo-estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
        if(contrato.Service.IntegradorId === integrador.id){
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma.push(req["body"]["estado"]);
            contrato.cronograma = JSON.stringify(contrato.cronograma);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        }else{
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/fixar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
        if(contrato.Service.IntegradorId === integrador.id){
            contrato.estado = req.params["estado"];
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        }else{
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/deletar-estado/:estado", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
        if(contrato.Service.IntegradorId === integrador.id){
            contrato.cronograma = JSON.parse(contrato.cronograma) || [];
            contrato.cronograma = contrato.cronograma.filter(c => c !== req.params["estado"]);
            contrato.cronograma = JSON.stringify(contrato.cronograma);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        }else{
            res.sendStatus(401);
        }
    });

    app.post("/integrador/contrato/:id/criar-gasto", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
        if(contrato.Service.IntegradorId === integrador.id){
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            contrato.gastos.push(req["body"]);
            contrato.gastos = JSON.stringify(contrato.gastos);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        }else{
            res.sendStatus(401);
        }
    });

    app.get("/integrador/contrato/:id/deletar-gasto/:name", async (req: express.Request, res: express.Response) => {
        let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}});
        let contrato = await Contrato.find({where: {id: req.params["id"]}, include: [Service]});
        if(contrato.Service.IntegradorId === integrador.id){
            contrato.gastos = JSON.parse(contrato.gastos) || [];
            contrato.gastos = contrato.gastos.filter(gasto => gasto.name !== req.params["name"]);
            contrato.gastos = JSON.stringify(contrato.gastos);
            await contrato.save();
            res.redirect("/integrador/contrato/" + req.params["id"]);
        }else{
            res.sendStatus(401);
        }
    });

}
