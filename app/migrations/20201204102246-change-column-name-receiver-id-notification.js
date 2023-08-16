'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('notifications', 'reciever_id', 'receiver_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('notifications', 'receiver_id', 'reciever_id');
  }
};
