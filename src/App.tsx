import { useState, useEffect } from 'react';
import { CitySearch } from './components/CitySearch';
import { CityDisplay } from './components/CityDisplay';
import { ShabbatTimes } from './components/ShabbatTimes';
import { ThemeToggle } from './components/ThemeToggle';
import { ReminderPreferences } from './components/ReminderPreferences';
import { EmailSubscription } from './components/EmailSubscription';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { getUserId } from './utils/userId';
import { City } from './utils/cities';

function App() {
  const [savedCity, setSavedCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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
      <>
        <ThemeToggle />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Shabbat Times Finder</h1>
            <p className="text-gray-600 dark:text-gray-400">Search for a city to see Shabbat candle lighting times</p>
          </div>

          <div className="flex justify-center">
            <CitySearch onSelectCity={handleSelectCity} />
          </div>

          {savedCity && (
            <div className="flex justify-center gap-6 flex-wrap">
              <CityDisplay
                cityName={savedCity.name}
                country={savedCity.country}
                latitude={savedCity.latitude}
                longitude={savedCity.longitude}
              />
              <ShabbatTimes
                latitude={savedCity.latitude}
                longitude={savedCity.longitude}
                cityName={savedCity.name}
              />
            </div>
          )}

          {!savedCity && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>No city selected yet. Search and select a city above!</p>
            </div>
          )}

          {savedCity && (
            <div className="flex justify-center gap-6 flex-wrap">
              <ReminderPreferences />
              <EmailSubscription />
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="mx-auto block px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
            >
              {showSettings ? 'Hide' : 'Show'} Admin Panel
            </button>
            {showSettings && (
              <div className="flex justify-center mt-6">
                <AdminPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
