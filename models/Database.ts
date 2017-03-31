import * as Sequelize from "sequelize";
import { TarifacaoModelGenerator } from './Tarifacao';

export let sequelize;
if (process.env.PORT === undefined) {
  sequelize = new Sequelize('test', 'tester', 'test', {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });

} else {
  sequelize = new Sequelize('e2-feelgood', 'kiki', 'bobobobo!1', {
    host: 'e2-feelgood.database.windows.net',
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    dialectOptions: {
      encrypt: true
    }
  });
}


export const Tarifacao = TarifacaoModelGenerator(sequelize);

if (process.env.PORT === undefined) {
  sequelize.sync({ force: false }).then(async () => { });
} else {
  sequelize.sync({ force: false }).then(async () => {
    // let cliente = await Cliente.create({cpf: "391.854.828-70"});
    // let integrador = await Integrador.create({cnpj: "02.032.012/060-12"});
    // let parede = await Service.create({name: "Construir parede", description: "Parede legal", IntegradorId: integrador.id, disponivel: true});
    // await Service.create({name: "Assentar piso", description: "Os pisos mais bonitos que você já viu", IntegradorId: integrador.id, disponivel: true});
    // await Service.create({name: "Instalar seu fogão", description: "O fogão vai ficar melhor que nunca e sem problemas", IntegradorId: integrador.id, disponivel: true});
    // await Contrato.create({ClienteId: cliente.id, ServiceId: parede.id});
    // let fornecedor = await Fornecedor.create({cnpj: "02.032.012/060-13"});
    // let furarParede = await ServicoEspecifico.create({name: "Furar parede", description: "Faço todos os furos", FornecedorId: fornecedor.id, disponivel: true});
    // let pintarParede = await ServicoEspecifico.create({name: "Pintar parede", description: "Pintar paredes de quaisquer cores", FornecedorId: fornecedor.id, disponivel: true});
  });
}
