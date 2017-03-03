import * as Sequelize from "sequelize";

interface IPrestadorAttributes{
    cnpj?: string
}
interface IPrestador extends Sequelize.Instance<IPrestadorAttributes>, IPrestadorAttributes{
}

export const PrestadorModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IPrestador, IPrestadorAttributes> => {

    return sequelize.define<IPrestador, IPrestadorAttributes>("Prestador", {
        cnpj: Sequelize.STRING
    });
}


