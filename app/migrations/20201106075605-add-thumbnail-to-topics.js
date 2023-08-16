'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('topics', 'thumbnail',{
      type: Sequelize.STRING,
      after: 'video'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('topics', 'thumbnail');
  }
};
