"use strict";
module.exports = (sequelize, DataTypes) => {
  const against_video = sequelize.define(
    "against_video",
    {
      topic_id: DataTypes.INTEGER,
      against_user: DataTypes.INTEGER,
      against_video: DataTypes.STRING,
      against_video_thumbnail: DataTypes.STRING,
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  against_video.associate = function (models) {
    // associations can be defined here
    against_video.belongsTo(models.topic, { foreignKey: "topic_id" });
    against_video.belongsTo(models.iside_user, { foreignKey: "against_user" });
  };
  return against_video;
};
