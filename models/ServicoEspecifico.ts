import * as Sequelize from "sequelize";

interface IServicoEspecificoAttributes{
    name?: string,
    description?: string,
    disponivel?: boolean
}
interface IServicoEspecifico extends Sequelize.Instance<IServicoEspecificoAttributes>, IServicoEspecificoAttributes{
}

export const ServicoEspecificoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IServicoEspecifico, IServicoEspecificoAttributes> => {

    return sequelize.define<IServicoEspecifico, IServicoEspecificoAttributes>("ServicoEspecifico", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        disponivel: {type: Sequelize.BOOLEAN, defaultValue: true}
    });
}


