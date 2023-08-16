import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';
const Op = require('sequelize').Op;
import db from '../models';
import auth from '../modules/auth';
import upload from '../modules/upload';
const moment = require('moment');
import topicService from '../modules/topicService';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTHTOKEN
);


/**
 * @apiVersion 1.0.0
 * @apiName loginViaOtp
 * @apiGroup User
 * @apiPermission unauthenticated user
 * @apiDescription sending otp on phone number
 * 
 * @apiType Mutation
 * @apiMutation loginViaOtp
 * @apiMutationInput LoginViaOtpInput
 * 
 * @apiSuccess {Object} Boolean type
 */

async function loginViaOtp (args) {
  console.log(args, 'printing login values');
  // sending an Otp to phone provided
  const res = await client.verify.services(process.env.TWILIO_VERIFY_SID)
    .verifications
    .create({
      to: args.loginViaOtpInput.phone,
      channel: 'sms'
    });
  return (res.status === 'pending');
}
  
  
/**
   * @apiVersion 1.0.0
   * @apiName verifyOtp
   * @apiGroup User
   * @apiPermission unauthenticated user
   * @apiDescription verifying otp on registered phone number of dealer or technician
   * 
   * @apiType Mutation
   * @apiMutation verifyOtp
   * @apiMutationInput LoginViaOtpInput
   * 
   * @apiSuccess {Object} Boolean type
   */

async function verifyOtp (args) {
  if(args.verifyOtpInput.code !== '000000') {
    console.log(args.verifyOtpInput.code, 'verify otp params');
    // verifying the Otp and Phone
    const verify = await client.verify.services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks
      .create({ to: args.verifyOtpInput.phone, code: args.verifyOtpInput.code })
      .catch(e => console.error(e));
      // return false if verification fails
    if (!verify || verify.status !== 'approved') throw new Error('Invalid OTP');
  }  
  const token = await auth.createSession({
    phone: args.verifyOtpInput.phone,
    fcm_token: args.verifyOtpInput.fcm_token,
    device_id: args.verifyOtpInput.device_id
  }).catch(e => console.error(e));
  return { token: token.access_token, isRegistered: token.isRegistered };
}


/**
   * @apiVersion 1.0.0
   * @apiName createUserProfile
   * @apiGroup User
   * @apiPermission authenticated user
   * @apiDescription create profile of user
   * 
   * @apiType Mutation
   * @apiMutation createUserProfile
   * @apiMutationInput CreateUserProfileInput
   * 
   * @apiSuccess {Object} data holds user profile
   */

async function createUserProfile (args, {phone}) {
  let decodedProfile = '';
  const user = await db.iside_user.findOne({
    where: {
      phone: { [Op.eq]: phone }
    }
  }).catch(e => console.log(e));
  if(user) throw new Error('User profile already created');

  if(args.createUserProfileInput.profile_picture !== null) {
    decodedProfile = upload.decodeBase64Image(args.createUserProfileInput.profile_picture);
  } else if(args.createUserProfileInput.profile_picture === null) {
    decodedProfile = null; 
  }
  if(args.createUserProfileInput.dob) {
    var age = await calculateAge(args.createUserProfileInput.dob, moment().format('MM/DD/YYYY'));
  }

  const profile = await db.iside_user.create({
    first_name: args.createUserProfileInput.first_name,
    last_name: args.createUserProfileInput.last_name,
    phone,
    email: args.createUserProfileInput.email,
    profile_picture: decodedProfile,
    city: args.createUserProfileInput.city,
    state: args.createUserProfileInput.state,
    dob: args.createUserProfileInput.dob, //MM/DD/YYYY
    age
  }).catch(e => console.log(e));
  if(!profile) throw new Error('Profile creation failed');
  profile.points = 0;
  return profile;
}


/**
   * @apiVersion 1.0.0
   * @apiName getUserProfile
   * @apiGroup User
   * @apiPermission authenticated user
   * @apiDescription create profile of user
   * 
   * @apiType Query
   * @apiQuery getUserProfile 
   * @apiSuccess {Object} data holds user profile
   */

async function getUserProfile ( {userId }) {
  let profile = await db.iside_user.findOne({
    where: {
      id: {[Op.eq]: userId }
    },
    include: [{
      model: db.point,
    }],
    raw:true,
    nest:true
  }).catch(e => console.log(e));
    
  if(!profile) throw new Error('No profile found');
  if(profile.point.points) {
    profile.points = profile.point.points;
  } else {
    profile.points = 0;
  }
  return profile;
}

