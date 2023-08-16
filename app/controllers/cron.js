var cron = require('cron');
const moment = require('moment');
import db from '../models';
const Op = require('sequelize').Op;
import topicService from '../modules/topicService';

var cronJob = cron.job('* * * * * *', function(){
  // perform operation e.g. GET request http.get() etc.
  archives();
  console.info('cron job completed');
}); 
cronJob.start();

const archives = async() => {
  let winners;
  const topics = await db.sequelize.query(`select * from topics where active=true and end_time is not null and end_time <= '${moment().format()}'`,{type: db.sequelize.QueryTypes.SELECT});
  console.log(topics.length, 'No active topics');

  topics.map(async(i) => {
    await db.topic.update(
      { active: false },
      {
        where: {
          id: { [Op.eq]: i.id }
        }
      }).catch((e) => console.log(e));
    const winnerData = await db.sequelize.query(`select voting_type_flag,count(*) as counter from votes where topic_id= ${i.id} group by voting_type_flag order by counter desc limit 1`, {type: db.sequelize.QueryTypes.SELECT});
    if(winnerData.length) {
      if(winnerData[0].voting_type_flag === 0) {
        const againstUser = await db.against_video.findAll({
          where: {
            topic_id: { [Op.eq]: i.id }
          },
          attributes: ['against_user']
        }).
          catch((e) => console.log(e));
        winners = againstUser[0].against_user;
        await topicService.addPointsToUser({userId: winners, pointsToAdd: 5, action: 'Win a dispute', topic_id: i.id});
      } else if(winnerData[0].voting_type_flag === 1) {
        winners = i.user_id;
        await topicService.addPointsToUser({userId: winners, pointsToAdd: 1, action: 'Winning vote', topic_id: i.id});
      }
    }
    return true;
  });
  return true;
};

module.exports = {
  archives,
};
