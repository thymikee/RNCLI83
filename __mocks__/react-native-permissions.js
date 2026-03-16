const requestNotifications = jest.fn(() => Promise.resolve({
  status: 'granted',
  settings: {},
}));
module.exports = {
  requestNotifications,
};
