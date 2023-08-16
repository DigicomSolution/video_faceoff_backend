'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_sessions', 'device_id',{
      type: Sequelize.STRING,
      after: 'fcm_token'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_sessions', 'device_id');
  }
};
