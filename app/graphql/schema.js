import { gql } from "apollo-server-express";

export default gql`
  scalar Date

  type Query {
    getUserProfile: UserProfile!
    categoryList: [Category]
    activeTopic: ActiveTopic
    votingFeeds(
      page: Int
      pageSize: Int
      claim: String
      isCategory: Boolean
      sorting_id: Int
      topic_id: Int
      type: Int!
    ): [VotingFeeds]
    commentList(topic_id: Int): [CommentList]
    searchTopic(claim: String): [VotingFeeds]
    archivesList(
      page: Int
      pageSize: Int
      category_id: Int
      claim: String
      type: Int!
    ): [VotingFeeds]
    archivesListByCategoryFilter(
      category_id: Int
      page: Int
      pageSize: Int
    ): [VotingFeeds]
    followerCount: FollowerCount
    followingCount: FollowingCount
    followerList: [FollowerList!]!
    followingList: [FollowingList!]!
    feedSorting(
      isCategory: Boolean!
      sorting_id: Int!
      page: Int
      pageSize: Int
    ): [VotingFeeds]
    getUserProfileById(user_id: Int): UserProfile
    notificationList: [NotificationList]
    usersList: [UserProfile]
    getPurchaseLog: [Purchase]
    blockList: [UserDetails]
  }

  type AuthData {
    token: String!
    isRegistered: String!
  }

  type UserProfile {
    id: ID
    first_name: String
    last_name: String
    email: String
    profile_picture: String
    phone: String
    city: String
    state: Int
    dob: String
    age: String
    points: Int
    isFollow: Boolean
    feedsList: [VotingFeeds]
  }

  type Topic {
    id: ID
    claim: String
    category_id: Int
    category: String
    video: String
    thumbnail: String
    start_time: Date
    end_time: Date
  }

  type AgainstVideoData {
    id: ID!
    topic_id: ID!
    against_video: String!
    against_video_thumbnail: String!
    against_user: Int!
  }

  type ActiveTopic {
    id: ID
    claim: String
    category_id: Int
    category: String
    video: String
    start_time: Date
    end_time: Date
    active: Boolean
  }

  type Category {
    id: ID
    name: String
  }

  type VotingFeeds {
    id: ID
    username: String
    user_id: ID
    profile_picture: String
    claim: String
    video: String
    thumbnail: String
    category: String
    category_id: Int
    against_user: ID
    against_username: String
    against_profile_picture: String
    against_video: String
    active: Boolean
    against_video_thumbnail: String
    start_time: Date
    end_time: Date
    totalComments: String
    voting_type: String
    voting_type_flag: Int
    totalVotes: String
    totalFavourVotes: String
    totalAgainstVotes: String
    views: Int
    isFollow: Boolean
    timeLeft: String
    created_at: Date
    userIsResponder: Boolean
    responder_id: Int
    responder_name: String
  }

  type CommentList {
    id: ID
    comment: String
    commenter: ID
    first_name: String
    last_name: String
    created_at: Date
  }

  type FollowingCount {
    following: Int!
  }

  type FollowerCount {
    follower: Int!
  }

  type FollowerList {
    userDetails: [UserDetails!]!
  }

  type FollowingList {
    userDetails: [UserDetails!]!
  }

  type UserDetails {
    id: Int
    first_name: String
    last_name: String
    profile_picture: String
  }

  type Feedback {
    user_id: ID
    rating: Int
    message: String
  }

  type NotificationList {
    user_id: ID
    first_name: String
    last_name: String
    profile_picture: String
    message: String
    topic_id: ID
    claim: String
  }

  type Purchase {
    transcation_id: String
    product_id: String
    transcation_date: String
    transcation_time: String
    points: Int
  }

  input LoginViaOtpInput {
    phone: String!
  }

  input VerifyOtpInput {
    phone: String!
    code: String!
    fcm_token: String!
    device_id: String!
  }

  input CreateUserProfileInput {
    first_name: String
    last_name: String
    email: String
    profile_picture: String
    city: String
    state: Int
    dob: String
  }

  input CreateTopicInput {
    claim: String!
    category_id: Int!
    category: String
    video: String
    is_respond: Boolean!
    responder_id: [Int]
  }

  input EditUserProfileInput {
    first_name: String
    last_name: String
    email: String
    profile_picture: String
    city: String
    state: Int
    dob: String
  }

  input AgainstVideoInput {
    topic_id: Int!
    video: String!
  }

  input CommentInput {
    comment: String!
    topic_id: Int!
  }

  input VoteInput {
    topic_id: Int!
    vote_flag: Int
    voting_type_flag: Int!
  }

  input VideoViewsInput {
    topic_id: Int
    video_type_flag: Boolean
  }

  input PointsPurchaseInput {
    transcation_id: String
    product_id: String
    transcation_date: String
    transcation_time: String
    points: Int
  }

  type Mutation {
    loginViaOtp(loginViaOtpInput: LoginViaOtpInput!): Boolean!

    verifyOtp(verifyOtpInput: VerifyOtpInput!): AuthData!

    createUserProfile(
      createUserProfileInput: CreateUserProfileInput
    ): UserProfile!

    editUserProfile(editUserProfileInput: EditUserProfileInput): UserProfile!

    addCategory(name: [String]): Boolean!

    createTopic(createTopicInput: CreateTopicInput): Topic!

    againstVideo(againstVideoInput: AgainstVideoInput): AgainstVideoData!

    comment(commentInput: CommentInput): Boolean!

    vote(voteInput: VoteInput): Boolean!

    follow(followable_id: Int!): Boolean!

    unfollow(followable_id: Int!): Boolean!

    inviteFriends: Boolean!

    videoViews(videoViewsInput: VideoViewsInput!): Boolean!

    report(topic_id: Int): Boolean

    feedback(rating: Int!, message: String): [Feedback]

    deleteYourSide(topic_id: Int): Boolean

    repostTopic(topic_id: Int): Topic

    updateArchiveVideo(topic_id: Int, video: String): Topic

    pointsPurchaseLog(pointsPurchaseInput: PointsPurchaseInput): Purchase

    blockUser(blocked_user: Int): Boolean

    unblockUser(blocked_user: Int): Boolean
  }
`;
