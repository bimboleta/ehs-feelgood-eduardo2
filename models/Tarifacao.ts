import * as Sequelize from "sequelize";

interface ITarifacaoAttributes{
    identificador?: string,
    tempo?: number
}
interface ITarifacao extends Sequelize.Instance<ITarifacaoAttributes>, ITarifacaoAttributes{
}

export const TarifacaoModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<ITarifacao, ITarifacaoAttributes> => {

    return sequelize.define<ITarifacao, ITarifacaoAttributes>("Tarifacao", {
        identificador: {type: Sequelize.STRING, unique: true},
        tempo: {type: Sequelize.DOUBLE, defaultValue: 0}
    });
}
