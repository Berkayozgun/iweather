"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/Image";
import stormday from "/src/app/images/Weather=StormMoment=Day.png";
import stormnight from "/src/app/images/Weather=StormMoment=Night.png";
import cloudyday from "/src/app/images/Weather=CloudyMoment=Day.png";
import cloudynight from "/src/app/images/Weather=CloudyMoment=Night.png";
import rainday from "/src/app/images/Weather=RainMoment=Day.png";
import rainnight from "/src/app/images/Weather=RainMoment=Night.png";
import clearday from "/src/app/images/Weather=ClearMoment=Day.png";
import clearnight from "/src/app/images/Weather=ClearMoment=Night.png";
import {
  clearDaySvg,
  clearNightSvg,
  cloudyDaySvg,
  cloudyNightSvg,
  fewCloudsDaySvg,
  fewCloudsNightSvg,
  rainDaySvg,
  rainNightSvg,
  stormDaySvg,
  stormNightSvg,
} from "/src/app/images/SvgRepository.js";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [uvIndex, setUvIndex] = useState(null);

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

  useEffect(() => {
    const fetchUVIndex = async () => {
      try {
        const myHeaders = new Headers();
        myHeaders.append("x-access-token", "openuv-3i96anyrlubcu1aj-io");
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };

        const response = await fetch(
          "https://api.openuv.io/api/v1/uv?lat=41.69&lng=26.59&alt=100&dt=",
          requestOptions
        );
        const result = await response.json();
        setUvIndex(result.result.uv);
      } catch (error) {
        console.error("Error fetching UV index:", error);
      }
    };

    fetchUVIndex();
  }, []);

  const fetchWeatherDetails = async (cityId) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=ddffe405f7a43c3e417f986dc0a3f731&units=metric`
      );
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

  // 5 günlük tahminleri clear, cloudy, rain, storm şeklinde göstermek için dataları gruplayalım

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
      }
    }
  };

  return (
    <div className='flex w-full  flex-row items-center justify-around min-h-screen gap-20'>
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
      <div className='flex flex-col items-center h-full justify-center gap-4 '>
        {weatherDetails && (
          <div className='flex flex-col justify-center items-center gap-2'>
            <div className='h-80 w-full bg-zinc-900 rounded-xl flex-col items-center justify-center flex'>
              <div className='w-full h-72 relative rounded-lg'>
                <div className='w-full h-72 left-0 top-0 absolute justify-center items-center inline-flex'>
                  <div className='w-full p-4 h-40 left-[20px] top-[144px] absolute  '>
                    {weatherDetails.weather[0].main}
                  </div>
                  <Image
                    // determine the weather image based on the weather condition
                    src={
                      weatherDetails.weather[0].main === "Clear" &&
                      new Date().getHours() >= 6 &&
                      new Date().getHours() < 18
                        ? clearday
                        : weatherDetails.weather[0].main === "Clear" &&
                          (new Date().getHours() < 6 ||
                            new Date().getHours() >= 18)
                        ? clearnight
                        : weatherDetails.weather[0].main === "Clouds" &&
                          new Date().getHours() >= 6 &&
                          new Date().getHours() < 18
                        ? cloudyday
                        : weatherDetails.weather[0].main === "Clouds" &&
                          (new Date().getHours() < 6 ||
                          new Date().getHours() >= 18
                            ? cloudynight
                            : weatherDetails.weather[0].main === "Rain" &&
                              new Date().getHours() >= 6 &&
                              new Date().getHours() < 18
                            ? rainday
                            : weatherDetails.weather[0].main === "Rain" &&
                              (new Date().getHours() < 6 ||
                                new Date().getHours() >= 18)
                            ? rainnight
                            : weatherDetails.weather[0].main === "Storm" &&
                              new Date().getHours() >= 6 &&
                              new Date().getHours() < 18
                            ? stormday
                            : stormnight)
                    }
                    alt='Current weather'
                    className='rounded-lg w-[350px] self-stretch h-72 '
                  />
                </div>
                <div className='p-4 left-[20px] top-[172px] absolute flex-col justify-center items-start gap-2 inline-flex'>
                  <div className='text-right text-white text-3xl font-extrabold  leading-10'>
                    {weatherDetails.main.temp.toFixed()}°C
                  </div>
                  <div className='flex-col justify-center items-start flex '>
                    <div className='text-center text-white text-base font-bold  leading-snug'>
                      {weatherDetails.main.temp_min} ºc /{" "}
                      {weatherDetails.main.temp_max}ºc
                    </div>
                    <div className=' text-white text-sm font-normal  leading-tight'>
                      {weatherDetails.weather[0].description}
                    </div>
                  </div>
                </div>
                <div className='w-40 h-40 left-[175px] top-[144px] absolute' />
                <div className='h-10 left-[20px] top-[20px] absolute flex-col justify-start items-start p-4 inline-flex'>
                  <div className='flex-col justify-start items-start gap-1 flex'>
                    <div className='text-center text-neutral-50 text-base font-bold  leading-snug'>
                      <p>{weatherDetails.name}</p>
                    </div>
                    <div className='text-center text-neutral-50 text-xs font-normal  leading-none'>
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
                    <div className='w-6 h-6 px-1.5 py-px justify-center items-center flex' />
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Thermal sensation
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {weatherDetails.main.feels_like.toFixed()}°C
                  </div>
                </div>
                <div className='self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='justify-start items-center gap-3 flex'>
                    <div className='w-6 h-6 px-0.5 pt-0.5 pb-px justify-center items-center flex' />
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Probability of rain
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {weatherDetails.clouds.all}%
                  </div>
                </div>
                <div className='self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='justify-start items-center gap-3 flex'>
                    <div className=' w-6 h-6 px-0.5 py-1 justify-center items-center flex' />
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
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
                <div className='self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='justify-start items-center gap-3 flex'>
                    <div className='w-6 h-6 px-1 pt-px pb-0.5 justify-center items-center flex' />
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Air humidity
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {weatherDetails.main.humidity}%
                  </div>
                </div>
                <div className='self-stretch py-4 justify-between items-center inline-flex'>
                  <div className='justify-start items-center gap-3 flex'>
                    <div className='w-6 h-6 p-0.5 justify-center items-center flex' />
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      <p>UV Değeri: </p>
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {uvIndex}
                  </div>
                </div>
              </div>
            </div>
            <div className='w-96 h-44 p-3 bg-zinc-900 rounded-xl justify-center items-center inline-flex'>
              <div className='grow shrink basis-0 self-stretch justify-start items-center inline-flex'>
                {forecastData.map((forecast, index) => (
                  <div
                    key={index}
                    className='grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'
                  >
                    <div className='text-center text-slate-300 text-sm font-bold leading-tight'>
                      {new Date(forecast.dt * 1000).toLocaleDateString(
                        "en-US",
                        { weekday: "short" }
                      )}
                    </div>
                    <div className='w-14 h-14 relative'>
                      <div className='w-20 h-20 flex '>
                        {forecast.weather[0].main === "Clear" && (
                          <Image
                            src={
                              new Date().getHours() >= 6 &&
                              new Date().getHours() < 18
                                ? clearDaySvg
                                : clearNightSvg
                            }
                            alt='Weather icon'
                            className='w-16 h-16'
                          />
                        )}
                        {forecast.weather[0].main === "Clouds" && (
                          <Image
                            src={
                              new Date().getHours() >= 6 &&
                              new Date().getHours() < 18
                                ? cloudyDaySvg
                                : cloudyNightSvg
                            }
                            alt='Weather icon'
                            className='w-16 h-16'
                          />
                        )}
                        {forecast.weather[0].main === "Rain" && (
                          <Image
                            src={
                              new Date().getHours() >= 6 &&
                              new Date().getHours() < 18
                                ? rainDaySvg
                                : rainNightSvg
                            }
                            alt='Weather icon'
                            className='w-16 h-16'
                          />
                        )}
                      </div>
                    </div>
                    <div className='flex-col justify-start items-center flex'>
                      <div className='text-center text-neutral-50 text-sm font-bold leading-tight'>
                        {forecast.main.temp_max.toFixed()}°C
                      </div>
                      <div className='text-center text-slate-500 text-sm font-bold leading-tight'>
                        {forecast.main.temp_min.toFixed()}°C
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
