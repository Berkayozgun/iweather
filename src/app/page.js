"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import stormday from "/src/app/images/Weather=StormMoment=Day.png";
import stormnight from "/src/app/images/Weather=StormMoment=Night.png";
import cloudyday from "/src/app/images/Weather=CloudyMoment=Day.png";
import cloudynight from "/src/app/images/Weather=CloudyMoment=Night.png";
import rainday from "/src/app/images/Weather=RainMoment=Day.png";
import rainnight from "/src/app/images/Weather=RainMoment=Night.png";
import clearday from "/src/app/images/Weather=ClearMoment=Day.png";
import clearnight from "/src/app/images/Weather=ClearMoment=Night.png";
import mistpng from "/src/app/images/foggy.png";

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
      // Fetch cities from the OpenWeatherMap API
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
      // If the search text is at least 3 characters long, fetch cities
      fetchCities();
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  useEffect(() => {
    const fetchUVIndex = async () => {
      // Fetch the UV index from the OpenUV API
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
    // Fetch the weather details from the OpenWeatherMap API
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

  const groupForecastByDay = (forecastList) => {
    // Group the forecast data by day
    const dailyForecasts = {};
    forecastList.forEach((forecast) => {
      const date = forecast.dt_txt.split(" ")[0]; // Get the date part of the forecast date
      if (!dailyForecasts[date]) {
        // If there is no forecast data for the date, create an empty array
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(forecast); // Add the forecast data to the array
    });
    return dailyForecasts;
  };

  // Fetch the forecast data from the OpenWeatherMap API
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
    // Handle the selection of a city
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
                className='cursor-pointer px-4 py-2 hover:bg-gray-600 rounded-xl'
                onClick={() =>
                  handleCitySelect(city.id, city.coord.lat, city.coord.lon)
                } // Handle the selection of a city
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
                  <div className='w-full p-4 h-40 left-[20px] top-[144px] absolute'></div>
                  <Image
                    // determine the weather image based on the weather condition
                    src={
                      weatherDetails.weather[0].main === "Mist"
                        ? mistpng
                        : weatherDetails.weather[0].main === "Clear" &&
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
                    <div className='w-6 h-6 px-1.5 py-px justify-center items-center flex'>
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M16.75 19.325V11C16.75 10.8011 16.671 10.6103 16.5303 10.4697C16.3897 10.329 16.1989 10.25 16 10.25C15.8011 10.25 15.6103 10.329 15.4697 10.4697C15.329 10.6103 15.25 10.8011 15.25 11V19.325C14.3395 19.5109 13.5304 20.0282 12.9796 20.7767C12.4288 21.5252 12.1756 22.4515 12.269 23.3761C12.3624 24.3007 12.7958 25.1577 13.4851 25.781C14.1745 26.4042 15.0707 26.7492 16 26.7492C16.9293 26.7492 17.8255 26.4042 18.5149 25.781C19.2042 25.1577 19.6376 24.3007 19.731 23.3761C19.8244 22.4515 19.5712 21.5252 19.0204 20.7767C18.4696 20.0282 17.6605 19.5109 16.75 19.325ZM16 25.25C15.555 25.25 15.12 25.118 14.75 24.8708C14.38 24.6236 14.0916 24.2722 13.9213 23.861C13.751 23.4499 13.7064 22.9975 13.7932 22.561C13.88 22.1246 14.0943 21.7237 14.409 21.409C14.7237 21.0943 15.1246 20.8801 15.561 20.7932C15.9975 20.7064 16.4499 20.751 16.861 20.9213C17.2722 21.0916 17.6236 21.38 17.8708 21.75C18.118 22.12 18.25 22.555 18.25 23C18.25 23.5967 18.0129 24.169 17.591 24.591C17.169 25.0129 16.5967 25.25 16 25.25ZM20.75 16.875V6C20.75 4.74022 20.2496 3.53204 19.3588 2.64124C18.468 1.75044 17.2598 1.25 16 1.25C14.7402 1.25 13.532 1.75044 12.6412 2.64124C11.7504 3.53204 11.25 4.74022 11.25 6V16.875C9.97322 17.8654 9.03793 19.23 8.57494 20.7781C8.11196 22.3262 8.14443 23.9803 8.66783 25.5091C9.19123 27.0378 10.1794 28.3647 11.494 29.3042C12.8087 30.2437 14.3841 30.7487 16 30.7487C17.6159 30.7487 19.1913 30.2437 20.506 29.3042C21.8206 28.3647 22.8088 27.0378 23.3322 25.5091C23.8556 23.9803 23.888 22.3262 23.4251 20.7781C22.9621 19.23 22.0268 17.8654 20.75 16.875ZM16 29.25C14.6705 29.2487 13.3761 28.8235 12.3048 28.0362C11.2335 27.2489 10.4412 26.1406 10.043 24.8721C9.64477 23.6037 9.66138 22.2413 10.0904 20.983C10.5195 19.7247 11.3386 18.6359 12.4288 17.875C12.5293 17.805 12.6111 17.7114 12.6671 17.6025C12.7231 17.4935 12.7516 17.3725 12.75 17.25V6C12.75 5.13805 13.0924 4.3114 13.7019 3.7019C14.3114 3.09241 15.138 2.75 16 2.75C16.862 2.75 17.6886 3.09241 18.2981 3.7019C18.9076 4.3114 19.25 5.13805 19.25 6V17.25C19.2501 17.3708 19.2793 17.4898 19.3352 17.5969C19.3912 17.704 19.4721 17.7959 19.5713 17.865C20.6658 18.6244 21.489 19.7137 21.9209 20.974C22.3527 22.2342 22.3706 23.5995 21.9718 24.8706C21.5731 26.1418 20.7787 27.2522 19.7044 28.04C18.6301 28.8278 17.3322 29.2518 16 29.25Z'
                          fill='#3B3B54'
                        />
                      </svg>
                    </div>
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
                    <div className='w-6 h-6 px-0.5 pt-0.5 pb-px justify-center items-center flex'>
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M19.625 24.4162L15.625 30.4162C15.5146 30.582 15.3429 30.6971 15.1476 30.7363C14.9523 30.7754 14.7495 30.7354 14.5837 30.625C14.418 30.5146 14.3029 30.3429 14.2637 30.1476C14.2246 29.9523 14.2646 29.7495 14.375 29.5837L18.375 23.5837C18.4854 23.418 18.6571 23.3029 18.8524 23.2637C19.0477 23.2246 19.2505 23.2646 19.4162 23.375C19.582 23.4854 19.6971 23.6571 19.7363 23.8524C19.7754 24.0476 19.7354 24.2505 19.625 24.4162ZM28.75 11.5C28.747 13.9523 27.7715 16.3034 26.0374 18.0374C24.3034 19.7715 21.9523 20.747 19.5 20.75H16.4012L12.625 26.4162C12.5703 26.4983 12.5 26.5688 12.4181 26.6237C12.3362 26.6786 12.2443 26.7169 12.1476 26.7363C12.0509 26.7556 11.9513 26.7558 11.8546 26.7367C11.7579 26.7176 11.6658 26.6796 11.5837 26.625C11.5017 26.5703 11.4312 26.5 11.3762 26.4181C11.3213 26.3362 11.2831 26.2443 11.2637 26.1476C11.2443 26.0509 11.2442 25.9513 11.2633 25.8546C11.2824 25.7578 11.3203 25.6658 11.375 25.5837L14.5987 20.75H9.49999C8.62788 20.7456 7.76635 20.5587 6.97079 20.2013C6.17524 19.844 5.46328 19.3241 4.88069 18.6751C4.29811 18.0261 3.8578 17.2624 3.58807 16.433C3.31834 15.6037 3.22518 14.727 3.31456 13.8595C3.40394 12.992 3.67389 12.1528 4.10706 11.3958C4.54022 10.6389 5.12701 9.98096 5.82968 9.46439C6.53235 8.94782 7.33536 8.58403 8.18706 8.39641C9.03876 8.20878 9.9203 8.20148 10.775 8.37498C11.5118 6.32326 12.9489 4.59729 14.8333 3.50099C16.7176 2.40468 18.9283 2.00834 21.0761 2.38174C23.2239 2.75514 25.1711 3.87435 26.5748 5.54229C27.9786 7.21023 28.7488 9.31995 28.75 11.5ZM27.25 11.5C27.2434 9.48647 26.4542 7.55439 25.0492 6.11211C23.6442 4.66983 21.7334 3.83035 19.7208 3.77111C17.7081 3.71187 15.7513 4.4375 14.2639 5.79464C12.7764 7.15178 11.875 9.03409 11.75 11.0437C11.7384 11.2426 11.6482 11.4288 11.4994 11.5612C11.3505 11.6937 11.1551 11.7616 10.9562 11.75C10.7573 11.7384 10.5712 11.6482 10.4387 11.4994C10.3063 11.3505 10.2384 11.1551 10.25 10.9562C10.2721 10.5789 10.3168 10.2032 10.3837 9.83123C9.7346 9.70961 9.06723 9.72468 8.42425 9.8755C7.78126 10.0263 7.1768 10.3096 6.64945 10.7072C6.1221 11.1047 5.68345 11.6079 5.36152 12.1846C5.03959 12.7612 4.84145 13.3987 4.77975 14.0562C4.71806 14.7138 4.79416 15.377 5.0032 16.0035C5.21224 16.6299 5.54963 17.2059 5.99382 17.6947C6.438 18.1834 6.97923 18.5742 7.58293 18.842C8.18664 19.1098 8.83955 19.2487 9.49999 19.25H19.5C21.5547 19.2477 23.5246 18.4304 24.9775 16.9775C26.4304 15.5246 27.2477 13.5547 27.25 11.5Z'
                          fill='#3B3B54'
                        />
                      </svg>
                    </div>
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
                    <div className=' w-6 h-6 px-0.5 py-1 justify-center items-center flex'>
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M22.75 23C22.75 23.9946 22.3549 24.9484 21.6517 25.6517C20.9484 26.3549 19.9946 26.75 19 26.75C17.3875 26.75 15.83 25.7025 15.2963 24.26C15.2273 24.0734 15.2353 23.867 15.3185 23.6862C15.4017 23.5055 15.5534 23.3652 15.74 23.2962C15.9266 23.2273 16.133 23.2353 16.3138 23.3185C16.4945 23.4017 16.6348 23.5534 16.7038 23.74C17.0163 24.5863 18.025 25.25 19 25.25C19.5967 25.25 20.169 25.0129 20.591 24.591C21.0129 24.169 21.25 23.5967 21.25 23C21.25 22.4033 21.0129 21.831 20.591 21.409C20.169 20.9871 19.5967 20.75 19 20.75H5C4.80109 20.75 4.61032 20.671 4.46967 20.5303C4.32902 20.3897 4.25 20.1989 4.25 20C4.25 19.8011 4.32902 19.6103 4.46967 19.4697C4.61032 19.329 4.80109 19.25 5 19.25H19C19.9946 19.25 20.9484 19.6451 21.6517 20.3483C22.3549 21.0516 22.75 22.0054 22.75 23ZM18.75 9C18.75 8.00544 18.3549 7.05161 17.6517 6.34835C16.9484 5.64509 15.9946 5.25 15 5.25C13.3875 5.25 11.83 6.2975 11.2963 7.74C11.2273 7.92665 11.2353 8.13304 11.3185 8.31378C11.4017 8.49452 11.5534 8.63479 11.74 8.70375C11.9266 8.77271 12.133 8.76469 12.3138 8.68147C12.4945 8.59825 12.6348 8.44665 12.7037 8.26C13.0162 7.41375 14.025 6.75 15 6.75C15.5967 6.75 16.169 6.98705 16.591 7.40901C17.0129 7.83097 17.25 8.40326 17.25 9C17.25 9.59674 17.0129 10.169 16.591 10.591C16.169 11.0129 15.5967 11.25 15 11.25H3C2.80109 11.25 2.61032 11.329 2.46967 11.4697C2.32902 11.6103 2.25 11.8011 2.25 12C2.25 12.1989 2.32902 12.3897 2.46967 12.5303C2.61032 12.671 2.80109 12.75 3 12.75H15C15.9946 12.75 16.9484 12.3549 17.6517 11.6517C18.3549 10.9484 18.75 9.99456 18.75 9ZM26 9.25C24.3875 9.25 22.83 10.2975 22.2962 11.74C22.2621 11.8324 22.2465 11.9307 22.2503 12.0291C22.2541 12.1276 22.2773 12.2243 22.3185 12.3138C22.3597 12.4033 22.4182 12.4838 22.4905 12.5507C22.5628 12.6176 22.6476 12.6696 22.74 12.7037C22.8324 12.7379 22.9307 12.7535 23.0291 12.7497C23.1276 12.7459 23.2243 12.7227 23.3138 12.6815C23.4033 12.6403 23.4838 12.5818 23.5507 12.5095C23.6176 12.4372 23.6696 12.3524 23.7038 12.26C24.0163 11.4138 25.025 10.75 26 10.75C26.5967 10.75 27.169 10.9871 27.591 11.409C28.0129 11.831 28.25 12.4033 28.25 13C28.25 13.5967 28.0129 14.169 27.591 14.591C27.169 15.0129 26.5967 15.25 26 15.25H4C3.80109 15.25 3.61032 15.329 3.46967 15.4697C3.32902 15.6103 3.25 15.8011 3.25 16C3.25 16.1989 3.32902 16.3897 3.46967 16.5303C3.61032 16.671 3.80109 16.75 4 16.75H26C26.9946 16.75 27.9484 16.3549 28.6517 15.6517C29.3549 14.9484 29.75 13.9946 29.75 13C29.75 12.0054 29.3549 11.0516 28.6517 10.3483C27.9484 9.64509 26.9946 9.25 26 9.25Z'
                          fill='#3B3B54'
                        />
                      </svg>
                    </div>
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Wind speed
                    </div>
                  </div>
                  <div className='KmH'>
                    <span className='text-neutral-50 text-base font-bold  leading-snug'>
                      {weatherDetails.wind.speed.toFixed()}
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
                    <div className='w-6 h-6 px-1 pt-px pb-0.5 justify-center items-center flex'>
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M21.5662 6.13258C20.0352 4.36406 18.3126 2.77098 16.43 1.38258C16.304 1.29438 16.1538 1.24707 16 1.24707C15.8462 1.24707 15.696 1.29438 15.57 1.38258C13.6874 2.77098 11.9648 4.36406 10.4338 6.13258C7.0425 10.0326 5.25 14.1363 5.25 18.0001C5.25 20.8512 6.38259 23.5855 8.3986 25.6015C10.4146 27.6175 13.1489 28.7501 16 28.7501C18.8511 28.7501 21.5854 27.6175 23.6014 25.6015C25.6174 23.5855 26.75 20.8512 26.75 18.0001C26.75 14.1363 24.9575 10.0326 21.5662 6.13258ZM16 27.2501C13.5477 27.2471 11.1966 26.2716 9.46255 24.5375C7.72848 22.8035 6.75298 20.4524 6.75 18.0001C6.75 10.5476 14.125 4.38383 16 2.93633C17.875 4.38383 25.25 10.5476 25.25 18.0001C25.247 20.4524 24.2715 22.8035 22.5374 24.5375C20.8034 26.2716 18.4523 27.2471 16 27.2501ZM22.74 19.1251C22.4899 20.5226 21.8177 21.81 20.8138 22.8138C19.8099 23.8177 18.5225 24.49 17.125 24.7401C17.0836 24.7464 17.0419 24.7497 17 24.7501C16.8114 24.7508 16.6295 24.6805 16.4904 24.5531C16.3514 24.4258 16.2654 24.2507 16.2497 24.0628C16.2339 23.8749 16.2895 23.6879 16.4054 23.5392C16.5213 23.3904 16.6889 23.2908 16.875 23.2601C19.0475 22.8951 20.8913 21.0501 21.26 18.8751C21.2932 18.6788 21.4029 18.5038 21.5651 18.3884C21.6455 18.3313 21.7362 18.2906 21.8323 18.2686C21.9284 18.2465 22.0278 18.2437 22.125 18.2601C22.2222 18.2765 22.3152 18.3119 22.3987 18.3642C22.4822 18.4166 22.5545 18.4849 22.6116 18.5652C22.6688 18.6455 22.7095 18.7363 22.7315 18.8324C22.7535 18.9284 22.7564 19.0279 22.74 19.1251Z'
                          fill='#3B3B54'
                        />
                      </svg>
                    </div>
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
                    <div className='w-6 h-6 p-0.5 justify-center items-center flex'>
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M15.25 5V4C15.25 3.80109 15.329 3.61032 15.4697 3.46967C15.6103 3.32902 15.8011 3.25 16 3.25C16.1989 3.25 16.3897 3.32902 16.5303 3.46967C16.671 3.61032 16.75 3.80109 16.75 4V5C16.75 5.19891 16.671 5.38968 16.5303 5.53033C16.3897 5.67098 16.1989 5.75 16 5.75C15.8011 5.75 15.6103 5.67098 15.4697 5.53033C15.329 5.38968 15.25 5.19891 15.25 5ZM23.75 16C23.75 17.5328 23.2955 19.0312 22.4439 20.3057C21.5923 21.5802 20.3819 22.5735 18.9658 23.1601C17.5497 23.7466 15.9914 23.9001 14.4881 23.6011C12.9847 23.302 11.6038 22.5639 10.5199 21.4801C9.43607 20.3962 8.69795 19.0153 8.39891 17.5119C8.09988 16.0086 8.25335 14.4503 8.83993 13.0342C9.42651 11.6181 10.4199 10.4077 11.6943 9.55611C12.9688 8.70453 14.4672 8.25 16 8.25C18.0547 8.25232 20.0246 9.06957 21.4775 10.5225C22.9304 11.9754 23.7477 13.9453 23.75 16ZM22.25 16C22.25 14.7639 21.8834 13.5555 21.1967 12.5277C20.5099 11.4999 19.5338 10.6988 18.3918 10.2258C17.2497 9.75271 15.9931 9.62893 14.7807 9.87009C13.5683 10.1112 12.4547 10.7065 11.5806 11.5806C10.7065 12.4547 10.1112 13.5683 9.87009 14.7807C9.62893 15.9931 9.75271 17.2497 10.2258 18.3918C10.6988 19.5338 11.4999 20.5099 12.5277 21.1967C13.5555 21.8834 14.7639 22.25 16 22.25C17.657 22.248 19.2456 21.5889 20.4172 20.4172C21.5889 19.2456 22.248 17.657 22.25 16ZM7.47 8.53C7.53866 8.60369 7.62146 8.66279 7.71346 8.70378C7.80546 8.74477 7.90478 8.76682 8.00548 8.76859C8.10618 8.77037 8.20621 8.75184 8.2996 8.71412C8.39299 8.6764 8.47782 8.62026 8.54904 8.54904C8.62026 8.47782 8.6764 8.39299 8.71412 8.2996C8.75184 8.20621 8.77037 8.10618 8.76859 8.00548C8.76682 7.90478 8.74477 7.80546 8.70378 7.71346C8.66279 7.62146 8.60369 7.53866 8.53 7.47L7.53 6.47C7.38783 6.33752 7.19978 6.2654 7.00548 6.26883C6.81118 6.27225 6.62579 6.35097 6.48838 6.48838C6.35097 6.62579 6.27225 6.81118 6.26883 7.00548C6.2654 7.19978 6.33752 7.38783 6.47 7.53L7.47 8.53ZM7.47 23.47L6.47 24.47C6.39631 24.5387 6.33721 24.6215 6.29622 24.7135C6.25523 24.8055 6.23319 24.9048 6.23141 25.0055C6.22963 25.1062 6.24816 25.2062 6.28588 25.2996C6.3236 25.393 6.37974 25.4778 6.45096 25.549C6.52218 25.6203 6.60701 25.6764 6.7004 25.7141C6.79379 25.7518 6.89382 25.7704 6.99452 25.7686C7.09523 25.7668 7.19454 25.7448 7.28654 25.7038C7.37854 25.6628 7.46134 25.6037 7.53 25.53L8.53 24.53C8.60369 24.4613 8.66279 24.3785 8.70378 24.2865C8.74477 24.1945 8.76682 24.0952 8.76859 23.9945C8.77037 23.8938 8.75184 23.7938 8.71412 23.7004C8.6764 23.607 8.62026 23.5222 8.54904 23.451C8.47782 23.3797 8.39299 23.3236 8.2996 23.2859C8.20621 23.2482 8.10618 23.2296 8.00548 23.2314C7.90478 23.2332 7.80546 23.2552 7.71346 23.2962C7.62146 23.3372 7.53866 23.3963 7.47 23.47ZM24.47 6.47L23.47 7.47C23.3963 7.53866 23.3372 7.62146 23.2962 7.71346C23.2552 7.80546 23.2332 7.90478 23.2314 8.00548C23.2296 8.10618 23.2482 8.20621 23.2859 8.2996C23.3236 8.39299 23.3797 8.47782 23.451 8.54904C23.5222 8.62026 23.607 8.6764 23.7004 8.71412C23.7938 8.75184 23.8938 8.77037 23.9945 8.76859C24.0952 8.76682 24.1945 8.74477 24.2865 8.70378C24.3785 8.66279 24.4613 8.60369 24.53 8.53L25.53 7.53C25.6625 7.38783 25.7346 7.19978 25.7312 7.00548C25.7277 6.81118 25.649 6.62579 25.5116 6.48838C25.3742 6.35097 25.1888 6.27225 24.9945 6.26883C24.8002 6.2654 24.6122 6.33752 24.47 6.47ZM24.53 23.47C24.3878 23.3375 24.1998 23.2654 24.0055 23.2688C23.8112 23.2723 23.6258 23.351 23.4884 23.4884C23.351 23.6258 23.2723 23.8112 23.2688 24.0055C23.2654 24.1998 23.3375 24.3878 23.47 24.53L24.47 25.53C24.6122 25.6625 24.8002 25.7346 24.9945 25.7312C25.1888 25.7277 25.3742 25.649 25.5116 25.5116C25.649 25.3742 25.7277 25.1888 25.7312 24.9945C25.7346 24.8002 25.6625 24.6122 25.53 24.47L24.53 23.47ZM5 15.25H4C3.80109 15.25 3.61032 15.329 3.46967 15.4697C3.32902 15.6103 3.25 15.8011 3.25 16C3.25 16.1989 3.32902 16.3897 3.46967 16.5303C3.61032 16.671 3.80109 16.75 4 16.75H5C5.19891 16.75 5.38968 16.671 5.53033 16.5303C5.67098 16.3897 5.75 16.1989 5.75 16C5.75 15.8011 5.67098 15.6103 5.53033 15.4697C5.38968 15.329 5.19891 15.25 5 15.25ZM16 26.25C15.8011 26.25 15.6103 26.329 15.4697 26.4697C15.329 26.6103 15.25 26.8011 15.25 27V28C15.25 28.1989 15.329 28.3897 15.4697 28.5303C15.6103 28.671 15.8011 28.75 16 28.75C16.1989 28.75 16.3897 28.671 16.5303 28.5303C16.671 28.3897 16.75 28.1989 16.75 28V27C16.75 26.8011 16.671 26.6103 16.5303 26.4697C16.3897 26.329 16.1989 26.25 16 26.25ZM28 15.25H27C26.8011 15.25 26.6103 15.329 26.4697 15.4697C26.329 15.6103 26.25 15.8011 26.25 16C26.25 16.1989 26.329 16.3897 26.4697 16.5303C26.6103 16.671 26.8011 16.75 27 16.75H28C28.1989 16.75 28.3897 16.671 28.5303 16.5303C28.671 16.3897 28.75 16.1989 28.75 16C28.75 15.8011 28.671 15.6103 28.5303 15.4697C28.3897 15.329 28.1989 15.25 28 15.25Z'
                          fill='#3B3B54'
                        />
                      </svg>
                    </div>
                    <div className='text-center text-slate-300 text-sm font-bold  leading-tight'>
                      <p>UV Index </p>
                    </div>
                  </div>
                  <div className=' text-neutral-50 text-base font-bold  leading-snug'>
                    {uvIndex.toFixed()}
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
