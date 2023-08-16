'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'active',{
      type: Sequelize.INTEGER,
      after: 'video'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'active');
  }
};
