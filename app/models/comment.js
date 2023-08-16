'use strict';
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    topic_id: DataTypes.INTEGER,
    commenter: DataTypes.INTEGER,
    comment: DataTypes.STRING
  }, {
    'timestamps': true,
    'underscored': true
  });
  comment.associate = function(models) {
    // comment.belongsTo(models.topic, {foreignKey: 'topic_id' });
    comment.belongsTo(models.iside_user, {foreignKey: 'commenter'});


    // associations can be defined here
  };
  return comment;
};