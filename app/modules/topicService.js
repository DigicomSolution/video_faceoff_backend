const Op = require("sequelize").Op;
import db from "../models";
import firebase from "./firebase";
const Sequelize = require("sequelize");
var _ = require("lodash");

const getAllTopicList = async ({ userId, topicData, type, page, pageSize }) => {
  console.log(type, "type data in service");
  let offset;
  if (page && pageSize) {
    offset = 0 + (page - 1) * pageSize;
  }
  // find reported topic by current user
  const reportedTopics = await reportList(userId);
  console.log(reportedTopics, "reportedTopics");
  // find blocked users by current user
  const blockedUsers = await blockList(userId);
  console.log(blockedUsers, "blockedUsers");
  let topics = "";
  // Archives List
  if (type === "Archives") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          active: { [Op.eq]: false },
          user_id: { [Op.eq]: userId },
          video: { [Op.ne]: null },
        },
        order: [["id", "DESC"]],
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    if (!topics) throw new Error("No Archives topic yet");

    // Search
  } else if (type === "Search") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          claim: { [Op.like]: "%" + topicData + "%" },
          id: { [Op.notIn]: reportedTopics },
          user_id: { [Op.notIn]: blockedUsers },
          video: { [Op.ne]: null },
        },
        order: [["id", "DESC"]],
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    // topics = await db.sequelize.query(`select * from topics where claim LIKE '${topicData}%'`,{type: db.sequelize.QueryTypes.SELECT});
    if (!topics) throw new Error("No such topic found");

    // Archives Category Filter
  } else if (type === "Archives Category Filter") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          active: { [Op.eq]: false },
          user_id: { [Op.eq]: userId },
          category_id: { [Op.eq]: topicData },
        },
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    if (!topics) throw new Error("No Archives topic for this category");

    // feed sorting list
  } else if (type === "Archives Search") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          active: { [Op.eq]: false },
          user_id: { [Op.eq]: userId },
          claim: { [Op.like]: "%" + topicData + "%" },
        },
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    // topics = await db.sequelize.query(`select * from topics where claim LIKE '${topicData}%'`,{type: db.sequelize.QueryTypes.SELECT});
    if (!topics) throw new Error("No such archives topic found");
    // Archives Category Filter
  } else if (type === "Sorting") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          id: { [Op.notIn]: reportedTopics },
          user_id: { [Op.notIn]: blockedUsers },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    if (!topics) throw new Error("No Topics Found regarding your sorting");
  } else if (type === "Sort By Category") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          id: { [Op.notIn]: reportedTopics },
          user_id: { [Op.notIn]: blockedUsers },
          category_id: { [Op.eq]: topicData },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    if (!topics) throw new Error("No Topics Found of this category");
  } else if (type === "User Profile") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          user_id: { [Op.eq]: userId },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
  } else if (type === "Active Topics Feed") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          id: {
            [Op.and]: {
              [Op.ne]: topicData,
              [Op.notIn]: reportedTopics,
            },
          },
          video: { [Op.ne]: null },
          user_id: { [Op.notIn]: blockedUsers },
          active: { [Op.eq]: true },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
  } else if (type === "Get Topic By ID") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          id: { [Op.eq]: topicData },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
  } else if (type === "Answered Topics") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          start_time: { [Op.ne]: null },
          end_time: { [Op.ne]: null },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    console.log(topics, "topics");
  } else if (type === "UnAnswered Topics") {
    topics = await db.topic
      .findAndCountAll({
        where: {
          start_time: { [Op.eq]: null },
          end_time: { [Op.eq]: null },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
            attributes: ["id", "first_name", "last_name", "profile_picture"],
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
  } else {
    topics = await db.topic
      .findAndCountAll({
        where: {
          id: { [Op.notIn]: reportedTopics },
          user_id: { [Op.notIn]: blockedUsers },
          video: { [Op.ne]: null },
        },
        include: [
          {
            model: db.iside_user,
          },
        ],
        offset: offset,
        limit: pageSize,
        raw: true,
        nest: true,
      })
      .catch((e) => console.log(e));
    if (!topics) throw new Error("No Topics Found");
  }

  const feedsData = [];

  // get against data of user's topic
  await Promise.all(
    topics.rows.map(async (i) => {
      const againstData = await db.against_video
        .findAll({
          where: {
            topic_id: { [Op.eq]: i.id },
          },
          include: [
            {
              model: db.topic,
            },
            {
              model: db.iside_user,
              attributes: ["id", "first_name", "last_name", "profile_picture"],
            },
          ],
          raw: true,
          nest: true,
        })
        .catch((e) => console.log(e));

      // Total number of comments
      const totalComments = await db.comment
        .count({
          where: {
            topic_id: { [Op.eq]: i.id },
          },
        })
        .catch((e) => console.log(e));

      // Total number of votes
      const totalVotes = await db.vote
        .count({
          where: {
            topic_id: { [Op.eq]: i.id },
            vote_flag: { [Op.eq]: true },
          },
        })
        .catch((e) => console.log(e));

      // Total number of total favour votes
      const totalFavourVotes = await db.vote
        .count({
          where: {
            topic_id: { [Op.eq]: i.id },
            vote_flag: { [Op.eq]: true },
            voting_type_flag: { [Op.eq]: true },
            voting_type: { [Op.eq]: "Favour" },
          },
        })
        .catch((e) => console.log(e));

      // Total number of total against votes
      const totalAgainstVotes = await db.vote
        .count({
          where: {
            topic_id: { [Op.eq]: i.id },
            vote_flag: { [Op.eq]: true },
            voting_type_flag: { [Op.eq]: false },
            voting_type: { [Op.eq]: "Against" },
          },
        })
        .catch((e) => console.log(e));

      // current user follows or not feed's user
      let isFollow;
      const follower = await db.follow
        .findOne({
          where: {
            followable_id: { [Op.eq]: i.user_id },
            follower_id: { [Op.eq]: userId },
          },
        })
        .catch((e) => console.log(e));
      if (!follower) {
        isFollow = false;
      } else {
        isFollow = true;
      }
      // get current user vote side for every topic/post
      const vote = await db.vote
        .findOne({
          where: {
            topic_id: { [Op.eq]: i.id },
            voter_id: { [Op.eq]: userId },
          },
        })
        .catch((e) => console.log(e));
      let voting_type, voting_type_flag;
      if (vote) {
        voting_type = vote.voting_type;
        voting_type_flag = vote.voting_type_flag;
      } else {
        voting_type = null;
        voting_type_flag = null;
      }
      let against_user,
        against_video,
        against_video_thumbnail,
        against_username,
        against_profile_picture,
        timeDiff,
        userIsResponder,
        responder_id,
        responder_name;
      if (againstData.length) {
        against_user = againstData[0].against_user;
        against_username =
          againstData[0].iside_user.first_name +
          " " +
          againstData[0].iside_user.last_name;
        against_profile_picture = againstData[0].iside_user.profile_picture;
        against_video = againstData[0].against_video;
        against_video_thumbnail = againstData[0].against_video_thumbnail;
      } else {
        against_user = null;
        against_video = null;
        against_video_thumbnail = null;
        against_username = null;
      }
      // calculate time left
      if (i.end_time !== null) {
        const currentTime = new Date();
        if (i.end_time > currentTime) {
          timeDiff = Math.ceil(
            (i.end_time.getTime() - currentTime.getTime()) / 1000
          );
        } else if (i.end_time < currentTime) {
          timeDiff = 0;
        }
      } else if (i.end_time === null) {
        timeDiff = 0;
      }

      // current user is in responder list or not
      if (i.is_respond === 1) {
        const responderData = await db.responder
          .findOne({
            where: {
              topic_id: { [Op.eq]: i.id },
            },
            include: [
              {
                model: db.iside_user,
                attributes: ["id", "first_name", "last_name"],
              },
            ],
          })
          .catch((e) => console.log(e));
        if (responderData) {
          responder_id = responderData.iside_user.id;
          responder_name =
            responderData.iside_user.first_name +
            " " +
            responderData.iside_user.last_name;
        }
        const responder = await db.responder
          .findOne({
            where: {
              topic_id: { [Op.eq]: i.id },
              user_id: { [Op.eq]: userId },
            },
          })
          .catch((e) => console.log(e));
        if (responder) {
          userIsResponder = true;
        } else {
          userIsResponder = false;
        }
      } else if (i.is_respond === 0) {
        userIsResponder = true;
      }

      // get winner of the topic
      feedsData.push({
        id: i.id,
        username: i.iside_user.first_name + " " + i.iside_user.last_name,
        user_id: i.user_id,
        profile_picture: i.iside_user.profile_picture,
        claim: i.claim,
        video: i.video,
        thumbnail: i.thumbnail,
        category: i.category,
        category_id: i.category_id,
        active: i.active,
        against_user,
        against_username,
        against_profile_picture,
        against_video,
        against_video_thumbnail,
        start_time: i.start_time,
        end_time: i.end_time,
        voting_type,
        voting_type_flag,
        totalComments,
        totalVotes,
        totalFavourVotes,
        totalAgainstVotes,
        views: i.views,
        isFollow,
        timeLeft: timeDiff,
        created_at: i.createdAt,
        userIsResponder,
        responder_id,
        responder_name,
      });
    })
  );

  var feedsList;
  if (
    type === "Sorting" ||
    type === "Answered Topics" ||
    type === "UnAnswered Topics"
  ) {
    console.log(topicData, "topicData");
    feedsList = _.orderBy(feedsData, [topicData], ["desc"]);
  } else {
    feedsList = _.orderBy(feedsData, ["created_at"], ["desc"]);
  }
  return feedsList;
};

async function reportList(userId) {
  // find reported topic of current user
  const reports = await db.report
    .findAll({
      where: {
        user_id: { [Op.eq]: userId },
        status: { [Op.eq]: 1 },
      },
      attributes: ["topic_id"],
    })
    .catch((e) => console.log(e));
  const reportedTopics = reports.map((i) => {
    return i.topic_id;
  });
  return reportedTopics;
}

async function addPointsToUser({ userId, pointsToAdd, action, topic_id }) {
  await db.point_log
    .create({
      user_id: userId,
      points: pointsToAdd,
      action,
      topic_id,
    })
    .catch((e) => console.log(e));
  const points = await db.point
    .findOne({
      where: {
        user_id: { [Op.eq]: userId },
      },
    })
    .catch((e) => console.log(e));
  if (points) {
    await db.point
      .update(
        { points: points.dataValues.points + parseInt(pointsToAdd, 10) },
        {
          where: {
            user_id: { [Op.eq]: userId },
          },
        }
      )
      .catch((e) => console.log(e));
  } else {
    await db.point
      .create({
        user_id: userId,
        points: pointsToAdd,
      })
      .catch((e) => console.log(e));
  }
  return true;
}

async function blockList(userId) {
  // find blocked user of current user
  const blocksData = await db.block
    .findAll({
      where: {
        user_id: { [Op.eq]: userId },
        blocked: { [Op.eq]: true },
      },
      attributes: ["blocked_user"],
    })
    .catch((e) => console.log(e));
  const blockedUsers = blocksData.map((i) => {
    return i.blocked_user;
  });
  return blockedUsers;
}

async function sendNotificationsInBulk({ userData, topic, userId, type }) {
  let msg, notiType;
  for (let receiver of userData) {
    if (type === "Respond Notification") {
      await db.responder
        .create({
          topic_id: topic.id,
          user_id: receiver,
        })
        .catch((e) => console.log(e));
    }
    db.iside_user
      .findOne({
        where: {
          id: { [Op.eq]: receiver },
        },
        attributes: ["phone", "first_name"],
      })
      .then((users) => {
        db.user_session
          .findAll({
            where: {
              phone: { [Op.eq]: users.phone },
              status: { [Op.eq]: true },
            },
            attributes: [
              [Sequelize.literal("DISTINCT `device_id`"), "device_id"],
              "device_id",
              "fcm_token",
            ],
          })
          .then((userFcmToken) => {
            if (type === "Respond Notification") {
              msg = "mentioned you to respond on" + " " + topic.claim;
              notiType = "Mentioned to respond";
            } else if (type === "Follower Notification") {
              msg = "posted a new topic" + " " + topic.claim;
              notiType = "My Following posted a video";
            } else if (type === "Comment") {
              msg = "commented on" + " " + topic.claim;
              notiType = "Comment";
            } else if (type === "Vote") {
              msg = "is on your side in" + " " + topic.claim;
              notiType = "Vote";
            }
            db.notification
              .create({
                topic_id: topic.id,
                message: msg,
                sender_id: userId,
                receiver_user_id: receiver,
                status: false,
              })
              .then((notification) => {
                for (let sessionData of userFcmToken) {
                  db.iside_user
                    .findByPk(userId)
                    .then((userDetails) => {
                      firebase.sendMessageToUser({
                        registrationToken: sessionData.fcm_token,
                        msgBody:
                          userDetails.first_name +
                          " " +
                          notification.dataValues.message,
                        notificationType: notiType,
                      });
                      db.notification
                        .update(
                          { status: true },
                          {
                            where: {
                              id: { [Op.eq]: notification.id },
                            },
                          }
                        )
                        .catch((e) => console.log(e));
                    })
                    .catch((e) => console.log(e));
                }
              })
              .catch((e) => console.log(e));
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  }
}

module.exports = {
  getAllTopicList,
  reportList,
  addPointsToUser,
  blockList,
  sendNotificationsInBulk,
};
