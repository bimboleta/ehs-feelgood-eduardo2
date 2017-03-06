import * as Sequelize from "sequelize";

interface IContratoAttributes{
    estado?: string
    gastos?: string
    cronograma?: string
}
interface IContrato extends Sequelize.Instance<IContratoAttributes>, IContratoAttributes{
}

export const ContratoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IContrato, IContratoAttributes> => {

    let model = sequelize.define<IContrato, IContratoAttributes>("Contrato", {
        estado: Sequelize.TEXT,
        gastos: Sequelize.TEXT,
        cronograma: Sequelize.TEXT
    });
    return model;
}


