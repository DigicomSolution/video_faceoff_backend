'use strict';
module.exports = (sequelize, DataTypes) => {
  const point_purchase_log = sequelize.define('point_purchase_log', {
    user_id: DataTypes.INTEGER,
    transcation_id: DataTypes.STRING,
    product_id: DataTypes.STRING,
    transcation_date: DataTypes.STRING,
    transcation_time: DataTypes.STRING,
    points: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  point_purchase_log.associate = function(models) {
    // associations can be defined here
  };
  return point_purchase_log;
};