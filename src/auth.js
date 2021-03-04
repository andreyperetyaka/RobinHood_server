const https = require('https');

const { User } = require('./models.js');

const validateToken = (token) =>
  new Promise((resolve, reject) => {
    https
      .get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
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
  if (request.headers.authorization) {
    let token = request.headers.authorization.split(' ')[1];
    let tokenData = await validateToken(token);
    let id = tokenData.sub;
    if (id) {
      let user = await User.findById(id);
      if (!user) {
        const now = new Date();
        let bonusDate = now.setMonth(now.getMonth() + 1);
        user = new User({
          _id: id,
          email: tokenData.email,
          dueDate: bonusDate,
        });
        await user.save();
      }
      request.user = user;
      next();
    } else {
      response.status(419).json({ message: 'Invalid Access Token' });
    }
  } else {
    response.status(401).json({ message: 'Authentication failed!' });
  }
};
