'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('iside_users', 'city', {
        type: Sequelize.STRING,
        after: 'email'
      });

      await queryInterface.addColumn('iside_users', 'state', {
        type: Sequelize.INTEGER,
        after: 'city'
      });

      await queryInterface.addColumn('iside_users', 'age', {
        type: Sequelize.STRING,
        after: 'state'
      });
      return Promise.resolve();
    } catch(e) {
      return Promise.reject();
    }
  },

  down: async(queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('iside_users', 'city');
      await queryInterface.removeColumn('iside_users', 'state');
      await queryInterface.removeColumn('iside_users', 'age');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
