'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comments', 'topic_id',{
      type: Sequelize.INTEGER,
      after: 'commenter',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comments', 'topic_id');
  }
};