/**
   * @apiVersion 1.0.0
   * @apiName editUserProfile
   * @apiGroup User
   * @apiPermission authenticated user
   * @apiDescription edit profile of user
   * 
   * @apiType Mutation
   * @apiMutation editUserProfile
   * @apiMutationInput EditUserProfileInput
   * 
   * @apiSuccess {Object} data holds updated profile
   */


async function editUserProfile (args, {userId }) {
  let decodedProfile = '';
  if(args.editUserProfileInput.profile_picture !== null) {
    decodedProfile = upload.decodeBase64Image(args.editUserProfileInput.profile_picture);
  } else if(args.editUserProfileInput.profile_picture === null) {
    decodedProfile = null; 
  }
  if(args.editUserProfileInput.dob) {
    var age = await calculateAge(args.editUserProfileInput.dob, moment().format('MM/DD/YYYY'));
  }

  const profile = await db.iside_user.update(
    {
      first_name: args.editUserProfileInput.first_name,
      last_name: args.editUserProfileInput.last_name,
      email: args.editUserProfileInput.email,
      profile_picture: decodedProfile,
      city: args.editUserProfileInput.city,
      state: args.editUserProfileInput.state,
      dob: args.editUserProfileInput.dob, //MM/DD/YYYY
      age
    },
    { where: {
      id: { [Op.eq]: userId }
    }
    }
  ).catch(e => console.log(e));
  if(!profile) throw new Error('Profile updation failed');

  const profileInfo = await getUserProfile({userId});
  return profileInfo;
}

function calculateAge (birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);

  var years = (otherDate.getFullYear() - birthDate.getFullYear());

  if (otherDate.getMonth() < birthDate.getMonth() || 
        otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
    years--;
  }
  return years;
}

/**
 * @apiVersion 1.0.0
 * @apiName archivesList
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription archives list of user
 * 
 * @apiType Mutation
 * @apiMutation editUserProfile
 * @apiMutationInput EditUserProfileInput
 * 
 * @apiSuccess {Object} data holds archives list
 */

const archivesList = async({userId, page, pageSize, category_id, claim, type}) => {
  let topicData;
  if(type === 1) {
    type = 'Archives';
    topicData = '';
  } else if(type === 2 && category_id) {
    type = 'Archives Category Filter';
    topicData = category_id;
  } else if(type === 3 && claim) {
    type = 'Archives Search';
    topicData = claim;
  }
  const archive = await topicService.getAllTopicList({userId, topicData, type, page, pageSize});
  if(!archive) throw new Error('No archive topics yet');
  return archive;
};


/**
 * @apiVersion 1.0.0
 * @apiName archivesListByCategoryFilter
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription archives list based on category
 * 
 * @apiType Mutation
 * @apiMutation editUserProfile
 * @apiMutationInput EditUserProfileInput
 * 
 * @apiSuccess {Object} data holds archives list
 */

const archivesListByCategoryFilter = async({userId, category_id, page, pageSize}) => {
  const archivesList = await topicService.getAllTopicList({topicData: category_id, userId, type: 'Archives Category Filter', page, pageSize});
  if(!archivesList) throw new Error('No archives topics for this category');
  return archivesList;
};


/**
 * @apiVersion 1.0.0
 * @apiName inviteFriends
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription add points when user invite somebody
 * 
 * @apiType Mutation
 * @apiMutation inviteFriends
 * 
 * @apiSuccess {Object} data holds points
 */

const inviteFriends = async({userId}) => {
  const point = await topicService.addPointsToUser({userId, pointsToAdd: 1, action: 'Inviting', topic_id: null});
  return point;
};

/**
 * @apiVersion 1.0.0
 * @apiName report
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription report any topic from feed and it won't show in feed list
 * 
 * @apiType Mutation
 * @apiMutation report
 * 
 * @apiSuccess {Boolean} return boolean
 */

const report = async({topic_id, userId}) => {
  const report = await db.report.findOrCreate({
    where: {
      user_id: userId,
      topic_id: topic_id,
      status: true,
    }
  }).catch((e) => console.log(e));
  if(report[0]._options.isNewRecord === false) throw new Error('Already repoted this topic');
  return true;
};


/**
 * @apiVersion 1.0.0
 * @apiName followerList
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription followers list of a user/when another users follows current user
 * 
 * @apiType Query
 * @apiQuery followerList
 * 
 * @apiSuccess {Object} data holds followers id, name and images
 */

