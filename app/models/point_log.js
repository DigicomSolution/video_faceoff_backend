'use strict';
module.exports = (sequelize, DataTypes) => {
  const point_log = sequelize.define('point_log', {
    user_id: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
    action: DataTypes.STRING,
    topic_id: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  point_log.associate = function(models) {
    // associations can be defined here
  };
  return point_log;
};