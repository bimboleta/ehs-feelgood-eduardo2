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

sequelize.sync({force: true}).then(() => {
    Service.create({name: "Construir parede", description: "Parede legal"});
});
