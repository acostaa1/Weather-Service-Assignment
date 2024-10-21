const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "Welcome to Forecast" });
});

router.get("/api", async (req, res, next) => {
  // http://localhost:3000/forecast/api?latitude={latitude}&longitude={longitude}

  try {
    // the query comes in as a string, however we need digits for the call
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (
      typeof latitude !== "number" ||
      isNaN(latitude) ||
      typeof longitude !== "number" ||
      isNaN(longitude)
    ) {
      return next({
        status: 400,
        message: `double check you've provided latitude and longitude!`,
      });
    }

    // make call to weather service api without needing the WFO (forecast office ID)
    // did this to abstract the call for the user
    const url = `https://api.weather.gov/points/${latitude},${longitude}`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // response detailing the WFO, X and Y coordinates (get in the format their api expects)
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      next({
        status: 400,
        message:
          "Error getting a response from the weather service. The latitude and longitude you entered likely do not correspond to an acutal location!",
      });
    }

    const gridId = responseData.properties.gridId;
    const gridX = responseData.properties.gridX;
    const gridY = responseData.properties.gridY;

    // url to call for the actual forecast
    const forecastURL = ` https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast?units=us`;

    // make call to get actual forecast data
    const forecastResponse = await fetch(forecastURL, options);
    const forecastData = await forecastResponse.json();

    const temperature = forecastData.properties.periods[0].temperature;
    const shortForecast = forecastData.properties.periods[0].shortForecast;
    const city = responseData.properties.relativeLocation.properties.city;
    const state = responseData.properties.relativeLocation.properties.state;

    // weather characterization (i.e, hot, moderate, cold)
    let characterization = "";

    if (temperature >= 90) {
      characterization = "hot";
    } else if (temperature >= 68) {
      characterization = "moderate";
    } else if (temperature < 68) {
      characterization = "cold";
    }

    res.status(200).json({
      city,
      state,
      temperature,
      shortForecast,
      characterization,
    });
  } catch (error) {
    next({ status: 500, message: "Server Error!" });
  }
});

module.exports = router;
