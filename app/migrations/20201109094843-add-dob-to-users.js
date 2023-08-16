'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('iside_users', 'dob',{
      type: Sequelize.STRING,
      after: 'age'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('iside_users', 'dob');
  }
};
