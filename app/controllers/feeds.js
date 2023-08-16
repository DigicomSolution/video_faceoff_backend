import dotenv from 'dotenv';
dotenv.config();
const Op = require('sequelize').Op;
import db from '../models';
import topicService from '../modules/topicService';

/**
 * @apiVesion 1.0.0
 * @apiName votingFeeds
 * @apiGroup Feed
 * @apiPemission authenticated user
 * @apiDescription voting feed list which all the users can see
 * 
 * @apiType Query
 * @apiQuery votingFeeds
 * 
 * @apiSuccess {Object} returns all topics which are active

 */

const votingFeeds = async({userId, page, pageSize, claim, sorting_id, topic_id, type}) => {
  let feedData, typeData;
  console.log(type, 'type');
  if(type === 1) {
    typeData = 'Feeds';
    feedData = '';
  } else if(type === 2 && claim) {
    typeData = 'Search';
    feedData = claim;
  } else if(type === 3) {
    if(sorting_id === 1) {
      typeData = 'Sorting';
      feedData = 'created_at'; // Featured
    } else if(sorting_id === 2) {
      typeData = 'Sorting';
      feedData = 'timeLeft'; // time left
    } else if(sorting_id === 3) {
      typeData = 'Sorting';
      feedData = 'created_at'; // Most recent
    } else if(sorting_id === 4) {
      typeData = 'Sorting';
      feedData = 'views'; // Most viewed
    } else if(sorting_id === 5) {
      typeData = 'Answered Topics';
      feedData = 'created_at'; // Answered Topics
    } else if(sorting_id === 6) {
      typeData = 'UnAnswered Topics';
      feedData = 'created_at'; // UnAnswered Topics
    }
  } else if(type === 4) {
    typeData = 'Active Topics Feed';
    feedData = topic_id;
  } else if(type === 5) {
    typeData = 'Get Topic By ID';
    feedData = topic_id;
  } else if(type === 6) {
    typeData = 'Sort By Category';
    feedData = sorting_id;
  } else {
    typeData = 'Feeds';
    feedData = '';
  }
  console.log(typeData, 'type 1');
  const feedsList = await topicService.getAllTopicList({userId, topicData: feedData, type: typeData, page, pageSize});
  return feedsList;
};

/**
 * @apiVesion 1.0.0
 * @apiName comment
 * @apiGroup Feed
 * @apiPemission authenticated user
 * @apiDescription post a comment to topic
 * 
 * @apiType Mutation
 * @apiMutation comment
 * @apiMutation commentInput

 * @apiSuccess {Object} return boolean

 */

const comment = async(args, {userId}) => {
  const topic = await db.topic.findOne({
    where: {
      id: { [Op.eq]: args.commentInput.topic_id },
      active: { [Op.eq]: true },
    },
    include: [{
      model: db.iside_user
    }],
    raw:true,
    nest:true    
  }).catch(e => console.log(e));
  if(!topic) throw new Error('topic is not active');
  const isAgainstData = await db.against_video.findAll({
    where: {
      topic_id: { [Op.eq]: topic.id}
    }
  }).catch((e) => console.log(e));
  if(!isAgainstData.length) throw new Error('can\'t comment until against video is not uploaded');
  await db.comment.create({
    commenter: userId,
    comment: args.commentInput.comment,
    topic_id: args.commentInput.topic_id
  }).catch(e => console.log(e));
  await topicService.sendNotificationsInBulk({userData: [topic.user_id], topic, userId, type: 'Comment'});
  return true;
};


/**
 * @apiVesion 1.0.0
 * @apiName commentList
 * @apiGroup Feed
 * @apiPemission authenticated user
 * @apiDescription comment list based on topic id
 * 
 * @apiQuery Mutation
 * @apiMutation commentList
 
 * @apiSuccess {Object} return comment lists

 */

const commentList = async({topic_id}) => {
  const commentData = [];
  const comments = await db.comment.findAll({
    where: {
      topic_id: { [Op.eq]: topic_id }
    },
    order: [
      ['createdAt', 'DESC']
    ],
    include: [{
      model: db.iside_user,
    }],
    raw:true,
    nest:true
  }).catch(e => console.log(e));
  if(!comments.length) throw new Error('No Comments Yet');
  await Promise.all(comments.map(async(i) => {
    commentData.push({
      id: i.id,
      comment: i.comment,
      commenter: i.commenter,
      first_name: i.iside_user.first_name,
      last_name: i.iside_user.last_name,
      created_at: i.createdAt
    });
    return true;
  }));
  return commentData;
};



