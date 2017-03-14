import * as express from 'express';
import { Tarifacao } from '../models/Database';

const AZURE_RATING = 0.092 / (60 * 60);
const MARK_UP = 289000;


export = async function (app: express.Application) {

    app.get("/tarifacao", async (req: express.Request, res: express.Response) => {
        let tarifacoes = await Tarifacao.findAll();
        tarifacoes.forEach((tarifacao: any) => tarifacao.valor = tarifacao.tempo * AZURE_RATING * (1 + MARK_UP / 100));
        res.render('tarifacao', {
            title: 'Home', user: req["user"], tarifacoes,
            searchRoute: "/"
        })
    });
};
