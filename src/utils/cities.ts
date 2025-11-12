export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const cities: City[] = [
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738 },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686 },
];

export function searchCities(query: string): City[] {
  if (!query.trim()) return [];

  const lowercaseQuery = query.toLowerCase();
  return cities.filter(
    city =>
      city.name.toLowerCase().includes(lowercaseQuery) ||
      city.country.toLowerCase().includes(lowercaseQuery)
  ).slice(0, 5);
}
