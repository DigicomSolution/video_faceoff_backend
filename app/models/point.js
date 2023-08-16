'use strict';
module.exports = (sequelize, DataTypes) => {
  const point = sequelize.define('point', {
    user_id: DataTypes.INTEGER,
    points: {
      type: DataTypes.INTEGER,
    }

  }, {
    'timestamps': true,
    'underscored': true
  });
  point.associate = function(models) {
    // associations can be defined here
    point.belongsTo(models.iside_user, { foreignKey: 'id' });
  };
  return point;
};