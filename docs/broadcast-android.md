# Android: Testing notification broadcast

The app has a `BroadcastReceiver` that shows a notification when it receives the intent `com.rncli83.DISPLAY_NOTIFICATION`.

**Send a test broadcast (device/emulator):**

```bash
adb shell am broadcast -a com.rncli83.DISPLAY_NOTIFICATION \
  --es title "Test Title" --es body "Test body text"
```

Optional: use a JSON-like payload by sending multiple extras. The receiver reads `title` and `body` string extras.

**Requirements:** App must be installed. Notification permission (POST_NOTIFICATIONS) is required on Android 13+.
