'use strict';
module.exports = (sequelize, DataTypes) => {
  const winner = sequelize.define('winner', {
    topic_id: DataTypes.INTEGER,
    winner_id: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  winner.associate = function(models) {
    // associations can be defined here
  };
  return winner;
};