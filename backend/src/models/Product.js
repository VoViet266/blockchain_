import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    origin: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    owner_wallet: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'Product',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

export default Product;
