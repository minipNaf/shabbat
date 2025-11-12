import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { City, searchCities } from '../utils/cities';

interface CitySearchProps {
  onSelectCity: (city: City) => void;
}

export function CitySearch({ onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchCities(query);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: City) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search for a city..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {results.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{city.name}</div>
              <div className="text-sm text-gray-500">{city.country}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
          <p className="text-gray-500 text-sm">No cities found</p>
        </div>
      )}
    </div>
  );
}
