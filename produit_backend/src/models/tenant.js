'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    static associate(models) {
      Tenant.hasMany(models.User, {
        foreignKey: 'tenantId',
        onDelete: 'CASCADE'
      });
      Tenant.hasMany(models.Category, {
        foreignKey: 'tenantId',
        onDelete: 'CASCADE'
      });
      Tenant.hasMany(models.Product, {
        foreignKey: 'tenantId',
        onDelete: 'CASCADE'
      });
      Tenant.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      });
    }
  }
  Tenant.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    planType: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
      defaultValue: 'basic'
    },
    contactInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    customDomain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Tenant',
    hooks: {
      beforeCreate: (tenant) => {
        // Calcul automatique de la date d'expiration (1 mois)
        if (!tenant.expiresAt) {
          const expDate = new Date();
          expDate.setMonth(expDate.getMonth() + 1);
          tenant.expiresAt = expDate;
        }
      }
    }
  });
  
  return Tenant;
}; 