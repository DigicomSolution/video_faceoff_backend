import dotenv from 'dotenv';
dotenv.config();

const mime = require('mime');
const AWS = require('aws-sdk');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const s3 = new AWS.S3();


function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};

  if (!matches) {
    throw new Error('Invalid input for image');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  var imageBuffer = response.data;
  var type = response.type;
  var extension = mime.extension(type);
  var fileName =  Date.now() + '.' + extension;
  const imagePath = 'uploads/'+ fileName;
  fs.writeFile(imagePath, imageBuffer, 'utf8', function(err) {
    console.log(err);
  });

  return imagePath;
}

function decodeBase64Video(dataString) {
  var matches = dataString.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/),
    response = {};
  if (!matches) {
    throw new Error('Invalid input for video');
  }
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  var imageBuffer = response.data;
  console.log(response.type,'response type');
  var type = response.type;
  var extension = mime.extension(type);
  var fileName =  Date.now() + '.' + extension;
  const imagePath = 'videos/'+ fileName;
  
  const params = {
    Bucket: 'iside',
    Key: imagePath, // File name you want to save as in S3
    Body: imageBuffer,
    ACL:'public-read',
    ContentEncoding: 'base64', // required
    ContentType: `${type}`,
  };
  return s3.upload(params).promise();
}


function createThumbnail(decodedVideo) {
  const videName = decodedVideo.Key;
  const thumbFile = (videName.split('/')[1]).split('.')[0];
  let thumbnail = '';

  new ffmpeg(`${decodedVideo.Location}`)
    .on('filenames', function(filenames) {
      console.log('screenshots are ' + filenames.join(', '));
      thumbnail = 'uploads/' + filenames.join(', ');
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    .takeScreenshots({ timemarks: [ '00:00:02.000' ],filename: thumbFile }, 'uploads/');
  return thumbnail;
}
module.exports = {
  decodeBase64Image,
  decodeBase64Video,
  createThumbnail,
};
