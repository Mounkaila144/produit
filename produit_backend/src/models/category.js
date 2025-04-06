'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Tenant, {
        foreignKey: 'tenantId'
      });
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId',
        onDelete: 'SET NULL'
      });
      // Auto-association pour la hiérarchie des catégories
      Category.belongsTo(Category, {
        foreignKey: 'parentId',
        as: 'parent'
      });
      Category.hasMany(Category, {
        foreignKey: 'parentId',
        as: 'children'
      });
    }
  }
  
  Category.init({
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tenants',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    hooks: {
      // Vérifier qu'il n'y a pas de référence circulaire dans la hiérarchie
      beforeCreate: async (category) => {
        if (category.parentId) {
          await checkCircularReference(category.parentId, category.id, sequelize);
        }
      },
      beforeUpdate: async (category) => {
        if (category.changed('parentId') && category.parentId) {
          await checkCircularReference(category.parentId, category.id, sequelize);
        }
      }
    }
  });
  
  // Fonction utilitaire pour vérifier les références circulaires
  async function checkCircularReference(parentId, selfId, sequelize) {
    if (parentId === selfId) {
      throw new Error('Une catégorie ne peut pas être son propre parent');
    }
    
    // Vérifier les parents récursivement
    const parent = await sequelize.models.Category.findByPk(parentId);
    if (parent && parent.parentId) {
      await checkCircularReference(parent.parentId, selfId, sequelize);
    }
  }
  
  return Category;
}; 