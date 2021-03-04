const { User, Number } = require('./models.js');
const { errorHandler } = require('./utils');

const convertDocumentToVote = (document, id) => {
  let number = document.number;
  let basis = document.basis || 0;
  let votes = [...document.votes.values()];
  let good = votes.filter((vote) => vote === 'good').length;
  let bad = votes.filter((vote) => vote === 'bad').length + basis;
  let voted = document.votes.get(id);
  return { number, good, bad, voted };
};

const addMonth = (model) => {
  let dueDate = new Date(model.dueDate);
  let basis = dueDate > Date.now() ? dueDate : new Date();
  let bonus = basis.setMonth(basis.getMonth() + 1);
  model.dueDate = bonus;
  return model.save();
};

exports.check = async (request, response) => {
  try {
    if (request.body.length > 10)
      throw new Error('Please less than 10 numbers per request!');
    let user = { ...request.user.toJSON(), price: process.env.PRICE };
    if (user.dueDate > Date.now()) {
      let data = await Number.find({ number: request.body });
      let numbers = data.map((document) =>
        convertDocumentToVote(document, user._id)
      );
      response.status(200).json({ user, numbers });
    } else {
      response.status(200).json({ user });
    }
  } catch (error) {
    errorHandler(error, response);
  }
};

exports.vote = async (request, response) => {
  try {
    let id = request.user._id;
    let number = request.body.number;
    let vote = request.body.vote;
    let document = await Number.findOne({ number });
    if (!document) {
      document = new Number({ number });
    }
    document.votes.set(id, vote);
    await document.save();
    response.status(200).json(convertDocumentToVote(document, id));
  } catch (error) {
    errorHandler(error, response);
  }
};

exports.referrer = async (request, response) => {
  try {
    let user = request.user;
    if (user.referrer !== 'none') throw new Error('You already used a code!');
    user.referrer = request.body.referrer;
    await user.save();
    let referrer =
      user._id === request.body.referrer
        ? null
        : await User.findById(request.body.referrer);
    if (referrer) {
      await addMonth(referrer);
      await addMonth(user);
    }
    let answer = !!referrer;
    user = { ...user.toJSON(), price: process.env.PRICE };
    response.status(200).json({ answer, user });
  } catch (error) {
    errorHandler(error, response);
  }
};
