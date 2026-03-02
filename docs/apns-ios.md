# iOS: Testing remote push (simctl)

The app registers for remote notifications and shows a **banner** when a push is received (including in foreground), via `UNUserNotificationCenterDelegate`.

**Send a test push to the simulator:**

1. Build and run the app on a simulator.
2. Create a payload file (e.g. `apns.json`):

```json
{
  "aps": {
    "alert": {
      "title": "Test Title",
      "body": "Test body text"
    },
    "sound": "default",
    "badge": 1
  }
}
```

3. Run (replace `booted` with simulator ID if needed):

```bash
xcrun simctl push booted org.reactjs.native.example.RNCLI83 apns.json
```

**Note:** Use your app’s real bundle ID if you changed it (check `PRODUCT_BUNDLE_IDENTIFIER` in Xcode).  
**Foreground:** Banners are shown because `willPresent` uses `[.banner, .sound, .badge, .list]`.
