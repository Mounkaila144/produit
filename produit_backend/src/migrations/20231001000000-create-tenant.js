'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tenants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      domain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      planType: {
        type: Sequelize.ENUM('basic', 'premium', 'enterprise'),
        defaultValue: 'basic'
      },
      contactInfo: {
        type: Sequelize.JSON,
        allowNull: true
      },
      customDomain: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tenants');
  }
}; 