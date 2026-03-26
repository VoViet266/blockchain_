import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Product from "./Product.js";

const ProductVersion = sequelize.define(
  "ProductVersion",
  {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    additional_info: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
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
  },
  {
    tableName: "products_productversion",
    timestamps: true,
    createdAt: "created_at",    
    updatedAt: false,
  },
);

Product.hasMany(ProductVersion, {
  foreignKey: "product_id",
  as: "versions",
  onDelete: "CASCADE",
});
ProductVersion.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
});

export default ProductVersion;
