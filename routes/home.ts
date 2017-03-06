import * as express from "express";
import { Service, Integrador } from '../models/Database';
import * as jwt from "jsonwebtoken";
import { SecretKey } from '../utils/Keys';

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

    // home page
    app.get('/', async (req: express.Request, res: express.Response) => {
        if(req["user"]){
            if(req["user"].type === "Fornecedor"){
                res.redirect("/fornecedor");
                return;
            }else if(req["user"].type === "Integrador"){
                res.redirect("/integrador");
                return;
            }
        }
        res.render('index', { title: 'Home', user: req["user"] })
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
                }
            }
        });
        res.render("index", { title: "Home", services: services.map(s => s.name), user: req["user"] })
    });

    // Integrador dash
    app.get("/integrador", async (req: express.Request, res: express.Response) => {
        if(req["user"] && req["user"].type === "Integrador"){
            let integrador = await Integrador.find({where: {cnpj: req["user"].cnpj}, include: [Service]});
            res.render("integrador", {title: "Integrador", user: req["user"], services: integrador.Services.map(s => s.name)});
            return;
        }
        res.redirect("/");
    });
}
