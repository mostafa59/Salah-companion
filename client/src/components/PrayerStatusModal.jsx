import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrayerStatusModal = ({ isOpen, onClose, onConfirm, prayerName }) => {
  const [step, setStep] = useState(1); // Step 1: Honest Check, Step 2: Sadaqah
  const [sadaqahAmount, setSadaqahAmount] = useState('');

  if (!isOpen) return null;

  // Reset state when closing
  const handleClose = () => {
    setStep(1);
    setSadaqahAmount('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-center">
            <h3 className="text-white text-xl font-bold">
              {step === 1 ? 'تقبل الله منك! 🤲' : 'جبر الخواطر (كفارة) 💎'}
            </h3>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 ? (
              // STEP 1: HONEST CHECK
              <div className="text-center space-y-6">
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  هل صليت <span className="font-bold text-emerald-600">{prayerName}</span> في وقتها؟
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => onConfirm({ onTime: true })}
                    className="w-full py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    ✅ نعم، صليتها في وقتها
                    <span className="text-xs font-normal opacity-75">(أو كنت معذوراً)</span>
                  </button>
                  
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-bold transition-colors"
                  >
                    ⏰ لا، تأخرت فيها
                  </button>
                </div>
              </div>
            ) : (
              // STEP 2: SADAQAH PLEDGE
              <div className="text-center space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    قال تعالى: ﴿إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ﴾
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                    هل تود التصدق بمبلغ بسيط ككفارة عن التأخير؟
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">قيمة الصدقة (اختياري)</label>
                  <input
                    type="number"
                    value={sadaqahAmount}
                    onChange={(e) => setSadaqahAmount(e.target.value)}
                    placeholder="مثلاً: 5 أو 10"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-center text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => onConfirm({ onTime: false, kaffarah: sadaqahAmount || 0 })}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                  >
                    {sadaqahAmount ? `تعهد بـ ${sadaqahAmount}` : 'تأكيد بدون صدقة'}
                  </button>
                  
                  <button
                    onClick={() => onConfirm({ onTime: false, kaffarah: 0 })}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
                  >
                    تخطي
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 text-center">
            <button 
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              إلغاء الأمر
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrayerStatusModal;
