'use strict';
module.exports = (sequelize, DataTypes) => {
  const iside_user = sequelize.define('iside_user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.INTEGER,
    age: DataTypes.STRING,
    dob: DataTypes.STRING,
  }, {
    'timestamps': true,
    'underscored': true
  });
  iside_user.associate = function(models) {
    iside_user.hasMany(models.topic, {as: 'topics', foreignKey: 'id' });
    iside_user.hasMany(models.report, { foreignKey: 'id' });
    iside_user.hasOne(models.point, { foreignKey: 'user_id' });
    iside_user.hasMany(models.notification, { foreignKey: 'id' });
  };
  return iside_user;
};