'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('notifications', 'receiver_user_id',{
      type: Sequelize.INTEGER,
      after: 'sender_id'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('notifications', 'receiver_user_id');
  }
};
