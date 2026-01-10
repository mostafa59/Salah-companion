import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomTabs from '../components/BottomTabs';
import ThemeToggle from '../components/ThemeToggle';

function Social() {
  const { user, loading } = useAuth(); // ← Get loading state too!
  const API_BASE = 'https://zany-space-system-64pwg7rrrp2r6p5-5000.app.github.dev/api';
  
  const [friendCode, setFriendCode] = useState('');
  const [message, setMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });

  useEffect(() => {
    if (user && user.id) { // ← Changed from user._id to user.id
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_BASE}/friends?userId=${user.id}`); // ← Changed to user.id
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      console.error('Fetch friends error:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/friends/requests?userId=${user.id}`); // ← Changed to user.id
      const data = await res.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Fetch pending requests error:', error);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await fetch(`${API_BASE}/friends/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendCode }) // ← Changed to user.id
      });
      const data = await res.json();
      setMessage(data.msg);
      setFriendCode('');
      fetchPendingRequests();
    } catch (error) {
      console.error('Send friend request error:', error);
      setMessage('حدث خطأ في إرسال الطلب');
    }
  };

  const respondToRequest = async (friendshipId, action) => {
    try {
      const res = await fetch(`${API_BASE}/friends/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendshipId, action }) // ← Changed to user.id
      });
      const data = await res.json();
      setMessage(data.msg);
      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
      console.error('Respond to request error:', error);
      setMessage('حدث خطأ في الرد على الطلب');
    }
  };

  // ← ADD THIS: Show loading spinner while user loads
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 pb-24 font-sans transition-colors duration-300" dir="rtl">
      
      {/* HEADER - Same as Dashboard */}
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">الأصدقاء 👥</h1>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2 bg-teal-800 dark:bg-teal-950 px-3 py-1 rounded-full text-sm shadow-inner">
          <span className="font-bold">{friends.length}</span>
          <span>صديق</span>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6 max-w-md animate-in fade-in duration-500">
        
        {/* Your Friend Code - Updated Design */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-900 rounded-2xl p-6 text-white text-center shadow-lg">
          <h2 className="text-sm opacity-80 mb-2">رمز الصداقة الخاص بك</h2>
          <div className="text-3xl font-bold font-mono bg-white/20 inline-block px-6 py-2 rounded-lg backdrop-blur-sm mb-2">
           {user?.friendCode || 'جاري التحميل...'} 
          </div>
          <p className="text-xs opacity-75">شارك هذا الرمز مع الأصدقاء ليتمكنوا من إضافتك</p>
        </div>

        {/* Add Friend Section - Redesigned */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>➕</span>
            <span>إضافة صديق جديد</span>
          </h3>
          <input
            type="text"
            placeholder="أدخل رمز الصديق (مثال: PLAYER123)"
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg mb-3 focus:border-teal-500 focus:outline-none transition-colors"
          />
          <button 
            onClick={sendFriendRequest}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            إرسال طلب صداقة
          </button>
          {message && (
            <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/30 border-r-4 border-teal-500 rounded text-sm text-teal-800 dark:text-teal-200">
              {message}
            </div>
          )}
        </div>

        {/* INCOMING REQUESTS */}
        {pendingRequests.incoming.length > 0 && (
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 dark:from-pink-700 dark:to-rose-700 rounded-xl p-4 shadow-lg">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span>📬</span>
              <span>طلبات الصداقة الواردة</span>
            </h3>
            <div className="space-y-2">
              {pendingRequests.incoming.map(req => (
                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <strong className="text-gray-800 dark:text-gray-200 block">{req.from.name}</strong>
                    <small className="text-gray-500 dark:text-gray-400">{req.from.code}</small>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondToRequest(req.id, 'accept')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                    >
                      ✓ قبول
                    </button>
                    <button 
                      onClick={() => respondToRequest(req.id, 'reject')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                    >
                      ✕ رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OUTGOING REQUESTS */}
        {pendingRequests.outgoing.length > 0 && (
          <div className="bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-xl p-4 shadow-lg">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span>⏳</span>
              <span>طلبات مرسلة</span>
            </h3>
            <div className="space-y-2">
              {pendingRequests.outgoing.map(req => (
                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <strong className="text-gray-800 dark:text-gray-200 block">{req.to.name}</strong>
                  <small className="text-gray-500 dark:text-gray-400">في انتظار الرد...</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List - Redesigned */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>✅</span>
              <span>أصدقاؤك ({friends.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {friends.length === 0 ? (
              <p className="p-6 text-center text-gray-500 dark:text-gray-400">
                لا يوجد أصدقاء بعد. أضف شخصًا باستخدام رمزه!
              </p>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">{friend.name}</span>
                    <small className="text-gray-500 dark:text-gray-400">{friend.code}</small>
                  </div>
                  <span className="text-2xl">👤</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <BottomTabs />
    </div>
  );
}

export default Social;
