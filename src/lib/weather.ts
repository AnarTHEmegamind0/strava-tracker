import { WeatherData, WeatherRecommendation, WeatherWithRecommendation } from '@/types';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather description translations
const weatherTranslations: Record<string, string> = {
  'clear sky': 'Цэлмэг тэнгэр',
  'few clouds': 'Бага зэрэг үүлтэй',
  'scattered clouds': 'Үүл тараантай',
  'broken clouds': 'Ихэвчлэн үүлтэй',
  'overcast clouds': 'Бүрхэг',
  'shower rain': 'Хур бороо',
  'rain': 'Бороо',
  'light rain': 'Хөнгөн бороо',
  'moderate rain': 'Дунд зэргийн бороо',
  'heavy rain': 'Их бороо',
  'thunderstorm': 'Аадар бороо',
  'snow': 'Цас',
  'light snow': 'Хөнгөн цас',
  'mist': 'Манан',
  'fog': 'Манан',
  'haze': 'Уусмал',
};

// Mock weather data for when API key is not available
function getMockWeatherData(): WeatherData {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11
  const isDay = hour >= 8 && hour < 18;
  
  // Realistic Mongolian seasonal temperatures
  // Winter (Nov-Feb): -25 to -10, Spring (Mar-May): -5 to 15, 
  // Summer (Jun-Aug): 15 to 30, Fall (Sep-Oct): 0 to 15
  let baseTemp: number;
  let variation: number;
  
  if (month >= 10 || month <= 1) {
    // Winter: November - February
    baseTemp = -20;
    variation = 10; // -20 to -10
  } else if (month >= 2 && month <= 4) {
    // Spring: March - May
    baseTemp = 0;
    variation = 15;
  } else if (month >= 5 && month <= 7) {
    // Summer: June - August
    baseTemp = 18;
    variation = 12;
  } else {
    // Fall: September - October
    baseTemp = 5;
    variation = 10;
  }
  
  const temp = Math.round(baseTemp + Math.random() * variation);
  const windSpeed = 3 + Math.round(Math.random() * 10);
  const windChill = temp < 10 ? Math.round(temp - (windSpeed * 0.5)) : temp;
  
  // Winter descriptions
  const winterConditions = [
    { desc: 'clear sky', desc_mn: 'Цэлмэг тэнгэр', icon: 'd', main: 'Clear' },
    { desc: 'few clouds', desc_mn: 'Бага зэрэг үүлтэй', icon: '02d', main: 'Clouds' },
    { desc: 'overcast clouds', desc_mn: 'Бүрхэг', icon: '04d', main: 'Clouds' },
  ];
  
  const condition = winterConditions[Math.floor(Math.random() * winterConditions.length)];
  
  return {
    temp,
    feels_like: windChill,
    temp_min: temp - 3,
    temp_max: temp + 5,
    humidity: 50 + Math.round(Math.random() * 20),
    pressure: 1020 + Math.round(Math.random() * 15),
    wind_speed: windSpeed,
    wind_deg: Math.round(Math.random() * 360),
    clouds: Math.round(Math.random() * 40),
    visibility: 10000,
    description: condition.desc,
    description_mn: condition.desc_mn,
    icon: isDay ? condition.icon.replace('d', 'd') : condition.icon.replace('d', 'n'),
    main: condition.main,
    sunrise: Math.floor(Date.now() / 1000) - 3600 * (hour - 8),
    sunset: Math.floor(Date.now() / 1000) + 3600 * (18 - hour),
  };
}

