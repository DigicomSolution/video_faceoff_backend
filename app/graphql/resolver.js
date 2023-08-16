import users from "../controllers/users";
import auth from "../modules/auth";
import categories from "../controllers/categories";
import topics from "../controllers/topics";
import feeds from "../controllers/feeds";

export default {
  Query: {
    /* User Query Start */
    getUserProfile: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let profile = "";
      profile = await users.getUserProfile({ userId: user.id });
      return profile;
    },
    archivesList: async (
      _,
      { page, pageSize, category_id, claim, type },
      { req, res, next }
    ) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let archive = "";
      archive = await users.archivesList({
        userId: user.id,
        page,
        pageSize,
        category_id,
        claim,
        type,
      });
      return archive;
    },

    archivesListByCategoryFilter: async (
      _,
      { category_id, page, pageSize },
      { req, res, next }
    ) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let archive = "";
      archive = await users.archivesListByCategoryFilter({
        userId: user.id,
        category_id,
        page,
        pageSize,
      });
      return archive;
    },

    followerCount: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let follower = null;
      follower = await users.followerCount({ userId: user.id });
      if (!follower) return false;
      return follower;
    },

    followingCount: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let following = null;
      following = await users.followingCount({ userId: user.id });
      if (!following) return false;
      return following;
    },

    followerList: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let follower = null;
      follower = await users.followerList({ userId: user.id });
      if (!follower) return false;
      return follower;
    },

    followingList: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let following = null;
      following = await users.followingList({ userId: user.id });
      if (!following) return false;
      return following;
    },

    getUserProfileById: async (_, { user_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let profile = "";
      profile = await users.getUserProfileById({
        user_id,
        currentUser: user.id,
      });
      return profile;
    },

    notificationList: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let profile = "";
      profile = await users.notificationList({ userId: user.id });
      return profile;
    },

    getPurchaseLog: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let purchase = "";
      purchase = await users.getPurchaseLog({ userId: user.id });
      return purchase;
    },

    blockList: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let block = "";
      block = await users.blockList({ userId: user.id });
      return block;
    },

    /* User Query End */

    /* Topic Query Start */
    categoryList: async (_, __, { req, res, next }) => {
      const session = await auth.getUserFromSession({ req, res, next });
      if (!session) return new Error("Unauthenticated!");
      let category = null;
      category = await categories.categoryList({ req });
      if (!category) return false;
      return category;
    },

    activeTopic: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let topic = "";
      topic = await topics.activeTopic({ userId: user.id });
      return topic;
    },

    votingFeeds: async (
      _,
      { page, pageSize, claim, sorting_id, topic_id, type },
      { req, res, next }
    ) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let topic = "";
      topic = await feeds.votingFeeds({
        userId: user.id,
        page,
        pageSize,
        claim,
        sorting_id,
        topic_id,
        type,
      });
      return topic;
    },

    commentList: async (_, { topic_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let comment = null;
      comment = await feeds.commentList({ topic_id });
      return comment;
    },

    searchTopic: async (_, { claim, page, pageSize }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let search = "";
      search = await feeds.searchTopic({
        userId: user.id,
        claim,
        page,
        pageSize,
      });
      return search;
    },

    feedSorting: async (
      _,
      { sorting_id, isCategory, page, pageSize },
      { req, res, next }
    ) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let sorting = await feeds.feedSorting({
        userId: user.id,
        sorting_id,
        isCategory,
        page,
        pageSize,
      });
      if (!sorting) return false;
      return sorting;
    },

    usersList: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let users = "";
      users = await feeds.usersList({ userId: user.id });
      return users;
    },

    /* Topic Query End */
  },

  Mutation: {
    /** User Module Start */
    loginViaOtp: async (_, args) => users.loginViaOtp(args),

    verifyOtp: async (_, args, { res }) => {
      const token = await users.verifyOtp(args);

      if (!token) throw new Error("OTP not verified ");
      res.cookie("access-token", token, { expiresIn: "30d" });
      return token;
    },

    createUserProfile: async (_, args, { req, res, next }) => {
      const session = await auth.getSession({ req, res, next });
      if (!session) return new Error("Unauthenticated!");

      let userProfile = null;
      userProfile = await users.createUserProfile(args, {
        phone: session.phone,
      });
      return userProfile;
    },

    editUserProfile: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let profile = "";
      profile = await users.editUserProfile(args, {
        userId: user.id,
        phone: user.phone,
      });
      return profile;
    },

    inviteFriends: async (_, __, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let points = await users.inviteFriends({ userId: user.id });
      if (!points) return false;
      return !!points;
    },

    report: async (_, { topic_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let report = await users.report({ topic_id, userId: user.id });
      if (!report) return false;
      return report;
    },

    feedback: async (_, { rating, message }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let feedbackData = await users.feedback({
        rating,
        message,
        userId: user.id,
      });
      if (!feedbackData) return false;
      return feedbackData;
    },

    pointsPurchaseLog: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let purchase = await users.pointsPurchaseLog(args, { userId: user.id });
      if (!purchase) return false;
      return purchase;
    },

    blockUser: async (_, { blocked_user }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let block = "";
      block = await users.blockUser({ userId: user.id, blocked_user });
      return !!block;
    },

    unblockUser: async (_, { blocked_user }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) throw new Error("Unauthenticated!");
      let unblock = "";
      unblock = await users.unblockUser({ userId: user.id, blocked_user });
      return !!unblock;
    },

    /** User Module End */

    /** Topic Module Start */
    addCategory: async (_, { name }) => {
      let category = null;
      category = await categories.addCategory({ name });
      return !!category;
    },

    createTopic: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let topic = null;
      topic = await topics.createTopic(args, { userId: user.id });
      return topic;
    },

    againstVideo: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let againstData = null;
      againstData = await topics.againstVideo(args, { userId: user.id });
      return againstData;
    },

    comment: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let comment = null;
      comment = await feeds.comment(args, { userId: user.id });
      return comment;
    },

    vote: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let vote = null;
      vote = await feeds.vote(args, { userId: user.id });
      return vote;
    },

    follow: async (_, { followable_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let follow = await feeds.follow({ followable_id, userId: user.id });
      if (!follow) return false;
      return !!follow;
    },

    unfollow: async (_, { followable_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let unfollow = await feeds.unfollow({ followable_id, userId: user.id });
      if (!unfollow) return false;
      return !!unfollow;
    },

    videoViews: async (_, args, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let views = await feeds.videoViews(args, { userId: user.id });
      if (!views) return false;
      return !!views;
    },

    deleteYourSide: async (_, { topic_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let deleted = await topics.deleteYourSide({ userId: user.id, topic_id });
      if (!deleted) return false;
      return !!deleted;
    },

    repostTopic: async (_, { topic_id }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let topic = await topics.repostTopic({ userId: user.id, topic_id });
      if (!topic) return false;
      return topic;
    },

    updateArchiveVideo: async (_, { topic_id, video }, { req, res, next }) => {
      const user = await auth.getUserFromSession({ req, res, next });
      if (!user) return new Error("Unauthenticated!");

      let topic = await topics.updateArchiveVideo({
        userId: user.id,
        topic_id,
        video,
      });
      if (!topic) return false;
      return topic;
    },

    /** Topic Module End */
  },
};
