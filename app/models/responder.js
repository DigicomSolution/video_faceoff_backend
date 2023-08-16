'use strict';
module.exports = (sequelize, DataTypes) => {
  const responder = sequelize.define('responder', {
    topic_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    'timestamps': true,
    'underscored': true
  });
  responder.associate = function(models) {
    // associations can be defined here
    responder.belongsTo(models.iside_user, {foreignKey: 'user_id'});

  };
  return responder;
};