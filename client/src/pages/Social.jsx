import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BottomTabs from '../components/BottomTabs';

const Social = () => {
  const { user } = useContext(AuthContext);
  const [friendCode, setFriendCode] = useState('');
  
  // Mock Data for now (Later we fetch from API)
  const [friends, setFriends] = useState([
    { id: 1, name: 'Ahmed', status: 'sleeping', lastSeen: '5 hours ago' },
    { id: 2, name: 'Sara', status: 'awake', lastSeen: 'Just now' },
    { id: 3, name: 'Omar', status: 'prayed', lastSeen: '10 mins ago' },
  ]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    alert(`Searching for friend: ${friendCode}`);
    setFriendCode('');
  };

  const sendNudge = (name) => {
    alert(`🔔 Nudge sent to ${name}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="bg-indigo-600 dark:bg-indigo-900 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold mb-1">نادي الفجر 🛡️</h1>
        <p className="opacity-80 text-sm">شجع أصدقاءك على الطاعة</p>
        
        {/* My Code Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 flex justify-between items-center">
            <div>
                <p className="text-xs opacity-70">كود الإضافة الخاص بك</p>
                <p className="font-mono font-bold text-xl tracking-widest">{user?.name?.toUpperCase() || 'USER'}-99</p>
            </div>
            <button className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">نسخ</button>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-md space-y-6">
        
        {/* Add Friend Input */}
        <form onSubmit={handleAddFriend} className="flex gap-2">
            <input 
                type="text" 
                placeholder="أدخل كود الصديق..." 
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition">
                + إضافة
            </button>
        </form>

        {/* Friends List */}
        <div className="space-y-3">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">أصدقائي ({friends.length})</h3>
            
            {friends.map(friend => (
                <div key={friend.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar with Status Ring */}
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700 border-2 ${
                            friend.status === 'prayed' ? 'border-green-500' : 
                            friend.status === 'awake' ? 'border-yellow-400' : 'border-gray-300'
                        }`}>
                            {friend.status === 'prayed' ? '🤲' : '😴'}
                            
                            {/* Online Dot */}
                            {friend.status !== 'sleeping' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            )}
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-100">{friend.name}</h4>
                            <p className="text-xs text-gray-400">{friend.status === 'prayed' ? 'صلى الفجر ✅' : 'لم يصلِ بعد'}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {friend.status !== 'prayed' && (
                        <button 
                            onClick={() => sendNudge(friend.name)}
                            className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition animate-pulse"
                        >
                            🔔 أيقظه
                        </button>
                    )}
                </div>
            ))}
        </div>

      </div>

      <BottomTabs />
    </div>
  );
};

export default Social;