/**
 * @apiVesion 1.0.0
 * @apiName commentList
 * @apiGroup Feed
 * @apiPemission authenticated user
 * @apiDescription comment list based on topic id
 * 
 * @apiQuery Mutation
 * @apiMutation commentList
 
 * @apiSuccess {Object} return comment lists

 */

const vote = async(args, {userId}) => {
  const topic = await db.topic.findOne({
    where: {
      id: { [Op.eq]: args.voteInput.topic_id },
      active: { [Op.eq]: true },
    },
    include: [{
      model: db.iside_user
    }],
    raw:true,
    nest:true    
  }).catch(e => console.log(e));
  if(!topic) throw new Error('topic is not active');

  const isAgainstData = await db.against_video.findAll({
    where: {
      topic_id: { [Op.eq]: topic.id}
    }
  }).catch((e) => console.log(e));
  if(!isAgainstData.length) throw new Error('can\'t vote until against video is not uploaded');

  let voting_type = '';
  if(args.voteInput.voting_type_flag === 1) {
    voting_type = 'Favour';
  } else if(args.voteInput.voting_type_flag === 0) {
    voting_type = 'Against';
  }
  
  const vote = await db.vote.findOne({
    where: {
      topic_id: { [Op.eq]: args.voteInput.topic_id },
      voter_id: { [Op.eq]: userId },
    },
  }).catch(e => console.log(e));

  if(vote) {
    throw new Error('voted already');
  } else {
    await db.vote.create({
      topic_id: args.voteInput.topic_id,
      voter_id: userId,
      voting_type_flag: args.voteInput.voting_type_flag,
      voting_type,
      vote_flag: true,
    }).catch(e => console.log(e));
    await topicService.addPointsToUser({userId, pointsToAdd: 2, action: 'Voting', topic_id: args.voteInput.topic_id});

    await topicService.sendNotificationsInBulk({userData: [topic.user_id], topic, userId, type: 'Vote'});
  }
  return true;
};


/**
 * @apiVesion 1.0.0
 * @apiName searchTopic
 * @apiGroup Feed
 * @apiPemission authenticated user
 * @apiDescription topic list based on search
 * 
 * @apiQuery Mutation
 * @apiMutation commentList
 
 * @apiSuccess {Object} return topics lists

 */

const searchTopic = async({userId, claim, page, pageSize}) => {
  const topicList = await topicService.getAllTopicList({userId, topicData: claim, type: 'Search', page, pageSize});
  return topicList;
};


/**
 * @apiVersion 1.0.0
 * @apiName follow
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription when user will follow another user 
 * 
 * @apiType Mutation
 * @apiMutation follow
 * @apiMutationInput 
 * 
 * @apiSuccess {Boolean} True/False
 */

const follow = async ({ followable_id , userId }) => {
  if(followable_id === userId) throw new Error('can\'t follow yourself');
  const user = await db.iside_user.findOne({
    where: {
      id: { [Op.eq]: followable_id },
    },
  }).catch(e => console.log(e));
  if (!user) throw new Error('user you want to follow doesn\'t exist');

  const follower = await db.follow.findOne({
    where: {
      followable_id: { [Op.eq]: followable_id },
      follower_id: { [Op.eq]: userId },
    },
  }).catch(e => console.log(e));
  if (follower) throw new Error('Already followed');

  await db.follow.create({
    followable_id: followable_id,
    follower_id: userId,
  }).catch(e => console.log(e));

  return true;
};

/**
 * @apiVersion 1.0.0
 * @apiName unfollow
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription when user will unfollow another user 
 * 
 * @apiType Mutation
 * @apiMutation unfollow
 * @apiMutationInput 
 * 
 * @apiSuccess {Boolean} True/False
 */

