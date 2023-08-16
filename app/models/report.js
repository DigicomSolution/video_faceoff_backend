'use strict';
module.exports = (sequelize, DataTypes) => {
  const report = sequelize.define('report', {
    user_id: DataTypes.INTEGER,
    topic_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN
  }, {
    'timestamps': true,
    'underscored': true
  });
  report.associate = function(models) {
    // associations can be defined here
    report.belongsTo(models.iside_user, {foreignKey: 'user_id'});
  };
  return report;
};