import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,     // DB name
  process.env.DB_USER,         // user
  process.env.DB_PASSWORD,         // password
  {
    host: process.env.DB_HOST, // hoặc IP
    port: process.env.DB_PORT,            // MySQL default
    dialect: 'mysql',
     dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  
    },
  },
  }
);

export default sequelize;