export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (!OPENWEATHERMAP_API_KEY) {
    console.warn('OpenWeatherMap API key not configured, using mock data');
    return getMockWeatherData();
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    const description = data.weather[0]?.description || '';
    const descriptionMn = weatherTranslations[description.toLowerCase()] || description;
    
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      wind_deg: data.wind.deg,
      clouds: data.clouds.all,
      visibility: data.visibility,
      description,
      description_mn: descriptionMn,
      icon: data.weather[0]?.icon || '01d',
      main: data.weather[0]?.main || 'Clear',
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

export function getWeatherRecommendation(weather: WeatherData): WeatherRecommendation {
  const warnings: string[] = [];
  const clothing: string[] = [];
  let canWorkoutOutdoor = true;
  let recommendation = '';
  let bestTimeToWorkout: string | undefined;
  
  // Temperature-based recommendations
  if (weather.temp < -20) {
    canWorkoutOutdoor = false;
    warnings.push('Маш хүйтэн байна, гадаа дасгал хийхэд аюултай');
    recommendation = 'Дотор дасгал хийхийг зөвлөж байна';
  } else if (weather.temp < -10) {
    warnings.push('Хүйтэн байна, богино хугацааны дасгал хий');
    clothing.push('Давхар хувцас', 'Бээлий', 'Малгай', 'Хүзүүвч');
    recommendation = 'Богино хугацааны гүйлт тохиромжтой (20-30 мин)';
  } else if (weather.temp < 0) {
    clothing.push('Давхар хувцас', 'Бээлий', 'Малгай');
    recommendation = 'Хөнгөн гүйлт, дулаан хувцасласан тохиолдолд тохиромжтой';
  } else if (weather.temp < 10) {
    clothing.push('Урт ханцуйтай', 'Хөнгөн куртка');
    recommendation = 'Гүйлтэнд тохиромжтой температур';
  } else if (weather.temp < 20) {
    clothing.push('Хөнгөн хувцас');
    recommendation = 'Гүйлтэнд хамгийн тохиромжтой цаг агаар!';
  } else if (weather.temp < 30) {
    warnings.push('Халуун байна, их ус уу');
    clothing.push('Нимгэн хувцас', 'Малгай');
    recommendation = 'Өглөө эрт эсвэл орой гүйхийг зөвлөж байна';
    bestTimeToWorkout = 'Өглөө 6-9 цаг эсвэл орой 19-21 цаг';
  } else {
    canWorkoutOutdoor = false;
    warnings.push('Маш халуун, гадаа дасгал хийхэд аюултай');
    recommendation = 'Дотор дасгал эсвэл усан сан зөвлөж байна';
  }
  
  // Weather condition-based recommendations
  const mainCondition = weather.main.toLowerCase();
  
  if (mainCondition === 'rain' || mainCondition === 'drizzle') {
    warnings.push('Бороотой, гулгамтгай байж болно');
    clothing.push('Ус нэвтрүүлдэггүй куртка');
    if (weather.temp < 10) {
      recommendation = 'Бороонд норох нь хүйтэн үед аюултай, дотор дасгал хийхийг зөвлөж байна';
    }
  }
  
  if (mainCondition === 'thunderstorm') {
    canWorkoutOutdoor = false;
    warnings.push('Аадар бороо, аянга!');
    recommendation = 'Гадаа дасгал хийхгүй байхыг зөвлөж байна';
  }
  
  if (mainCondition === 'snow') {
    warnings.push('Цастай, гулгамтгай');
    clothing.push('Ус нэвтрүүлдэггүй гутал', 'Давхар хувцас');
    recommendation = 'Trail гүйлт эсвэл цаны дасгал тохиромжтой';
  }
  
  // Wind-based recommendations
  if (weather.wind_speed > 40) {
    canWorkoutOutdoor = false;
    warnings.push('Маш их салхитай');
    recommendation = 'Гадаа дасгал хийхэд аюултай';
  } else if (weather.wind_speed > 25) {
    warnings.push('Салхитай, салхины эсрэг гүйхэд хэцүү');
  }
  
  // Humidity-based recommendations
  if (weather.humidity > 80 && weather.temp > 20) {
    warnings.push('Чийгшил өндөр, илүү их хөлрөх болно');
    recommendation += ' Ус ихээр уухаа мартуузай.';
  }
  
  // Visibility-based recommendations
  if (weather.visibility < 1000) {
    warnings.push('Харагдах орчин муу');
    clothing.push('Тод өнгийн хувцас', 'Рефлектор');
  }
  
  // Default recommendation if none set
  if (!recommendation) {
    recommendation = 'Цаг агаар дасгал хийхэд тохиромжтой байна!';
  }
  
  return {
    canWorkoutOutdoor,
    recommendation,
    clothing,
    warnings,
    bestTimeToWorkout,
  };
}

export async function getWeatherWithRecommendation(
  lat: number, 
  lng: number,
  locationName?: string
): Promise<WeatherWithRecommendation | null> {
  const weather = await getCurrentWeather(lat, lng);
  
  if (!weather) return null;
  
  const recommendation = getWeatherRecommendation(weather);
  
  return {
    ...weather,
    recommendation,
    location: locationName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
  };
}

// Get weather icon URL
export function getWeatherIconUrl(iconCode: string, size: '1x' | '2x' | '4x' = '2x'): string {
  const sizeMap = { '1x': '', '2x': '@2x', '4x': '@4x' };
  return `https://openweathermap.org/img/wn/${iconCode}${sizeMap[size]}.png`;
}

// Default locations (Mongolia)
export const DEFAULT_LOCATIONS = [
  { name: 'Улаанбаатар', lat: 47.9184, lng: 106.9177 },
  { name: 'Дархан', lat: 49.4683, lng: 105.9746 },
  { name: 'Эрдэнэт', lat: 49.0278, lng: 104.0444 },
];
