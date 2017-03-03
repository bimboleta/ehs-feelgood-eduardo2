import * as Sequelize from "sequelize";

interface IContratoAttributes{
}
interface IContrato extends Sequelize.Instance<IContratoAttributes>, IContratoAttributes{
}

export const ContratoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IContrato, IContratoAttributes> => {

    let model = sequelize.define<IContrato, IContratoAttributes>("Contrato", {
    });
    return model;
}


