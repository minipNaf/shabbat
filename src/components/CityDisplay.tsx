import { MapPin, Globe } from 'lucide-react';

interface CityDisplayProps {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
}

export function CityDisplay({ cityName, country, latitude, longitude }: CityDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
          <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cityName}</h2>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <p className="text-sm">{country}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Coordinates
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {latitude.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {longitude.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
