'use strict';
module.exports = (sequelize, DataTypes) => {
  const topic = sequelize.define('topic', {
    user_id: DataTypes.INTEGER,
    claim: DataTypes.TEXT,
    category: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    video: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    active: DataTypes.BOOLEAN, // active falg topic is active or not
    is_respond: DataTypes.BOOLEAN,
    views: DataTypes.STRING,
    start_time: DataTypes.DATE, // video uploading time
    end_time: DataTypes.DATE    // timer for voting
  }, {
    'timestamps': true,
    'underscored': true
  });
  topic.associate = function(models) {
    // associations can be defined here
    topic.hasMany(models.comment, {as: 'comments', foreignKey: 'id' });
    topic.hasOne(models.against_video, {as: 'against_video', foreignKey: 'id' });
    topic.belongsTo(models.iside_user, {foreignKey: 'user_id'});
    topic.hasMany(models.notification, { foreignKey: 'id' });

  };
  return topic;
};