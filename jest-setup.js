const mockNotifee = {
  createChannel: jest.fn(() => Promise.resolve({ id: 'default' })),
  displayNotification: jest.fn(() => Promise.resolve()),
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
  registerForegroundService: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  createTriggerNotification: jest.fn(),
  getTriggerNotification: jest.fn(),
  getDisplayedNotifications: jest.fn(),
  stopForegroundService: jest.fn(),
};

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: mockNotifee,
}));

jest.mock('react-native-permissions', () => ({
  requestNotifications: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));
