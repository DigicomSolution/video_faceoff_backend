'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('against_videos', 'against_video_thumbnail',{
      type: Sequelize.STRING,
      after: 'against_video'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('against_videos', 'against_video_thumbnail');
  }
};
