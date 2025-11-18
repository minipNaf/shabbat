import { supabase } from '../lib/supabase';

export interface UserReminders {
  advanceMinutes: number;
  channels: string[];
  phoneNumber: string | null;
  emailAddress: string | null;
  isEnabled: boolean;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
}

function sendPushNotification(title: string, options: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

async function sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        phoneNumber,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

async function sendEmailNotification(emailAddress: string, candleLightingTime: string, cityName: string): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reminder-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailAddress,
        candleLightingTime,
        cityName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

export async function initializeReminderService(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/reminder-worker.js', {
      scope: '/',
    });

    registration.active?.postMessage({
      type: 'INIT_REMINDERS',
      userId,
    });
  } catch (error) {
    console.error('Error registering service worker:', error);
  }
}

export async function sendReminder(
  reminders: UserReminders,
  candleLightingTime: Date,
  cityName: string
): Promise<void> {
  if (!reminders.isEnabled) {
    return;
  }

  const timeString = candleLightingTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const message = `Shabbat candle lighting in ${cityName} at ${timeString}`;

  if (reminders.channels.includes('push')) {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      sendPushNotification('Shabbat Reminder', {
        body: message,
        tag: 'shabbat-reminder',
      });
    }
  }

  if (reminders.channels.includes('email') && reminders.emailAddress) {
    await sendEmailNotification(reminders.emailAddress, timeString, cityName);
  }

  if (reminders.channels.includes('sms') && reminders.phoneNumber) {
    await sendSMSNotification(reminders.phoneNumber, message);
  }
}

export async function checkAndSendReminders(
  userId: string,
  savedCityLatitude: number,
  savedCityLongitude: number,
  cityName: string
): Promise<void> {
  try {
    const { data: preferences, error } = await supabase
      .from('user_reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !preferences) {
      return;
    }

    const reminders: UserReminders = {
      advanceMinutes: preferences.advance_minutes,
      channels: preferences.channels || [],
      phoneNumber: preferences.phone_number,
      emailAddress: preferences.email_address,
      isEnabled: preferences.is_enabled !== false,
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dayOfWeek = tomorrow.getDay();
    if (dayOfWeek !== 5) {
      return;
    }

    const times = (await import('../utils/shabbatTimes')).getShabbatTimes(
      savedCityLatitude,
      savedCityLongitude,
      reminders.advanceMinutes
    );

    if (!times) {
      return;
    }

    const reminderTime = new Date(times.candleLighting);
    reminderTime.setMinutes(reminderTime.getMinutes() - reminders.advanceMinutes);

    const timeDiff = reminderTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > 0 && minutesDiff < 5) {
      await sendReminder(reminders, times.candleLighting, cityName);
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

export function startReminderPolling(
  userId: string,
  savedCityLatitude: number,
  savedCityLongitude: number,
  cityName: string,
  intervalMinutes: number = 1
): () => void {
  const intervalId = setInterval(() => {
    checkAndSendReminders(userId, savedCityLatitude, savedCityLongitude, cityName);
  }, intervalMinutes * 60 * 1000);

  return () => clearInterval(intervalId);
}
