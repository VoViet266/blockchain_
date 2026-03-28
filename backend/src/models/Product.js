import { DataTypes, UUID, UUIDV4 } from "sequelize";
import crypto from "crypto";
import sequelize from "../config/database.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => crypto.randomUUID().replace(/-/g, ""),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plant_area_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variety: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    farm_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    producer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_wallet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "products_product",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default Product;
