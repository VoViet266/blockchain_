import sequelize from '../config/database.js';
import Product from './Product.js';
import ProductVersion from './ProductVersion.js';

export const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: false });
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

export {    
    sequelize,
    Product,
    ProductVersion
};
