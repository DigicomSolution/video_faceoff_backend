'use strict';
module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('category', {
    name: DataTypes.STRING
  }, {
    'timestamps': true,
    'underscored': true
  });
  category.associate = function(models) {
    // associations can be defined here
  };
  return category;
};