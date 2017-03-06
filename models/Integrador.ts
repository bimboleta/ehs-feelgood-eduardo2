import * as Sequelize from "sequelize";

interface IIntegradorAttributes{
    cnpj?: string
}
interface IIntegrador extends Sequelize.Instance<IIntegradorAttributes>, IIntegradorAttributes{
}

export const IntegradorModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IIntegrador, IIntegradorAttributes> => {

    return sequelize.define<IIntegrador, IIntegradorAttributes>("Integrador", {
        cnpj: Sequelize.STRING
    });
}
