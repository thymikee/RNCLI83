package com.rncli83

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Handles broadcast intents (e.g. from adb or tests) and posts a notification
 * so that notification banners appear when the app receives a broadcast.
 *
 * Test with:
 * adb shell am broadcast -a com.rncli83.DISPLAY_NOTIFICATION \
 *   --es title "Test Title" --es body "Test body text"
 */
class NotificationBroadcastReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != ACTION_DISPLAY_NOTIFICATION) return

    val title = intent.getStringExtra(EXTRA_TITLE) ?: "Notification"
    val body = intent.getStringExtra(EXTRA_BODY) ?: ""

    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    ensureChannel(notificationManager, context)

    val contentIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val pendingIntent = PendingIntent.getActivity(
      context,
      0,
      contentIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentTitle(title)
      .setContentText(body)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_MESSAGE)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .build()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (NotificationManagerCompat.from(context).areNotificationsEnabled()) {
        notificationManager.notify(NOTIFICATION_ID, notification)
      }
    } else {
      @Suppress("DEPRECATION")
      notificationManager.notify(NOTIFICATION_ID, notification)
    }
  }

  private fun ensureChannel(notificationManager: NotificationManager, context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Default",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Default notification channel"
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(channel)
    }
  }

  companion object {
    const val ACTION_DISPLAY_NOTIFICATION = "com.rncli83.DISPLAY_NOTIFICATION"
    private const val EXTRA_TITLE = "title"
    private const val EXTRA_BODY = "body"
    private const val CHANNEL_ID = "default"
    private const val NOTIFICATION_ID = 1001
  }
}
