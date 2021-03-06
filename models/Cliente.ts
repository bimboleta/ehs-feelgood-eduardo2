import * as Sequelize from "sequelize";

interface IClienteAttributes{
    id?: number
    cpf?: string
}
interface ICliente extends Sequelize.Instance<IClienteAttributes>, IClienteAttributes{
}

export const ClienteModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<ICliente, IClienteAttributes> => {

    return sequelize.define<ICliente, IClienteAttributes>("Cliente", {
        cpf: {type: Sequelize.STRING, unique: true}
    });
}


