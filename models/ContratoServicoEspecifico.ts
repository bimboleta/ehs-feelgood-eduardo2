import * as Sequelize from "sequelize";

interface IContratoServicoEspecificoAttributes{
}
interface IContratoServicoEspecifico extends Sequelize.Instance<IContratoServicoEspecificoAttributes>, IContratoServicoEspecificoAttributes{
}

export const ContratoServicoEspecificoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IContratoServicoEspecifico, IContratoServicoEspecificoAttributes> => {

    let model = sequelize.define<IContratoServicoEspecifico, IContratoServicoEspecificoAttributes>("ContratoServicoEspecifico", {
    });
    return model;
}


