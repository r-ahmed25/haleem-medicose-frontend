import { useState, useEffect } from "react";
import { MapPin, Thermometer, Cloud, Loader } from "lucide-react";

const SalesInfo = () => {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      setLoadingWeather(true);
      setError(null);

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000,
          });
        });

        if (cancelled) return;

        const { latitude, longitude } = position.coords;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();
        if (cancelled) return;

        const cw = data.current_weather;
        setWeather({
          temp: Math.round(cw.temperature),
          code: cw.weathercode,
          wind: Math.round(cw.windspeed),
        });
      } catch (err) {
        if (!cancelled) {
          console.warn("Weather unavailable:", err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    };

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date) => {
    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getWeatherLabel = (code) => {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 99) return "Rain Showers";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  };

  return (
    <div className="sales-info">
      <div className="sales-time">
        <span className="sales-date">{formatDate(now)}</span>
        <span className="sales-clock">{formatTime(now)}</span>
      </div>
      <div className="sales-weather">
        {loadingWeather ? (
          <span className="sales-weather-loading">
            <Loader className="h-3.5 w-3.5 animate-spin inline mr-1" />
            Loading weather...
          </span>
        ) : error || !weather ? (
          <span className="sales-weather-loading">
            <MapPin className="h-3.5 w-3.5 inline mr-1" />
            Weather unavailable
          </span>
        ) : (
          <>
            <span className="sales-weather-temp">
              <Thermometer className="h-3.5 w-3.5 inline mr-1" />
              {weather.temp}°C
            </span>
            <span className="sales-weather-condition">
              <Cloud className="h-3.5 w-3.5 inline mr-1" />
              {getWeatherLabel(weather.code)}
            </span>
          </>
        )}
      </div>

      <style>{`
        .sales-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: var(--secondary);
          font-size: 0.8rem;
          line-height: 1.3;
          min-width: 0;
          max-width: 100%;
        }
        .sales-time {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sales-date {
          font-weight: 600;
          opacity: 0.9;
        }
        .sales-clock {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          opacity: 0.85;
        }
        .sales-weather {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sales-weather-temp {
          font-weight: 600;
          opacity: 0.9;
        }
        .sales-weather-condition {
          opacity: 0.8;
        }
        .sales-weather-loading {
          opacity: 0.7;
          font-style: italic;
        }
        @media (max-width: 520px) {
          .sales-info {
            font-size: 0.72rem;
          }
          .sales-time,
          .sales-weather {
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesInfo;
