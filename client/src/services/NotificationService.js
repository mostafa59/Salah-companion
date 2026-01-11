// client/src/services/NotificationService.js
// CREATE THIS NEW FILE

class NotificationService {
  constructor() {
    this.soundUrl = 'https://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg';
    this.audioElement = null;
  }

  async requestPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }

  sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '🕌',
        badge: '🕌',
        tag: 'prayer-reminder',
        ...options
      });
    }
  }

  async playSound(enabled = true) {
    if (!enabled) return;

    try {
      if (!this.audioElement) {
        this.audioElement = new Audio(this.soundUrl);
        this.audioElement.volume = 0.5;
      }
      
      await this.audioElement.play();
    } catch (error) {
      console.log('Sound playback failed:', error.message);
    }
  }

  schedulePrayerReminder(prayerName, prayerTime, preferences = {}) {
    const { soundEnabled = true, reminderMinutes = 30 } = preferences;

    const [hours, minutes] = prayerTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes - reminderMinutes, 0);

    const timeUntilReminder = reminderTime - new Date();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        this.sendNotification(`حان وقت الاستعداد لصلاة ${prayerName}`, {
          body: `تتبقى ${reminderMinutes} دقيقة على موعد ${prayerName}`,
          requireInteraction: false
        });

        if (soundEnabled) {
          this.playSound(true);
        }
      }, timeUntilReminder);
    }
  }

  sendChallengeNotification(challengeName, progress) {
    this.sendNotification(`🎯 ${challengeName}`, {
      body: `التقدم: ${progress}%`,
      requireInteraction: false
    });
  }

  sendDailySummary(completedPrayers, streak) {
    this.sendNotification('ملخص يومك 📊', {
      body: `لقد صليت ${completedPrayers} من 5 الصلوات | التسلسل: ${streak} أيام`
    });
  }

  sendQadaReminder(outstanding) {
    const total = Object.values(outstanding).reduce((a, b) => a + b, 0);
    if (total > 0) {
      this.sendNotification('تذكير بصلوات القضاء 🤲', {
        body: `لديك ${total} صلوات قضاء متبقية`
      });
    }
  }
}

export default new NotificationService();
