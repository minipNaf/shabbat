import { useState, useEffect } from 'react';
import { CitySearch } from './components/CitySearch';
import { CityDisplay } from './components/CityDisplay';
import { supabase } from './lib/supabase';
import { getUserId } from './utils/userId';
import { City } from './utils/cities';

function App() {
  const [savedCity, setSavedCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedCity();
  }, []);

  async function loadSavedCity() {
    try {
      const userId = getUserId();
      const { data, error } = await supabase
        .from('saved_cities')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSavedCity({
          name: data.city_name,
          country: data.country,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      }
    } catch (error) {
      console.error('Error loading saved city:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectCity(city: City) {
    try {
      const userId = getUserId();

      const { error } = await supabase
        .from('saved_cities')
        .upsert(
          {
            user_id: userId,
            city_name: city.name,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setSavedCity(city);
    } catch (error) {
      console.error('Error saving city:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">City Finder</h1>
          <p className="text-gray-600">Search and save your favorite city</p>
        </div>

        <div className="flex justify-center">
          <CitySearch onSelectCity={handleSelectCity} />
        </div>

        {savedCity && (
          <div className="flex justify-center">
            <CityDisplay
              cityName={savedCity.name}
              country={savedCity.country}
              latitude={savedCity.latitude}
              longitude={savedCity.longitude}
            />
          </div>
        )}

        {!savedCity && (
          <div className="text-center text-gray-500">
            <p>No city selected yet. Search and select a city above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
