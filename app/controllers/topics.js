import dotenv from 'dotenv';
dotenv.config();

// const Op = require('sequelize').Op;
import db from '../models';
const Op = require('sequelize').Op;
import upload from '../modules/upload';
const moment = require('moment');
import topicService from '../modules/topicService';
/**
 * @apiVersion 1.0.0
 * @apiName createTopic
 * @apiGroup Topic
 * @apiPermission authenticated user
 * @apiDescription creating topic
 * 
 * @apiType Mutation
 * @apiMutation createTopic
 * @apiMutationInput createTopicInput
 * 
 * @apiSuccess {Object} Boolean type
 */

async function createTopic(args, {userId}) {
  let type;
  const category = await db.category.findOne({
    where : {
      id: { [Op.eq]: args.createTopicInput.category_id }
    }
  }).catch(e => console.log(e));
  if(!category) throw new Error('Invalid Category Id');

  if(args.createTopicInput.video) {
    var decodedVideo = await upload.decodeBase64Video(args.createTopicInput.video);
    var thumbnail = await upload.createThumbnail(decodedVideo);
  }  
  const topic = await db.topic.create({
    user_id: userId,
    claim: args.createTopicInput.claim,
    category_id: category.dataValues.id,
    category: category.dataValues.name,
    video: decodedVideo.Location,
    active: false,
    thumbnail,
    is_respond: args.createTopicInput.is_respond
  }).catch(e => console.log(e));
  if(!topic) throw new Error('Topic creation failed');
  await topicService.addPointsToUser({userId, pointsToAdd: 5, action: 'Post a video', topic_id: topic.id});

  const getFollower = await db.follow.findAll({
    where: {
      followable_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  if(getFollower.length) {
    const followers = getFollower.map((i) => {
      return i.follower_id;
    });
    type = 'Follower Notification';
    await topicService.sendNotificationsInBulk({userData: followers, topic, userId, type});
  }

  if(args.createTopicInput.is_respond === true) {
    type = 'Respond Notification';
    await topicService.sendNotificationsInBulk({userData: args.createTopicInput.responder_id, topic, userId, type});
  }
  return topic; 
}


/**
 * @apiVersion 1.0.0
 * @apiName activeTopicsFeed
 * @apiGroup Topic
 * @apiPermission authenticated user
 * @apiDescription active topics feed list
 * 
 * @apiType Query
 * @apiQuery activeTopicsFeed 
 * @apiSuccess {Object} data holds active topics list
 */

async function activeTopic ( {userId }) {
  const topic = await db.topic.findOne({
    where: {
      user_id: { [Op.eq]: userId },
      active: { [Op.eq]: true }
    }
  })
    .catch(e => console.log(e));
  return topic;
}


/**
 * @apiVersion 1.0.0
 * @apiName againstVideo
 * @apiGroup Topic
 * @apiPermission unauthenticated user
 * @apiDescription creating topic
 * 
 * @apiType Mutation
 * @apiMutation againstVideo
 * @apiMutationInput againstVideoInput
 * 
 * @apiSuccess {Object} Boolean type
 */

async function againstVideo(args, {userId}) {
  const topic = await db.topic.findOne({
    where: {
      id: args.againstVideoInput.topic_id,      
    }
  }).catch(e => console.log(e));
  if(!topic) throw new Error('Invalid topic id');

  let respondersData = [];
  if(topic.is_respond === true) {
    const responderUserIds = await db.responder.findAll({
      where: {
        topic_id: {[Op.eq]: topic.id }
      }
    }).catch((e) => console.log(e));

    respondersData = responderUserIds.map((i) => {
      return i.user_id;
    });
    const responders = respondersData.includes(userId);
    if(responders === false) throw new Error('Only specific user can respond to this video');
    if(responders === true) {
      await topicService.addPointsToUser({userId, pointsToAdd: 5, action: 'Respond to video', topic_id: topic.id});
    }
  }

  const video = await db.against_video.findOne({
    where: {
      topic_id: args.againstVideoInput.topic_id,      
    }
  }).catch(e => console.log(e));
  if(video) throw new Error('Against video is already uploaded');

  if(args.againstVideoInput.video) {
    var decodedVideo = await upload.decodeBase64Video(args.againstVideoInput.video);
    var thumbnail = await upload.createThumbnail(decodedVideo);
  }

  const againstData = await db.against_video.create({
    topic_id: args.againstVideoInput.topic_id,
    against_user: userId,
    against_video: decodedVideo.Location,
    against_video_thumbnail: thumbnail
  }).catch(e => console.log(e));

  await db.topic.update(
    {active: true, start_time: moment().format(), end_time: moment().add(24, 'hours').format()},
    {
      where: {
        id: {[Op.eq]: args.againstVideoInput.topic_id }
      }
    }
  ).catch((e) => console.log(e));
  if(!againstData) throw new Error('couldn\'t upload against video');
  return againstData; 
}

/**
 * @apiVersion 1.0.0
 * @apiName deleteYourSide
 * @apiGroup Topic
 * @apiPermission unauthenticated user
 * @apiDescription delete your side(video) from archhives section
 * 
 * @apiType Mutation
 * @apiMutation deleteYourSide
 * 
 * @apiSuccess {Object} Boolean type
 */

const deleteYourSide = async({userId, topic_id}) => {
  await db.topic.update(
    {video: null, thumbnail: null },
    {
      where: {
        id: {[Op.eq]: topic_id },
        user_id: {[Op.eq]: userId },
        active: {[Op.eq]: false }
      }
    }
  ).catch((e) => console.log(e));
  return true;
};

/**
 * @apiVersion 1.0.0
 * @apiName repostTopic
 * @apiGroup Topic
 * @apiPermission unauthenticated user
 * @apiDescription reposting topic
 * 
 * @apiType Mutation
 * @apiMutation repostTopic
 * 
 * @apiSuccess {Object} Boolean type
 */

const repostTopic = async({userId, topic_id}) => {
  console.log(userId, topic_id, 'ages');
  const topicData = await db.topic.findOne({
    where: {
      id: {[Op.eq]: topic_id },
      user_id: {[Op.eq]: userId }  
    }
  }).catch((e) => console.log(e));
  if(!topicData) throw new Error('Invalid topic');
  console.log(topicData, 'topic data');
  const topic = await db.topic.create({
    user_id: userId,
    claim: topicData.claim,
    category_id: topicData.category_id,
    category: topicData.category,
    video: topicData.video,
    active: false,
    thumbnail: topicData.thumbnail,
  }).catch(e => console.log(e));
  console.log(topic, 'topics');
  return topic;
};


/**
 * @apiVersion 1.0.0
 * @apiName updateArchiveVideo
 * @apiGroup Topic
 * @apiPermission unauthenticated user
 * @apiDescription update your side(video) from archhives section
 * 
 * @apiType Mutation
 * @apiMutation updateArchiveVideo
 * 
 * @apiSuccess {Object} Boolean type
 */

const updateArchiveVideo = async({userId, topic_id, video}) => {
  if(video) {
    var decodedVideo = await upload.decodeBase64Video(video);
    var thumbnail = await upload.createThumbnail(decodedVideo);
  }
  await db.topic.update(
    {video: decodedVideo.Location, thumbnail: thumbnail },
    {
      where: {
        id: {[Op.eq]: topic_id },
        user_id: {[Op.eq]: userId },
        active: {[Op.eq]: false }
      }
    }
  ).catch((e) => console.log(e));
  const topic = await db.topic.findByPk(topic_id);
  return topic;
};


module.exports = {
  createTopic,
  activeTopic,
  againstVideo,
  deleteYourSide,
  repostTopic,
  updateArchiveVideo
};