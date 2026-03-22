import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';

const ProductVersion = sequelize.define('ProductVersion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tx_hash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'ProductVersion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

Product.hasMany(ProductVersion, { foreignKey: 'product_id', as: 'versions' });
ProductVersion.belongsTo(Product, { foreignKey: 'product_id' });

export default ProductVersion;
