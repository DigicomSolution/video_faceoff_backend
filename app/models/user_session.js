'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_session = sequelize.define('user_session', {
    phone: DataTypes.STRING,
    uuid: DataTypes.UUID,
    fcm_token: DataTypes.STRING,
    device_id: DataTypes.STRING,
    status: DataTypes.BOOLEAN,

  }, {
    'timestamps': true,
    'underscored': true
  });
  user_session.associate = function(models) {
    // associations can be defined here
    user_session.belongsTo(models.iside_user, { foreignKey: 'phone' });
  };
  return user_session;
};