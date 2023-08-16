'use strict';
module.exports = (sequelize, DataTypes) => {
  const follow = sequelize.define('follow', {
    followable_id: DataTypes.INTEGER,
    follower_id: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  follow.associate = function(models) {
    // associations can be defined here
  };
  return follow;
};