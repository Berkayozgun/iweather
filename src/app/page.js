"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [weatherDetails, setWeatherDetails] = useState(null);

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
      return response.data;
    } catch (error) {
      console.error("Error fetching weather details:", error);
      return null;
    }
  };

  const handleCitySelect = async (cityId) => {
    const selectedCity = searchResults.find((city) => city.id === cityId);
    if (selectedCity) {
      const weatherDetails = await fetchWeatherDetails(cityId);
      if (weatherDetails) {
        setWeatherDetails(weatherDetails);
      } else {
        console.log("Weather details not available for", selectedCity.name);
      }
    }
  };

  return (
    <div className='flex w-full h-full flex-col items-center justify-center gap-20'>
      <div className='flex flex-col items-center justify-center w-full h-full gap-4'>
        <div className='flex flex-row items-center justify-center'>
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
                onClick={() => handleCitySelect(city.id)}
              >
                {city.name}, {city.sys.country}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='flex flex-col items-center justify-center gap-4'>
        {weatherDetails && (
          <div>
            <p>Weather details for {searchText}:</p>
            <p>Temperature: {weatherDetails.main.temp}°C</p>
            <p>Humidity: {weatherDetails.main.humidity}%</p>
            {/* Diğer hava durumu bilgilerini burada gösterebilirsiniz */}
          </div>
        )}
      </div>
    </div>
  );
}
