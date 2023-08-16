import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
const Op = require('sequelize').Op;

import db from '../models';
import {v4 as uuid} from 'uuid';


async function getSession ({req, res, next}) {
  const authHeader = req.get('Authorization');

  if(!authHeader) {
    throw new Error('header key is required');
  }
  const token = authHeader.split(' ')[1]; //split Bearer and token

  if(!token || token === '') {
    throw new Error('Invalid token');
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('token verification failed');
  }

  if(!decodedToken) {
    throw new Error('token decodation has failed');
  }

  const session = await db.user_session.findOne({
    where: {
      [Op.and]: {
        id: { [Op.eq]: decodedToken.identifier },
        uuid: { [Op.eq]: decodedToken.key },
        phone: { [Op.eq]: decodedToken.phone },
        status: { [Op.eq]: true }
      }
    }
  }).catch(e => console.error(e));

  if(!session) throw new Error('session not found');
  return session;
}


async function getUserFromSession (token) {
  let user = '';
  const session = await getSession(token);

  if (!session) return null;

  user = await db.iside_user.findOne({
    where: {
      phone: {[Op.eq]: session.phone}
    }
  }).catch(e => console.error(e));
  
  if (!user) return false;

  return user;
}


function generateJwtToken (data) {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

}

function createSession({phone, fcm_token, device_id}) {
  return new Promise((resolve, reject) => {
    const key = uuid();
    // check session and update newest one
    db.user_session.findAll({
      where: {
        phone: { [Op.eq]: phone },
        device_id: {[Op.eq]: device_id}
      },
    }).then(() => {
      db.user_session.update(
        {status: false},
        {
          where: {
            phone: { [Op.eq]: phone },
            device_id: {[Op.eq]: device_id }
          },
        }
      ).then(() => {
        db.user_session.create({
          phone,
          uuid: key,
          fcm_token,
          device_id,
          status: true
        })
          .then(async(sessionDetails) => {
            // generating jwt token for authentication
            const token = generateJwtToken({
              identifier: sessionDetails.id,
              key: sessionDetails.uuid,
              phone: sessionDetails.phone
            });
            const registered =  await verifyRegistration(token);
            let isRegistered = ''; 
            if(!registered) {
              isRegistered = false;
            } else {
              isRegistered = true;
            }
            resolve({ access_token: token, isRegistered });
          })
          .catch(e => reject(e));    
      }).
        catch((e) => console.log(e));      
    }).catch((e) => console.log(e));
      
  });
}

async function verifyRegistration (token) {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('token verification failed');
  }
  const user = await db.iside_user.findOne({
    where: {
      phone: {[Op.eq]: decodedToken.phone}
    }
  }).catch(e => console.error(e));
  
  if (!user) return false;

  return user;
}

export default {
  getSession,
  getUserFromSession,
  generateJwtToken,
  createSession,
  verifyRegistration,
};
