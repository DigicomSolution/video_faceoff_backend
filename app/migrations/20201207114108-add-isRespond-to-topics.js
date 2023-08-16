'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'is_respond',{
      type: Sequelize.BOOLEAN,
      after: 'active'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'is_respond');
  }
};
