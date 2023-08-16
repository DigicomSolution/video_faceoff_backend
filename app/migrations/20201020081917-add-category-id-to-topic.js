'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'category_id', {
      type: Sequelize.INTEGER,
      after: 'category'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'category_id');
  }
};
