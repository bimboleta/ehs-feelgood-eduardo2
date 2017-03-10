import * as Sequelize from "sequelize";
import { ServiceModelGenerator } from './Service';
import { ContratoModelGenerator } from './Contrato';
import { ClienteModelGenerator } from './Cliente';
import { IntegradorModelGenerator } from './Integrador';
import { ContratoServicoEspecificoModelGenerator } from './ContratoServicoEspecifico';
import { FornecedorModelGenerator } from './Fornecedor';
import { ServicoEspecificoModelGenerator } from './ServicoEspecifico';

const sequelize = new Sequelize('e-feelgood', 'kiki', 'bobobobo!1', {
  host: 'e-feelgood.database.windows.net',
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

export const Cliente = ClienteModelGenerator(sequelize);
export const Contrato = ContratoModelGenerator(sequelize);
export const ContratoServicoEspecifico = ContratoServicoEspecificoModelGenerator(sequelize);
export const Fornecedor = FornecedorModelGenerator(sequelize);
export const Integrador = IntegradorModelGenerator(sequelize);
export const Service = ServiceModelGenerator(sequelize);
export const ServicoEspecifico = ServicoEspecificoModelGenerator(sequelize);

Contrato.belongsTo(Service);
Contrato.belongsTo(Cliente);
Service.hasMany(Contrato);
Cliente.hasMany(Contrato);

Service.belongsTo(Integrador);
Integrador.hasMany(Service);

ContratoServicoEspecifico.belongsTo(Integrador);
ContratoServicoEspecifico.belongsTo(ServicoEspecifico);
ServicoEspecifico.hasMany(ContratoServicoEspecifico);
Integrador.hasMany(ContratoServicoEspecifico);

ServicoEspecifico.belongsTo(Fornecedor);
Fornecedor.hasMany(ServicoEspecifico);

sequelize.sync({force: true}).then(async () => {
    let cliente = await Cliente.create({cpf: "391.854.828-70"});
    let integrador = await Integrador.create({cnpj: "02.032.012/060-12"});
    let parede = await Service.create({name: "Construir parede", description: "Parede legal", IntegradorId: integrador.id, disponivel: true});
    await Service.create({name: "Assentar piso", description: "Os pisos mais bonitos que você já viu", IntegradorId: integrador.id, disponivel: true});
    await Service.create({name: "Instalar seu fogão", description: "O fogão vai ficar melhor que nunca e sem problemas", IntegradorId: integrador.id, disponivel: true});
    await Contrato.create({ClienteId: cliente.id, ServiceId: parede.id});
    let fornecedor = await Fornecedor.create({cnpj: "02.032.012/060-13"});
    let furarParede = await ServicoEspecifico.create({name: "Furar parede", description: "Faço todos os furos", FornecedorId: fornecedor.id, disponivel: true});
    let pintarParede = await ServicoEspecifico.create({name: "Pintar parede", description: "Pintar paredes de quaisquer cores", FornecedorId: fornecedor.id, disponivel: true});
});
