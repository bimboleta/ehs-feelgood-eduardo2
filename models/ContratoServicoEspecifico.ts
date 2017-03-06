import * as Sequelize from "sequelize";

interface IContratoServicoEspecificoAttributes{
    estado?: string
    gastos?: string
    cronograma?: string
}
interface IContratoServicoEspecifico extends Sequelize.Instance<IContratoServicoEspecificoAttributes>, IContratoServicoEspecificoAttributes{
}

export const ContratoServicoEspecificoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IContratoServicoEspecifico, IContratoServicoEspecificoAttributes> => {

    let model = sequelize.define<IContratoServicoEspecifico, IContratoServicoEspecificoAttributes>("ContratoServicoEspecifico", {
        estado: Sequelize.TEXT,
        gastos: Sequelize.TEXT,
        cronograma: Sequelize.TEXT
    });
    return model;
}


