import * as Sequelize from "sequelize";

interface IServiceAttributes{
    name?: string,
    description?: string
}
interface IService extends Sequelize.Instance<IServiceAttributes>, IServiceAttributes{
}

export const ServiceModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IService, IServiceAttributes> => {

    return sequelize.define<IService, IServiceAttributes>("Service", {
        name: Sequelize.STRING,
        description: Sequelize.TEXT
    });
}


