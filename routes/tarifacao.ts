import * as express from 'express';
import { Tarifacao } from '../models/Database';

const AZURE_RATING = 0.092 / (60 * 60);
const MARK_UP = 2890000;
const AZURE_DATA_RATING = 74 / (5 * 1000 * 1000 * 1000);

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

export = async function (app: express.Application) {

    app.get("/tarifacao", async (req: express.Request, res: express.Response) => {
        let tarifacoes = await Tarifacao.findAll();

        tarifacoes.forEach((tarifacao: any) => tarifacao.valor =
            tarifacao.tempo * AZURE_RATING * (1 + MARK_UP / 100));
        res.render('tarifacao', {
            title: 'Home', user: req["user"], tarifacoes,
            searchRoute: "/"
        })
    });
};