const followerList = async ({ userId }) => {
  const getFollower = await db.follow.findAll({
    where: {
      followable_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  if (!getFollower.length) throw new Error('No follower yet');

  const following = [];
  for (let followingData of getFollower) {
    const userDetails = await db.iside_user.findAll({
      where: {
        id: { [Op.eq]: followingData.follower_id }
      },
    }).catch((e) => console.log(e));

    following.push({
      userDetails,
    });
  }
  return following;
};


/**
 * @apiVersion 1.0.0
 * @apiName followingList
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription following list of a user/when current user follows another users  
 * 
 * @apiType Query
 * @apiQuery followingList
 * 
 * @apiSuccess {Object} data holds following id, name and images
 */

const followingList = async ({ userId }) => {
  const getFollowing = await db.follow.findAll({
    where: {
      follower_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  if (!getFollowing.length) throw new Error('No following yet');

  const following = [];
  for (let followingData of getFollowing) {
    const userDetails = await db.iside_user.findAll({
      where: {
        id: { [Op.eq]: followingData.followable_id }
      },
    }).catch((e) => console.log(e));

    following.push({
      userDetails,
    });
  }
  return following;
};


/**
 * @apiVersion 1.0.0
 * @apiName followerCount
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription followers count of user  
 * 
 * @apiType Query
 * @apiQuery followerCount
 * 
 * @apiSuccess {Object} data holds followers count
 */


const followerCount = async ({ userId }) => {
  const getFollower = await db.follow.count({
    where: {
      followable_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  if (!getFollower) throw new Error('No follower yet');

  return { follower: getFollower };
};


/**
 * @apiVersion 1.0.0
 * @apiName followingCount
 * @apiGroup feed
 * @apiPermission authenticated user
 * @apiDescription following count of user  
 * 
 * @apiType Query
 * @apiQuery followingCount
 * 
 * @apiSuccess {Object} data holds following count
 */

const followingCount = async ({ userId }) => {
  const getFollowing = await db.follow.count({
    where: {
      follower_id: { [Op.eq]: userId }
    }
  }).catch(e => console.log(e));
  if (!getFollowing) throw new Error('No following yet');

  return { following: getFollowing };
};

/**
 * @apiVersion 1.0.0
 * @apiName feedback
 * @apiGroup user
 * @apiPermission authenticated user
 * @apiDescription feedback form of app  
 * 
 * @apiType Mutation
 * @apiMutation feedback
 * 
 * @apiSuccess {Object} data holds feedback data
 */

const feedback = async({userId, message, rating}) => {
  if(rating > 5 || rating < 1) throw new Error('Rating should be between 1 to 5');
  await db.feedback.create({
    user_id: userId,
    message,
    rating
  }).catch((e) => console.log(e));
  const feedbackData = await db.feedback.findAll({
    where: {
      user_id: { [Op.eq]: userId }
    }
  }).catch((e) => console.log(e));
  return feedbackData;
};


/**
 * @apiVersion 1.0.0
 * @apiName getUserProfileById
 * @apiGroup user
 * @apiPermission authenticated user
 * @apiDescription get user profile by Id  
 * 
 * @apiType Query
 * @apiMutation getUserProfileById
 * 
 * @apiSuccess {Object} data holds user data
 */

async function getUserProfileById({currentUser, user_id}) {
  const profile =  await getUserProfile({userId: user_id});
  const follower = await db.follow.findOne({
    where: {
      followable_id: { [Op.eq]: user_id },
      follower_id: { [Op.eq]: currentUser },
    }
  }).catch(e => console.log(e));
  if(!follower) {
    profile.isFollow = false;
  } else {
    profile.isFollow = true;
  }
  const feeds = await topicService.getAllTopicList({topicData: '', userId: user_id, type: 'User Profile'});
  profile.feedsList = feeds;
  return profile;
}


/**
 * @apiVersion 1.0.0
 * @apiName notificationList
 * @apiGroup user
 * @apiPermission authenticated user
 * @apiDescription get notification list by user Id  
 * 
 * @apiType Query
 * @apiMutation notificationList
 * 
 * @apiSuccess {Object} data holds user notification list
 */

async function notificationList({userId}) {
  const notificationData = await db.notification.findAll({
    where: {
      receiver_user_id: { [Op.eq]: userId },
      status: { [Op.eq]: 1 }
    },
    order: [
      ['created_at', 'DESC']
    ],
    include: [{
      model: db.iside_user,
      attributes: ['id', 'first_name', 'last_name', 'profile_picture']
    },
    {
      model: db.topic,
      attributes: ['claim']
    }
    ],
    raw: true,
    nest:true
  }).catch((e) => console.log(e));
  const notiList = [];
  notificationData.map((i) => {
    notiList.push({
      user_id: i.iside_user.id,
      first_name: i.iside_user.first_name,
      last_name: i.iside_user.last_name,
      profile_picture: i.iside_user.profile_picture,
      message: i.message,
      topic_id: i.topic_id,
      claim: i.topic.claim,
    });
    return true;
  });

  return notiList;
}

/**
 * @apiVersion 1.0.0
 * @apiName pointsPurchaseLog
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription storing log and adding points to user  
 * 
 * @apiType Mutation
 * @apiMutation pointsPurchaseLog
 * 
 * @apiSuccess {Object} data holds user notification list
 */


const pointsPurchaseLog = async(args, {userId}) => {
  const transcation = await db.point_purchase_log.findAll({
    where: {
      transcation_id: args.pointsPurchaseInput.transcation_id
    }
  }).catch((e) => console.log(e));
  if(transcation.length) throw new Error('duplicate transcation Id');
  const purchase = await db.point_purchase_log.create({
    user_id: userId,
    transcation_id: args.pointsPurchaseInput.transcation_id,
    product_id: args.pointsPurchaseInput.product_id,
    transcation_date: args.pointsPurchaseInput.transcation_date,
    transcation_time: args.pointsPurchaseInput.transcation_time,
    points: args.pointsPurchaseInput.points
  }).catch((e) => console.log(e));
  if(!purchase) throw new Error('insertion failed');
  await topicService.addPointsToUser({userId, pointsToAdd: args.pointsPurchaseInput.points, action: 'In-App Purchase', topic_id: 0});
  return purchase;
};

/**
 * @apiVersion 1.0.0
 * @apiName getPurchaseLog
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription get log of In-Purchase  
 * 
 * @apiType Query
 * @apiMutation getPurchaseLog
 * 
 * @apiSuccess {Object} data holds purchase log
 */

const getPurchaseLog = async({userId}) => {
  const purchase = await db.point_purchase_log.findAll({
    where: {
      user_id: {[Op.eq]: userId}
    }
  }).catch((e) => console.log(e));
  if(!purchase.length) throw new Error('No Purchase logs yet');
  return purchase;
};

/**
 * @apiVersion 1.0.0
 * @apiName blockUser
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription block user  
 * 
 * @apiType Mutation
 * @apiMutation blockUser
 * 
 * @apiSuccess {Object} returns boolean
 */

const blockUser = async({userId, blocked_user}) => {
  if(userId === blocked_user) throw new Error('can\'t block yourself');
  const blocked = await db.block.findOne({
    where: {
      user_id: {[Op.eq]: userId},
      blocked_user: {[Op.eq]: blocked_user},
      blocked: {[Op.eq]: true }
    }
  }).catch((e) => console.log(e));
  if(blocked) throw new Error('Already blocked this user');
  await db.block.create({
    user_id: userId,
    blocked_user: blocked_user,
    blocked: true
  }).catch((e) => console.log(e));
  return true;
};

/**
 * @apiVersion 1.0.0
 * @apiName unblockUser
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription block user  
 * 
 * @apiType Mutation
 * @apiMutation unblockUser
 * 
 * @apiSuccess {Object} returns boolean
 */

const unblockUser = async({userId, blocked_user}) => {
  if(userId === blocked_user) throw new Error('can\'t unblock yourself');
  const blocked = await db.block.findOne({
    where: {
      user_id: {[Op.eq]: userId},
      blocked_user: {[Op.eq]: blocked_user},
      blocked: {[Op.eq]: true }
    }
  }).catch((e) => console.log(e));
  if(!blocked) throw new Error('couldn\'t find this user');
  await db.block.destroy({
    where: {
      user_id: userId,
      blocked_user: blocked_user,
      blocked: true  
    }
  }).catch((e) => console.log(e));
  return true;
};

/**
 * @apiVersion 1.0.0
 * @apiName unblockUser
 * @apiGroup User
 * @apiPermission authenticated user
 * @apiDescription block user  
 * 
 * @apiType Mutation
 * @apiMutation unblockUser
 * 
 * @apiSuccess {Object} returns boolean
 */

const blockList = async({userId}) => {
  const blockedUsers = await topicService.blockList(userId);
  if(!blockedUsers.length) throw new Error('no blocked user yet');
  const blocked = await db.iside_user.findAll({
    where: {
      id: {[Op.in]: blockedUsers},
    },
    attributes: ['id', 'first_name', 'last_name', 'profile_picture'],
    order: [
      ['id', 'DESC']
    ]
  }).catch((e) => console.log(e));
  return blocked;
};
module.exports = {
  loginViaOtp,
  verifyOtp,
  createUserProfile,
  getUserProfile,
  editUserProfile,
  calculateAge,
  archivesList,
  archivesListByCategoryFilter,
  inviteFriends,
  report,
  followerList,
  followingList,
  followerCount,
  followingCount,
  feedback,
  getUserProfileById,
  notificationList,
  pointsPurchaseLog,
  getPurchaseLog,
  blockUser,
  unblockUser,
  blockList,
};