const unfollow = async ({ followable_id, userId }) => {
  if(followable_id === userId) throw new Error('invalid followable id');

  const user = await db.iside_user.findOne({
    where: {
      id: { [Op.eq]: followable_id },
    },
  }).catch(e => console.log(e));
  if (!user) throw new Error('user you want to unfollow doesn\'t exist');

  const unfollowing = await db.follow.findOne({
    where: {
      followable_id: { [Op.eq]: followable_id },
      follower_id: { [Op.eq]: userId},
    },
  }).catch(e => console.log(e));
  if (unfollowing) console.log('not following yet');

  await db.follow.destroy({
    where: {
      followable_id: { [Op.eq]: followable_id },
      follower_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  return true;
};


/**
 * @apiVersion 1.0.0
 * @apiName videoViews
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription calculate or add Video Views 
 * 
 * @apiType Mutation
 * @apiMutation unfollow
 * @apiMutationInput 
 * 
 * @apiSuccess {Boolean} True/False
 */

const videoViews = async(args, {userId}) => {
  const topic = await db.topic.findOne({
    where: {
      id: { [Op.eq]: args.videoViewsInput.topic_id}
    }
  }).catch((e) => console.log(e));
  if(!topic) throw new Error('topic doesn\'t exist');

  const view = await db.video_view.findOne({
    where: {
      viewer: userId,
      topic_id: topic.id,
      user_id: topic.user_id,
      video_type_flag: args.videoViewsInput.video_type_flag,
    }
  }).catch((e) => console.log(e));
  if(userId === topic.user_id) throw new Error('viewer and user are same');
  if(view) throw new Error('Already Viewed this video');

  let video_type = '';
  if(args.videoViewsInput.video_type_flag === true) {
    video_type = 'Favour';
  } else if(args.videoViewsInput.video_type_flag === false) {
    video_type = 'Against';
  }
  await db.video_view.create({
    topic_id: topic.id,
    user_id: topic.user_id,
    viewer: userId,
    video_type_flag: args.videoViewsInput.video_type_flag,
    video_type,
    views: 1
  }
  ).then(async() => {
    await db.video_view.count({
      where: {
        topic_id: {[Op.eq]: topic.id },
        views: { [Op.eq]: 1 },
        video_type_flag: { [Op.eq]: true },
        video_type: 'Favour'
      }
    }).then(async(viewsCount) => {
      await topic.update(
        {views: viewsCount },
        {
          where: {
            id: { [Op.eq]: topic.id }
          }
        }
      ).catch((e) => console.log(e));

    }).catch((e) => console.log(e));
  }).
    catch((e) => console.log(e));
  return true;
};


/**
 * @apiVersion 1.0.0
 * @apiName feedSorting
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription feed sorting 
 * 
 * @apiType Query
 * @apiQuery feedSorting 
 * 
 * @apiSuccess {Boolean} True/False
 */

const feedSorting = async({userId, sorting_id, isCategory, page, pageSize}) => {
  let orderType, topicList;
  if(isCategory === false) {
    if (sorting_id === 1) {
      orderType = ['created_at', 'DESC']; // Featured
    } else if (sorting_id === 2) {
      orderType = ['created_at', 'DESC']; // countdown
    } else if (sorting_id === 3) {
      orderType = ['created_at', 'DESC']; // Most recent
    } else if (sorting_id === 4) {
      orderType = ['views', 'DESC']; // Most viewed
    }  
    topicList = await topicService.getAllTopicList({userId, topicData: orderType, type: 'Sorting', page, pageSize});
  } else if(isCategory === true) {
    orderType = sorting_id;
    topicList = await topicService.getAllTopicList({userId, topicData: orderType, type: 'Sort By Category', page, pageSize});
  }
  return topicList;
};


/**
 * @apiVersion 1.0.0
 * @apiName usersList
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription users list  
 * 
 * @apiType Query
 * @apiQuery usersList 
 * 
 * @apiSuccess {Object} data holds user list
 */

async function usersList({userId}) {
  const blockedUsers = await topicService.blockList(userId);
  const users = await db.iside_user.findAll({
    where: {
      id: {[Op.notIn]: blockedUsers}
    },
    include: [{
      model: db.point,
    }],
    raw:true,
    nest:true
  }).catch((e) => console.log(e));
  return users;
}

module.exports = {
  votingFeeds,
  comment,
  commentList,
  vote,
  searchTopic,
  follow,
  unfollow,
  videoViews,
  feedSorting,
  usersList,
};