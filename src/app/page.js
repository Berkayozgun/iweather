"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/Image";

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
      console.log(response.data);
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
          <div className='Content w-96 h-96 px-2 pt-2 pb-5 bg-neutral-900 flex-col justify-start items-end gap-2 inline-flex'>
            <div className='Card self-stretch h-80 p-3 bg-zinc-900 rounded-xl flex-col justify-start items-start gap-3 flex'>
              <div className='Today w-80 h-72 relative rounded-lg'>
                <div className='Background w-80 h-72 left-0 top-0 absolute justify-center items-center inline-flex'>
                  <Image
                    width={80}
                    height={72}
                    src='https://via.placeholder.com/335x304'
                    alt='Current weather'
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
                <div className='Info h-10 left-[20px] top-[20px] absolute flex-col justify-start items-start gap-56 inline-flex'>
                  <div className='Location flex-col justify-start items-start gap-0.5 flex'>
                    <div className='IstanbulTr text-center text-neutral-50 text-base font-bold  leading-snug'>
                      <p>Weather details for {weatherDetails.name}</p>
                    </div>
                    <div className='MondayMay152023 text-center text-neutral-50 text-xs font-normal  leading-none'>
                      Monday, May 15, 2023
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='WeatherDetail self-stretch h-72 px-4 py-1 bg-zinc-900 rounded-xl flex-col justify-start items-start gap-2 flex'>
              <div className='List self-stretch h-72 flex-col justify-start items-start flex'>
                <div className='Item self-stretch py-4 border-b border-gray-900 justify-between items-center inline-flex'>
                  <div className='Title justify-start items-center gap-3 flex'>
                    <div className='Icons w-6 h-6 px-1.5 py-px justify-center items-center flex' />
                    <div className='ThermalSensation text-center text-slate-300 text-sm font-bold  leading-tight'>
                      Thermal sensation
                    </div>
                  </div>
                  <div className='C text-neutral-50 text-base font-bold  leading-snug'>
                    26ºc
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
                      8
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
                    40%
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
                <div className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'>
                  <div className='Mon text-center text-slate-300 text-sm font-bold  leading-tight'>
                    Mon
                  </div>
                  <div className='Icons w-14 h-14 relative'>
                    <div className='Light w-6 h-1 left-[14.62px] top-[38.24px] absolute bg-yellow-200 rounded-3xl blur-3xl' />
                  </div>
                  <div className='Details flex-col justify-start items-center flex'>
                    <div className='C text-center text-neutral-50 text-sm font-bold  leading-tight'>
                      32ºc
                    </div>
                    <div className='C text-center text-slate-500 text-sm font-bold  leading-tight'>
                      26ºc{" "}
                    </div>
                  </div>
                </div>
                <div className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'>
                  <div className='Tue text-center text-slate-300 text-sm font-bold  leading-tight'>
                    Tue
                  </div>
                  <div className='Icons w-14 h-14 relative'>
                    <div className='Light w-6 h-1 left-[14.62px] top-[38.24px] absolute rounded-3xl blur-3xl' />
                  </div>
                  <div className='Details flex-col justify-start items-center flex'>
                    <div className='C text-center text-neutral-50 text-sm font-bold  leading-tight'>
                      32ºc
                    </div>
                    <div className='C text-center text-slate-500 text-sm font-bold  leading-tight'>
                      26ºc{" "}
                    </div>
                  </div>
                </div>
                <div className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'>
                  <div className='Wed text-center text-slate-300 text-sm font-bold  leading-tight'>
                    Wed
                  </div>
                  <div className='Icons w-14 h-14 relative' />
                  <div className='Details flex-col justify-start items-center flex'>
                    <div className='C text-center text-neutral-50 text-sm font-bold  leading-tight'>
                      32ºc
                    </div>
                    <div className='C text-center text-slate-500 text-sm font-bold  leading-tight'>
                      26ºc{" "}
                    </div>
                  </div>
                </div>
                <div className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'>
                  <div className='Thu text-center text-slate-300 text-sm font-bold  leading-tight'>
                    Thu
                  </div>
                  <div className='Icons w-14 h-14 relative' />
                  <div className='Details flex-col justify-start items-center flex'>
                    <div className='C text-center text-neutral-50 text-sm font-bold  leading-tight'>
                      32ºc
                    </div>
                    <div className='C text-center text-slate-500 text-sm font-bold  leading-tight'>
                      26ºc{" "}
                    </div>
                  </div>
                </div>
                <div className='Day grow shrink basis-0 self-stretch flex-col justify-center items-center gap-1 inline-flex'>
                  <div className='Sun text-center text-slate-300 text-sm font-bold  leading-tight'>
                    Sun
                  </div>
                  <div className='Icons w-14 h-14 px-3.5 py-3.5 justify-center items-center inline-flex' />
                  <div className='Details flex-col justify-start items-center flex'>
                    <div className='C text-center text-neutral-50 text-sm font-bold  leading-tight'>
                      32ºc
                    </div>
                    <div className='C text-center text-slate-500 text-sm font-bold  leading-tight'>
                      26ºc{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
