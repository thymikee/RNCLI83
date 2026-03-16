const createChannel = jest.fn(() => Promise.resolve({}));
const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  MAX: 5,
};
module.exports = {
  createChannel,
  AndroidImportance,
};
