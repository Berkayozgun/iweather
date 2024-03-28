"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/Image";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${searchText}&appid=ddffe405f7a43c3e417f986dc0a3f731&units=metric`
        );
        setSearchResults(response.data.list);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    if (searchText.length >= 3) {
      fetchCities();
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const fetchWeatherDetails = async (cityId) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=ddffe405f7a43c3e417f986dc0a3f731&units=metric`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching weather details:", error);
      return null;
    }
  };

  // Önce, her bir güne ait verileri gruplayacak bir fonksiyon tanımlayalım
  const groupForecastByDay = (forecastList) => {
    const dailyForecasts = {};
    forecastList.forEach((forecast) => {
      const date = forecast.dt_txt.split(" ")[0]; // Tarih bilgisini al
      if (!dailyForecasts[date]) {
        // Eğer bu tarih için henüz bir girdi yoksa, yeni bir girdi oluştur
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(forecast); // Tahmin verisini ilgili tarihe ekle
    });
    return dailyForecasts;
  };

  // Ardından, tahminleri günlük verilere gruplayıp sadece ilk tahmini alacağımız şekilde güncelleyelim
  const fetchForecastData = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=ddffe405f7a43c3e417f986dc0a3f731&units=metric`
      );
      const dailyForecasts = groupForecastByDay(response.data.list); // Tahminleri günlük olarak grupla
      const dailyForecastList = Object.values(dailyForecasts)
        .slice(1, 6)
        .map((forecasts) => forecasts[0]); // Bugünden sonraki 5 gün için sadece ilk tahmini al
      setForecastData(dailyForecastList); // Günlük tahmin verilerini ayarla
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  const handleCitySelect = async (cityId, lat, lon) => {
    const selectedCity = searchResults.find((city) => city.id === cityId);
    if (selectedCity) {
      const weatherDetails = await fetchWeatherDetails(cityId);
      if (weatherDetails) {
        setWeatherDetails(weatherDetails);
        fetchForecastData(selectedCity.name); // City adını kullanarak hava durumu tahminlerini al
      } else {
        console.log("Weather details not available for", selectedCity.name);
      }
    }
  };

  const calculateThermalSensation = function (temp, windSpeed) {
    return (
      13.12 +
      0.6215 * temp -
      11.37 * Math.pow(windSpeed, 0.16) +
      0.3965 * temp * Math.pow(windSpeed, 0.16)
    );
  };

  const calculateProbabilityOfRain = function (temp, humidity) {
    return 0.5 * (temp - 14) + 0.25 * (humidity - 70);
  };

  return (
    <div className='flex w-full  flex-row items-center justify-around gap-20'>
      <div className='flex flex-col items-center justify-center gap-4 h-full'>
        <div className='flex flex-row items-center mt-20 justify-center'>
          <div className='text-neutral-50 text-xl font-bold leading-7'>
            Welcome to
          </div>
          <div className='text-blue-300 text-xl font-bold leading-7'>
            &nbsp;TypeWeather
          </div>
        </div>
        <div className='w-80 text-center text-slate-300 text-sm font-normal leading-tight'>
          Choose a location to see the weather forecast
        </div>

        <input
          type='text'
          placeholder='Search location'
          className='w-80 h-14 px-5 bg-neutral-800 rounded-lg justify-center items-center inline-flex'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className='w-80 bg-neutral-800 rounded-lg shadow-lg'>
            {searchResults.map((city) => (
              <div
                key={city.id}
                className='cursor-pointer px-4 py-2 hover:bg-neutral-700'
                onClick={() =>
                  handleCitySelect(city.id, city.coord.lat, city.coord.lon)
                } // city'nin koordinatlarını al
              >
                {city.name}, {city.sys.country}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='flex flex-col items-center justify-center gap-4 '>
        {weatherDetails && (
          <div className='flex flex-col justify-center items-center gap-2'>
            <div className='h-60 p-3 bg-zinc-900 rounded-xl flex-col justify-center items-center gap-3 flex'>
              <div className='Today w-80 h-72 relative rounded-lg'>
                <div className='Background w-80 h-72 left-0 top-0 absolute justify-center items-center inline-flex'>
                  <Image
                    width={60}
                    height={42}
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Black_colour.jpg/1536px-Black_colour.jpg'
                    alt='Current weather'
                    className=' rounded-lg'
                  />
                </div>
                <div className='Weather p-1 left-[16px] top-[172px] absolute flex-col justify-center items-start gap-2 inline-flex'>
                  <div className='C text-right text-white text-5xl font-extrabold  leading-10'>
                    {weatherDetails.main.temp}°C
                  </div>
                  <div className='Details flex-col justify-center items-start flex'>
                    <div className='C32C text-center text-white text-base font-bold  leading-snug'>
                      26ºc / 32ºc
                    </div>
                    <div className='FewClouds text-white text-sm font-normal  leading-tight'>
                      Few clouds
                    </div>
                  </div>
                </div>
                <div className='Icons w-40 h-40 left-[175px] top-[144px] absolute' />
                <div className='Info h-10 left-[20px] top-[20px] absolute flex-col justify-start items-start inline-flex'>
                  <div className='Location flex-col justify-start items-start gap-0.5 flex'>
                    <div className='IstanbulTr text-center text-neutral-50 text-base font-bold  leading-snug'>
                      <p>{weatherDetails.name}</p>
                    </div>
                    <div className='MondayMay152023 text-center text-neutral-50 text-xs font-normal  leading-none'>
                      {new Date().toDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='w-full h-72 px-4 py-1 bg-zinc-900 rounded-xl flex-col justify-center items-center gap-2 flex'>
              <div className='w-full h-72 flex-col justify-start items-start flex'>
                <div className='w-full py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='w-full justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 px-1.5 py-px justify-center items-center flex' />
                    <div className='ThermalSensation text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Thermal sensation
                    </div>
                  </div>
                  <div className='C text-neutral-50 text-base font-bold  leading-snug'>
                    {weatherDetails.main.feels_like}°C
                  </div>
                </div>
                <div className='Item self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='Title justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 px-0.5 pt-0.5 pb-px justify-center items-center flex' />
                    <div className='ProbabilityOfRain text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Probability of rain
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    0%
                  </div>
                </div>
                <div className='Item self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='Title justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 px-0.5 py-1 justify-center items-center flex' />
                    <div className='WindSpeed text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Wind speed
                    </div>
                  </div>
                  <div className='KmH'>
                    <span className='text-neutral-50 text-base font-bold  leading-snug'>
                      {weatherDetails.wind.speed}
                    </span>
                    <span className='text-neutral-50 text-xl font-bold  leading-7'>
                      {" "}
                    </span>
                    <span className='text-neutral-50 text-base font-bold  leading-snug'>
                      km/h
                    </span>
                  </div>
                </div>
                <div className='Item self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='Title justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 px-1 pt-px pb-0.5 justify-center items-center flex' />
                    <div className='AirHumidity text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Air humidity
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {weatherDetails.main.humidity}%
                  </div>
                </div>
                <div className='Item self-stretch py-4 justify-between items-center inline-flex'>
                  <div className='Title justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 p-0.5 justify-center items-center flex' />
                    <div className='UvIndex text-center text-slate-300 text-sm font-bold  leading-tight'>
                      UV Index
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    5
                  </div>
                </div>
              </div>
            </div>
            <div className='NextDays w-96 h-44 p-3 bg-zinc-900 rounded-xl justify-center items-center inline-flex'>
              <div className='List grow shrink basis-0 self-stretch justify-start items-center inline-flex'>
                {forecastData.map((forecast, index) => (
                  <div
                    key={index}
                    className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'
                  >
                    <div className='DayText text-center text-slate-300 text-sm font-bold leading-tight'>
                      {new Date(forecast.dt * 1000).toLocaleDateString(
                        "en-US",
                        { weekday: "short" }
                      )}
                    </div>
                    <div className='Icons w-14 h-14 relative'>
                      <div className='Light w-6 h-1 left-[14.62px] top-[38.24px] absolute bg-yellow-200 rounded-3xl blur-3xl' />
                    </div>
                    <div className='Details flex-col justify-start items-center flex'>
                      <div className='C text-center text-neutral-50 text-sm font-bold leading-tight'>
                        {forecast.main.temp_max}°C
                      </div>
                      <div className='C text-center text-slate-500 text-sm font-bold leading-tight'>
                        {forecast.main.temp_min}°C
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
