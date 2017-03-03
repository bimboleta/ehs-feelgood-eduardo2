import * as express from "express";
import { Service } from '../models/Database';
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
    app.get("/loginPrestador", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", jwt.sign({
            type: "Prestador",
            cnpj: "02.032.012/060-12"
        }, SecretKey));
        res.redirect("/");
    });
    app.get("/logout", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", null);
        res.redirect("/");
    });

    // home page
    app.get('/', async (req: express.Request, res: express.Response) => {
        console.log(req["user"]);
        res.render('index', { title: 'Home', user: req["user"] })
    });


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
}
