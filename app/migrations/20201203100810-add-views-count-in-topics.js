'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'views',{
      type: Sequelize.STRING,
      defaultValue: 0,
      after: 'active'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'views');
  }
};
