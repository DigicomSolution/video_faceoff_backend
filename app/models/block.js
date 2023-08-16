'use strict';
module.exports = (sequelize, DataTypes) => {
  const block = sequelize.define('block', {
    user_id: DataTypes.INTEGER,
    blocked_user: DataTypes.INTEGER,
    blocked: DataTypes.BOOLEAN
  }, {
    'timestamps': true,
    'underscored': true
  });
  block.associate = function(models) {
    // associations can be defined here
  };
  return block;
};