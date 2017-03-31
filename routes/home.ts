import * as express from "express";
import * as jwt from "jsonwebtoken";
import { SecretKey } from '../utils/Keys';

let MOCKS = {
    clientes: [
        {
            cpf: "391.854.828-71",
            contratos: [{
                cliente: "391.854.828-71",
                servico: {
                    nome: "Pintar parede",
                    integrador: "89.570.486/0001-08"
                },
                estado: "Limpar parede",
                gastos: [
                    {
                        nome: "Tinta",
                        valor: "R$: 300,00"
                    }
                ],
                cronograma: [
                    "Limpar parede",
                    "Consertar parede"
                ]
            },
            {
                cliente: "391.854.828-71",
                servico: {
                    nome: "Consertar piso",
                    integrador: "89.570.486/0001-07"
                },
                estado: "Tirar piso",
                gastos: [
                    {
                        nome: "Pisos",
                        valor: "R$: 150,00"
                    }
                ],
                cronograma: [
                    "Tirar piso",
                    "Colocar piso novo"
                ]
            }]
        },
        {
            cpf: "391.854.828-72",
            contratos: [
            ]
        }
    ],
    integradores: [
        {
            cnpj: "89.570.486/0001-07",
            contratos: [
                {
                    cliente: "391.854.828-71",
                    servico: {
                        nome: "Consertar piso",
                        integrador: "89.570.486/0001-07"
                    },
                    estado: "Tirar piso",
                    gastos: [
                        {
                            nome: "Pisos",
                            valor: "R$: 150,00"
                        }
                    ],
                    cronograma: [
                        "Tirar piso",
                        "Colocar piso novo"
                    ]
                }
            ],
            contratoServicoEspecificos: []
        },
        {
            cnpj: "89.570.486/0001-08",
            contratos: [
                {
                    cliente: "391.854.828-71",
                    servico: {
                        nome: "Pintar parede"
                    },
                    estado: "Limpar parede",
                    gastos: [
                        {
                            nome: "Tinta",
                            valor: "R$: 300,00"
                        }
                    ],
                    cronograma: [
                        "Limpar parede",
                        "Consertar parede"
                    ]
                }
            ],
            contratoServicoEspecificos: [
                {
                    integrador: "89.570.486/0001-08",
                    servicoEspecifico: {
                        nome: "Limpar",
                        fornecedor: "89.570.486/0001-09"
                    },
                    estado: "Começar a limpar",
                    gastos: [
                        {
                            nome: "Água e Sabão",
                            valor: "R$: 5,00"
                        }
                    ],
                    cronograma: [
                        "Começar a limpar",
                        "Terminou de limpar"
                    ]
                },
                {
                    integrador: "89.570.486/0001-08",
                    servicoEspecifico: {
                        nome: "Pintar",
                        fornecedor: "89.570.486/0001-10"
                    },
                    estado: "Começar a pintar",
                    gastos: [
                        {
                            nome: "Tinta branca",
                            valor: "R$: 50,00"
                        }
                    ],
                    cronograma: [
                        "Começar a pintar",
                        "Terminou de pintar"
                    ]
                }
            ]
        }
    ],
    fornecedores: [
        {
            cnpj: "89.570.486/0001-09",
            contratoServicoEspecificos: [
                {
                    integrador: "89.570.486/0001-08",
                    servicoEspecifico: {
                        nome: "Limpar",
                        fornecedor: "89.570.486/0001-09"
                    },
                    estado: "Começar a limpar",
                    gastos: [
                        {
                            nome: "Água e Sabão",
                            valor: "R$: 5,00"
                        }
                    ],
                    cronograma: [
                        "Começar a limpar",
                        "Terminou de limpar"
                    ]
                }
            ]
        },
        {
            cnpj: "89.570.486/0001-10",
            contratoServicoEspecificos: [
                {
                    integrador: "89.570.486/0001-08",
                    servicoEspecifico: {
                        nome: "Pintar",
                        fornecedor: "89.570.486/0001-10"
                    },
                    estado: "Começar a pintar",
                    gastos: [
                        {
                            nome: "Tinta branca",
                            valor: "R$: 50,00"
                        }
                    ],
                    cronograma: [
                        "Começar a pintar",
                        "Terminou de pintar"
                    ]
                }
            ]
        }
    ]
}


export = async function (app: express.Application) {

    // auth stubs
    app.get("/loginGerente", async (req: express.Request, res: express.Response) => {
        res.cookie("authorization", jwt.sign({
            type: "Gerente",
            cpf: "391.854.828-70"
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
        res.render('index', {
            title: 'Gerentes', user: req["user"], gerente: req["user"] && req["user"].type === "Gerente",
            clientes: MOCKS.clientes, integradores: MOCKS.integradores, fornecedores: MOCKS.fornecedores
        })
    });

    app.get("/contratos", async (req: express.Request, res: express.Response) => {

        let contratos = [];
        if (req.query["type"] === "cliente") {
            let cliente = MOCKS.clientes.find(c => c.cpf === req.query["cpf"]);
            contratos = cliente.contratos;
        } else if (req.query["type"] === "integrador") {
            let integrador = MOCKS.integradores.find(c => c.cnpj === req.query["cnpj"]);
            contratos = integrador.contratos;
        }
        res.render('contratos', {
            title: 'Contratos', user: req["user"], gerente: req["user"] && req["user"].type === "Gerente",
            contratos: contratos
        })
    });

    app.get("/contratos-especificos", async (req: express.Request, res: express.Response) => {

        let contratos = [];
        if (req.query["type"] === "integrador") {
            let integrador = MOCKS.integradores.find(c => c.cnpj === req.query["cnpj"]);
            contratos = integrador.contratoServicoEspecificos;
        } else if (req.query["type"] === "fornecedor") {
            let fornecedor = MOCKS.fornecedores.find(c => c.cnpj === req.query["cnpj"]);
            contratos = fornecedor.contratoServicoEspecificos;
        }
        res.render('contratos-especificos', {
            title: 'Contratos', user: req["user"], gerente: req["user"] && req["user"].type === "Gerente",
            contratos: contratos
        })
    });


}
