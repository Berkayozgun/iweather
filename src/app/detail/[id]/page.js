"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiKey } from "../../apidetails";

const CityDetailPage = ({ cityName }) => {
  const [cityDetails, setCityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = "ddffe405f7a43c3e417f986dc0a3f731";

  useEffect(() => {
    const fetchCityCoordinates = async () => {
      try {
        const response = await axios.get(
          "http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={apiKey}"
        );
        const { lat, lon } = response.data[0];
        fetchCityDetails(lat, lon);
      } catch (error) {
        console.error("Error fetching city coordinates:", error);
        setLoading(false);
      }
    };

    const fetchCityDetails = async (lat, lon) => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${Math.floor(
            Date.now() / 1000
          )}&appid=${apiKey}&}`
        );
        setCityDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching city details:", error);
        setLoading(false);
      }
    };

    fetchCityCoordinates();
  }, [cityName, apiKey]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!cityDetails) {
    return <div>Error fetching city details. Please try again later.</div>;
  }

  return (
    <div>
      <h1>{cityDetails.timezone}</h1>
      <p>Temperature: {cityDetails.current.temp} °C</p>
      <p>Weather: {cityDetails.current.weather[0].description}</p>
      <p>Humidity: {cityDetails.current.humidity}%</p>
      <p>Wind Speed: {cityDetails.current.wind_speed} m/s</p>
    </div>
  );
};

export default CityDetailPage;
