'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    topic_id: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.STRING,
    receiver_user_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    status: DataTypes.BOOLEAN
  }, {
    'timestamps': true,
    'underscored': true
  });
  notification.associate = function(models) {
    // associations can be defined here
    notification.belongsTo(models.iside_user, { foreignKey: 'sender_id' });
    notification.belongsTo(models.topic, { foreignKey: 'topic_id' });

  };
  return notification;
};