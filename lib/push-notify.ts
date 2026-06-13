// lib/push-notify.ts
// Call this from any API route to send a push notification to a user

export async function sendPushNotification({
  userId,
  title,
  body,
  url
}: {
  userId: number | string
  title: string
  body: string
  url?: string
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://biyekori.com'
    await fetch(`${baseUrl}/api/push-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: String(userId), title, body, url })
    })
  } catch (e) {
    // Non-critical — don't throw
    console.error('Push notification failed:', e)
  }
}

// Preset notifications for key events
export const notify = {
  mutualMatch: (userId: number | string, matchName: string) =>
    sendPushNotification({
      userId,
      title: '🎉 মিউচুয়াল ম্যাচ!',
      body: `${matchName} আপনার আগ্রহ গ্রহণ করেছেন — এখনই কথা বলুন!`,
      url: '/messages'
    }),

  newInterest: (userId: number | string, senderName: string) =>
    sendPushNotification({
      userId,
      title: '💕 নতুন আগ্রহ',
      body: `${senderName} আপনার প্রোফাইলে আগ্রহ দেখিয়েছেন`,
      url: '/interests'
    }),

  newMessage: (userId: number | string, senderName: string) =>
    sendPushNotification({
      userId,
      title: '💬 নতুন বার্তা',
      body: `${senderName} আপনাকে একটি বার্তা পাঠিয়েছেন`,
      url: '/messages'
    }),

  profileView: (userId: number | string) =>
    sendPushNotification({
      userId,
      title: '👀 কেউ আপনার প্রোফাইল দেখেছেন',
      body: 'Gold আপগ্রেড করুন — কে দেখেছেন জানুন',
      url: '/pricing'
    })
}
