import * as Sequelize from "sequelize";

interface IFornecedorAttributes{
    cnpj?: string
}
interface IFornecedor extends Sequelize.Instance<IFornecedorAttributes>, IFornecedorAttributes{
}

export const FornecedorModelGenerator = (sequelize: Sequelize.Sequelize): Sequelize.Model<IFornecedor, IFornecedorAttributes> => {

    return sequelize.define<IFornecedor, IFornecedorAttributes>("Fornecedor", {
        cnpj: Sequelize.STRING
    });
}


