const { sequelize } = require('../../src/models');

/**
 * Initialise la base de données de test
 */
const initTestDB = async () => {
  // Synchronisation de la base de données
  await sequelize.sync({ force: true });
};

/**
 * Ferme la connexion à la base de données
 */
const closeTestDB = async () => {
  await sequelize.close();
};

/**
 * Nettoie la base de données de test
 */
const cleanTestDB = async () => {
  // Truncate toutes les tables
  for (const model of Object.values(sequelize.models)) {
    await model.destroy({ truncate: { cascade: true }, force: true });
  }
};

module.exports = {
  initTestDB,
  closeTestDB,
  cleanTestDB
}; 