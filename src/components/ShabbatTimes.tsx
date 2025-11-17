import { useState, useEffect } from 'react';
import { Flame, Calendar, Clock } from 'lucide-react';
import { getShabbatTimes, formatTime, formatDate, ShabbatTimes as ShabbatTimesType } from '../utils/shabbatTimes';

interface ShabbatTimesProps {
  latitude: number;
  longitude: number;
  cityName: string;
}

export function ShabbatTimes({ latitude, longitude, cityName }: ShabbatTimesProps) {
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatTimesType | null>(null);

  useEffect(() => {
    const fetchTimes = async () => {
      const times = await getShabbatTimes(latitude, longitude);
      setShabbatTimes(times);
    };
    
    fetchTimes();
  }, [latitude, longitude]);

  if (!shabbatTimes) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
          <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shabbat Times</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{cityName}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
              Next Shabbat
            </h3>
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(shabbatTimes.date)}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              Candle Lighting
            </h3>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatTime(shabbatTimes.candleLighting)}
          </span>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300 uppercase tracking-wide">
              Havdalah
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(shabbatTimes.sunset)}</p>
        </div>
      </div>
    </div>
  );
}
