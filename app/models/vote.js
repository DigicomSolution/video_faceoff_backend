'use strict';
module.exports = (sequelize, DataTypes) => {
  const vote = sequelize.define('vote', {
    topic_id: DataTypes.INTEGER,
    voter_id: DataTypes.INTEGER,
    vote_flag: DataTypes.BOOLEAN,
    voting_type_flag: DataTypes.BOOLEAN,
    voting_type: DataTypes.TEXT
  }, {
    'timestamps': true,
    'underscored': true
  });
  vote.associate = function(models) {
    // associations can be defined here
  };
  return vote;
};