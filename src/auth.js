const https = require('https');

const { User } = require('./models.js');

const validate = (token) =>
  new Promise((resolve, reject) => {
    https
      .get(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`,
        (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve(JSON.parse(data));
          });
        }
      )
      .on('error', (error) => {
        reject(error);
      });
  });

module.exports = async (request, response, next) => {
  try {
    let authorization = request.headers.authorization;
    if (!authorization) throw { message: 'No authorization header' };
    let token = request.headers.authorization.split(' ')[1];
    let data = await validate(token);
    let _id = data.sub;
    if (!_id) throw { message: 'No user' };
    let user = await User.findById(_id);
    if (!user) {
      let email = data.email;
      const now = new Date();
      let dueDate = now.setMonth(now.getMonth() + 1);
      user = new User({ _id, email, dueDate });
      await user.save();
    }
    request.user = user;
    next();
  } catch (error) {
    response.status(401).json(error);
  }
};
