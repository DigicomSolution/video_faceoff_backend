'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('user_sessions', 'fcm_token', {
        type: Sequelize.STRING,
        after: 'uuid'
      });

      await queryInterface.addColumn('user_sessions', 'status', {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
        after: 'phone'
      });
      return Promise.resolve();
    } catch(e) {
      return Promise.reject();
    }

  },

  down: async(queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('user_sessions', 'fcm_token');
      await queryInterface.removeColumn('user_sessions', 'status');
      return Promise.resolve();
    } catch(e) {
      return Promise.reject();
    }
}
};
