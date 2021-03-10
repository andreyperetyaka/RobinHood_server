const { User, Vote } = require('./models.js');

const convertDocumentToVote = (document, id) => {
  let number = document.number;
  let basis = document.basis || 0;
  let users = [...document.users.values()];
  let good = users.filter((user) => user === 'good').length;
  let bad = users.filter((user) => user === 'bad').length + basis;
  let voted = document.users.get(id);
  return { number, good, bad, voted };
};

const addMonth = (model) => {
  let dueDate = new Date(model.dueDate);
  let basis = dueDate > Date.now() ? dueDate : new Date();
  let bonus = basis.setMonth(basis.getMonth() + 1);
  model.dueDate = bonus;
  return model.save();
};

exports.login = async (request, response) => {
  let price = process.env.PRICE;
  let user = { ...request.user.toJSON(), price };
  response.status(200).json(user);
};

exports.getVotes = async (request, response) => {
  try {
    let params = request.query.numbers;
    if (!params) throw { message: 'No query' };
    let numbers = params.split(',');
    if (numbers.length > 10) throw { message: 'Please less then 10 numbers' };
    let user = request.user;
    if (user.dueDate > Date.now()) {
      let documents = await Vote.find({ number: numbers });
      let votes = documents.map((document) =>
        convertDocumentToVote(document, user._id)
      );
      response.status(200).json(votes);
    } else {
      response.status(403).json({ message: 'Access Denied' });
    }
  } catch (error) {
    response.status(400).json(error);
  }
};

exports.postVote = async (request, response) => {
  try {
    let id = request.user._id;
    let { number, vote } = request.body;
    let document = await Vote.findOne({ number });
    if (!document) {
      document = new Vote({ number });
    }
    document.users.set(id, vote);
    await document.save();
    response.status(200).json(convertDocumentToVote(document, id));
  } catch (error) {
    response.status(400).json(error);
  }
};

exports.referrer = async (request, response) => {
  try {
    let user = request.user;
    if (user.referrer !== 'none')
      throw { message: 'You already have a referrer' };
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
    response.status(200).json({ user, answer });
  } catch (error) {
    response.status(400).json(error);
  }
};
