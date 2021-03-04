const { model, Schema } = require('mongoose');

exports.User = model(
  'User',
  new Schema({
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    referrer: {
      type: String,
      default: 'none',
    },
  })
);

exports.Number = model(
  'Number',
  new Schema({
    number: {
      type: Number,
      required: true,
    },
    basis: {
      type: Number,
    },
    votes: {
      type: Map,
      of: String,
      default: new Map(),
    },
  })
);
