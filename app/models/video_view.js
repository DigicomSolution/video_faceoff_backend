'use strict';
module.exports = (sequelize, DataTypes) => {
  const video_view = sequelize.define('video_view', {
    topic_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    viewer: DataTypes.INTEGER,
    video_type_flag: DataTypes.BOOLEAN,
    video_type: DataTypes.STRING,
    views: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  video_view.associate = function(models) {
    // associations can be defined here
  };
  return video_view;
};