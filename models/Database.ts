import * as Sequelize from "sequelize";
import { ServiceModelGenerator } from './Service';
import { ContratoModelGenerator } from './Contrato';
import { PrestadorModelGenerator } from './Prestador';
import { ClienteModelGenerator } from './Cliente';

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

export const Service = ServiceModelGenerator(sequelize);
export const Contrato = ContratoModelGenerator(sequelize);
export const Cliente = ClienteModelGenerator(sequelize);
export const Prestador = PrestadorModelGenerator(sequelize);

Contrato.belongsTo(Service);
Contrato.belongsTo(Cliente);
Contrato.belongsTo(Prestador);

Service.hasMany(Contrato);
Service.belongsTo(Prestador);

Prestador.hasMany(Contrato);
Prestador.hasMany(Service);

Cliente.hasMany(Contrato);


sequelize.sync({force: true}).then(() => {
    Service.create({name: "Construir parede", description: "Parede legal"});
});
