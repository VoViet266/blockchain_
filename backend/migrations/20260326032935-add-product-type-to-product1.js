"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("products_product", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    product_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    variety: { type: Sequelize.STRING, allowNull: true },
    farm_name: { type: Sequelize.STRING, allowNull: true },
    location: { type: Sequelize.STRING, allowNull: true },
    producer: { type: Sequelize.STRING, allowNull: true },
    origin: { type: Sequelize.STRING, allowNull: false },
    owner_wallet: { type: Sequelize.STRING, allowNull: false },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.createTable("products_productversion", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    version: { type: Sequelize.INTEGER, allowNull: false },
    status: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    additional_info: { type: Sequelize.JSON, allowNull: true },
    location: { type: Sequelize.STRING, allowNull: true },
    image: { type: Sequelize.STRING, allowNull: true },
    hash: { type: Sequelize.STRING, allowNull: false },
    tx_hash: { type: Sequelize.STRING, allowNull: true },
    product_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "products_product", key: "id" },
      onDelete: "CASCADE",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("products_productversion");
  await queryInterface.dropTable("products_product");
}
