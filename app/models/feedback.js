'use strict';
module.exports = (sequelize, DataTypes) => {
  const feedback = sequelize.define('feedback', {
    user_id: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    message: DataTypes.STRING
  }, {
    'timestamps': true,
    'underscored': true
  });
  feedback.associate = function(models) {
    // associations can be defined here
  };
  return feedback;
};