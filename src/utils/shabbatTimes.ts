import SunCalc from 'suncalc';

export interface ShabbatTimes {
  date: Date;
  sunset: Date;
  candleLighting: Date;
  offsetMinutes: number;
}

export function calculateSunset(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Date {
  const times = SunCalc.getTimes(date, latitude, longitude);
  return times.sunset;
}

export function calculateCandleLightingTime(
  sunsetTime: Date,
  offsetMinutes: number = 18
): Date {
  return new Date(sunsetTime.getTime() - offsetMinutes * 60 * 1000);
}

export function getNextFriday(referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  date.setHours(0, 0, 0, 0);

  const dayOfWeek = date.getDay();
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;

  if (daysUntilFriday === 0 && referenceDate.getHours() >= 18) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() + daysUntilFriday);
  }

  return date;
}

export function getShabbatTimes(
  latitude: number,
  longitude: number,
  offsetMinutes: number = 18
): ShabbatTimes {
  const nextFriday = getNextFriday();

  const sunset = calculateSunset(latitude, longitude, nextFriday);
  const candleLighting = calculateCandleLightingTime(sunset, offsetMinutes);

  return {
    date: nextFriday,
    sunset,
    candleLighting,
    offsetMinutes,
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
