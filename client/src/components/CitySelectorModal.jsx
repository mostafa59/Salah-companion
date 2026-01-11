import { useState, useMemo } from 'react';

const COUNTRIES = [
  { code: 'EG', name: 'مصر', cities: [
    { city: 'Cairo', label: 'القاهرة' }, { city: 'Giza', label: 'الجيزة' }, 
    { city: 'Alexandria', label: 'الإسكندرية' }, { city: 'Luxor', label: 'الأقصر' },
    { city: 'Aswan', label: 'أسوان' }, { city: 'Port Said', label: 'بورسعيد' },
    { city: 'Suez', label: 'السويس' }
  ]},
  { code: 'SA', name: 'السعودية', cities: [
    { city: 'Riyadh', label: 'الرياض' }, { city: 'Makkah', label: 'مكة المكرمة' },
    { city: 'Madinah', label: 'المدينة المنورة' }, { city: 'Jeddah', label: 'جدة' },
    { city: 'Dammam', label: 'الدمام' }, { city: 'Taif', label: 'الطائف' }
  ]},
  { code: 'AE', name: 'الإمارات', cities: [
    { city: 'Dubai', label: 'دبي' }, { city: 'Abu Dhabi', label: 'أبو ظبي' },
    { city: 'Sharjah', label: 'الشارقة' }, { city: 'Ajman', label: 'عجمان' },
    { city: 'Ras Al Khaimah', label: 'رأس الخيمة' }
  ]},
  { code: 'QA', name: 'قطر', cities: [
    { city: 'Doha', label: 'الدوحة' }
  ]},
  { code: 'KW', name: 'الكويت', cities: [
    { city: 'Kuwait City', label: 'مدينة الكويت' }
  ]},
  { code: 'TR', name: 'تركيا', cities: [
    { city: 'Istanbul', label: 'إسطنبول' }, { city: 'Ankara', label: 'أنقرة' },
    { city: 'Izmir', label: 'إزمير' }
  ]},
  { code: 'UK', name: 'بريطانيا', cities: [
    { city: 'London', label: 'لندن' }, { city: 'Birmingham', label: 'برمنغهام' },
    { city: 'Manchester', label: 'مانشستر' }
  ]},
  { code: 'US', name: 'أمريكا', cities: [
    { city: 'New York', label: 'نيويورك' }, { city: 'Chicago', label: 'شيكاغو' },
    { city: 'Los Angeles', label: 'لوس أنجلوس' }
  ]},
  { code: 'FR', name: 'فرنسا', cities: [
    { city: 'Paris', label: 'باريس' }
  ]},
  { code: 'DE', name: 'ألمانيا', cities: [
    { city: 'Berlin', label: 'برلين' }, { city: 'Munich', label: 'ميونخ' }
  ]},
  { code: 'JO', name: 'الأردن', cities: [
    { city: 'Amman', label: 'عمان' }
  ]},
  { code: 'LB', name: 'لبنان', cities: [
    { city: 'Beirut', label: 'بيروت' }
  ]},
  { code: 'SY', name: 'سوريا', cities: [
    { city: 'Damascus', label: 'دمشق' }
  ]},
  { code: 'IQ', name: 'العراق', cities: [
    { city: 'Baghdad', label: 'بغداد' }
  ]},
  { code: 'OM', name: 'عمان', cities: [
    { city: 'Muscat', label: 'مسقط' }
  ]},
  { code: 'BH', name: 'البحرين', cities: [
    { city: 'Manama', label: 'المنامة' }
  ]},
  { code: 'YE', name: 'اليمن', cities: [
    { city: 'Sanaa', label: 'صنعاء' }
  ]}
];

const CitySelectorModal = ({ isOpen, onClose, onSelect, currentLocation }) => {
  const [view, setView] = useState('countries');
  const [search, setSearch] = useState('');

  const countries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const s = search.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(s));
  }, [search]);

  const selectedCountryCities = useMemo(() => {
    const country = COUNTRIES.find(c => c.code === view);
    return country ? country.cities : [];
  }, [view]);

  const filteredCities = useMemo(() => {
    if (!search.trim()) return selectedCountryCities;
    const s = search.toLowerCase();
    return selectedCountryCities.filter(c =>
      c.city.toLowerCase().includes(s) || c.label.toLowerCase().includes(s)
    );
  }, [selectedCountryCities, search]);

  if (!isOpen) return null;

  const isCurrentLocation = (city, country) =>
    currentLocation &&
    currentLocation.city === city &&
    currentLocation.country === country;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {view === 'countries' ? 'اختر الدولة' : 'اختر المدينة'}
          </h3>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            إغلاق ✕
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={
            view === 'countries'
              ? 'ابحث عن الدولة...'
              : 'ابحث عن المدينة...'
          }
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setView('countries');
              setSearch('');
            }}
            className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium ${
              view === 'countries'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            الدول
          </button>
          <button
            onClick={() => {
              setView('cities');
              setSearch('');
            }}
            className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium ${
              view === 'cities'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            المدن
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1">
          {view === 'countries' ? (
            countries.map((country) => (
              <button
                key={country.code}
                onClick={() => setView(country.code)}
                className="w-full text-right text-sm px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {country.name}
              </button>
            ))
          ) : (
            filteredCities.map((city) => {
              const fullCity = {
                city: city.city,
                country: COUNTRIES.find(c => c.code === view)?.name || 'Unknown'
              };
              return (
                <button
                  key={city.city}
                  onClick={() => {
                    onSelect(fullCity);
                    onClose();
                  }}
                  className={`w-full text-right text-sm px-3 py-2 rounded-lg flex justify-between items-center ${
                    isCurrentLocation(city.city, fullCity.country)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{city.label}</span>
                  {isCurrentLocation(city.city, fullCity.country) && (
                    <span className="text-xs opacity-80">✔ الحالية</span>
                  )}
                </button>
              );
            })
          )}

          {view === 'cities' && filteredCities.length === 0 && (
            <div className="text-center text-xs text-gray-400 mt-4">
              ابحث باسم المدينة أو عُد إلى قائمة الدول.
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 mt-1">
          يمكنك إضافة المزيد من المدن في الكود لاحقاً.
        </p>
      </div>
    </div>
  );
};

export default CitySelectorModal;
