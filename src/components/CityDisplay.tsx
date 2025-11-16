import { MapPin, Globe } from 'lucide-react';

interface CityDisplayProps {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
}

export function CityDisplay({ cityName, country }: CityDisplayProps) {
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
    </div>
  );
}
