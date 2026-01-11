// client/src/utils/notifications.js

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('⚠️ Notifications not supported in this browser');
    return 'default';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const sendNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options
      });
    } else {
      new Notification(title, {
        icon: '/prayer-icon.png',
        badge: '/prayer-badge.png',
        ...options
      });
    }
  }
};

export const scheduleNotification = (prayerName, timeStr, type) => {
  const PRAYERS_ARABIC = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  const MESSAGES = {
    prep: `⏰ ${PRAYERS_ARABIC[prayerName]} خلال 15 دقيقة - استعد`,
    adhan: `🔊 حان وقت ${PRAYERS_ARABIC[prayerName]} - أقم الصلاة`,
    urgent: `⚠️ وقت ${PRAYERS_ARABIC[prayerName]} انتهى! استعجل للصلاة التالية`
  };

  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

  if (targetTime < now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const delayMs = targetTime.getTime() - now.getTime();

  console.log(
    `📅 [${type.toUpperCase()}] ${PRAYERS_ARABIC[prayerName]} at ${timeStr} - in ${Math.floor(delayMs / 1000)}s`
  );

  setTimeout(() => {
    sendNotification(MESSAGES[type], {
      tag: `prayer-${prayerName}-${type}`,
      requireInteraction: type === 'urgent'
    });
  }, delayMs);
};
