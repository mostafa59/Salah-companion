import { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if permission is not granted
    if (permission === 'default') {
      setShowBanner(true);
    }
  }, [permission]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Test notification
        new Notification('🕌 التذكيرات مفعّلة!', {
          body: 'سنذكرك بأوقات الصلاة إن شاء الله',
          icon: '/icon-192.png', // You can add an app icon later
          badge: '/badge-72.png'
        });
        
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  if (!showBanner || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 mx-4 animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔔</span>
          <div>
            <h4 className="text-white font-bold text-sm">تفعيل التذكيرات</h4>
            <p className="text-blue-100 text-xs">سنذكرك بأوقات الصلاة</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={requestPermission}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
          >
            تفعيل
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
