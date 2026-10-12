const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");
const hourlyForecastList = document.getElementById("hourlyForecastList");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

let searchNumber = 0;

weatherResult.style.display = "none"; /*hide the weather results when the page first opens */
searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); /* remove the browser's default refresh after submitting */
    const city = cityInput.value.trim(); /*get value of input and remove extra spaces */
    console.log(city);

    if (city === "") { /* check if input is empty */
        errorMessage.textContent = "Please enter a city name.";
        return;
    }

    errorMessage.textContent = ""; /* delete the error message once adjusted */
    weatherResult.style.display = "none"; /*remove previous results when pressing search again */
    loadingMessage.textContent = "Loading weather...";
    searchNumber++;
    const currentSearch = searchNumber;
    getWeather(city, currentSearch); /* call the function to get the weather for the city */
});


cityInput.addEventListener("input", function () { /*remove previous results when user changes the city input*/
    weatherResult.style.display = "none";
    errorMessage.textContent = ""; /* hide the error when the user edits the input. */
    loadingMessage.textContent = ""; /*don't show the previous search loading message.*/
    searchNumber++;

});

cityInput.addEventListener("focus", function () {
    cityInput.select();
});


async function getWeather(city, currentSearch) {
    try {
        const params = new URLSearchParams({
            name: city
        });
        const url = "https://geocoding-api.open-meteo.com/v1/search?" + params; /*created the url to fetch*/
        const response = await fetch(url); /*fetch will send the request to the api to convert the city name to geocoding */

        if (currentSearch !== searchNumber) { /*stop if the user started a new search*/
            return;
        }

        if (!response.ok) { /*ok attribute is true if the request was successful*/
            throw new Error("Request failed");
        }
        const data = await response.json(); /* convert the response back to JS object */

        if (data.results && data.results.length > 0) { /* check if the results array is defined and is not empty */
            const cityData = data.results[0];

            const weatherParams = new URLSearchParams({
                latitude: cityData.latitude,
                longitude: cityData.longitude,
                current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
                hourly: "temperature_2m,weather_code", /*asks API for these features for each hour.*/
                timezone: "auto", /*API will return the time of the searched city*/
                forecast_days: 2 /*API will return the forecast for the next 2 days which is an enough data to extract from it the upcoming few hours*/

            });

            const weatherUrl = "https://api.open-meteo.com/v1/forecast?" + weatherParams; /*another request to get the weather data for the city from the geocoding infomartion response*/
            const weatherResponse = await fetch(weatherUrl);

            if (currentSearch !== searchNumber) {
                return;
            }

            if (!weatherResponse.ok) {
                throw new Error("Weather request failed");
            }
            const weatherData = await weatherResponse.json();
            const currentWeather = weatherData.current;
            const hourly = weatherData.hourly; /*get the hourly forecast data from API*/
            let nextHourIndex = 0;
            for (let i = 0; i < hourly.time.length; i++) { /*finding the forecast hour that comes immediately after the current time*/
                if (hourly.time[i] > currentWeather.time) {
                    nextHourIndex = i;
                    break; /*stop once an hour is found*/
                }
            }
            hourlyForecastList.innerHTML = ""; /*removes old forecast*/

            /*I wanted to add a 6 forecast boxes for each upcoming hour so i learned the following way through AI assistance*/
            const endIndex = Math.min(nextHourIndex + 6, hourly.time.length); /*find the 6h upcoming forecast */

            for (let i = nextHourIndex; i < endIndex; i++) {

                const forecastTime = hourly.time[i]; // for each one, it finds time and temperature*/
                const forecastTemperature = hourly.temperature_2m[i];
                const forecastWeatherCode = hourly.weather_code[i]; /*get the weather description and emoji for this forecast hour.*/
                const forecastWeatherInfo = getWeatherInfo(forecastWeatherCode);

                const forecastCard = document.createElement("div");
                forecastCard.className = "forecast-item";

                let hour = Number(forecastTime.split("T")[1].split(":")[0]); /* get the hour from the forecast time*/

                const period = hour >= 12 ? "PM" : "AM"; /* once got, convert to 12h format */
                hour = hour % 12 || 12;

                const timeLabel = document.createElement("p"); /*display time */
                timeLabel.className = "forecast-time";
                timeLabel.textContent = hour + " " + period;

                const temperatureLabel = document.createElement("p"); /*display temperature */
                temperatureLabel.className = "forecast-temperature";
                temperatureLabel.textContent = Math.round(forecastTemperature) + "°C";

                forecastCard.appendChild(timeLabel);
                const forecastIcon = document.createElement("p"); /*created an element to display in it the weather emoji for this hour */
                forecastIcon.className = "forecast-icon";
                const forecastHour = Number(forecastTime.split("T")[1].split(":")[0]);
                forecastIcon.textContent = forecastHour < 6 || forecastHour >= 18 ? "🌙" : forecastWeatherInfo.icon; /* at night, show the moon; during the day, show the weather emoji */

                forecastCard.appendChild(forecastIcon); /*added emoji between the time and temperature.*/
                forecastCard.appendChild(temperatureLabel);

                hourlyForecastList.appendChild(forecastCard);
            }

            if (currentSearch !== searchNumber) {
                return;
            }
            loadingMessage.textContent = ""; /*clear the loading message once data found */
            weatherResult.style.display = "block"; /*display the weather section since results were found */
            cityName.textContent = "📍" + cityData.name; /*display name of the city we searched for */
            countryName.textContent = cityData.country; /*display the country of the city we searched for */

            /*I wanted to specify the date and time for every weather retrieve so i learned the following way through AI assistance*/
            const now = new Date();/*gives the current date and time*/
            currentDate.textContent = "📅" + now.toLocaleDateString("en-US", { /*display the date like Thu, Apr 24, 2025*/
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            currentTime.textContent = "⌚" + now.toLocaleTimeString("en-US", { /*display the time like 3:32 PM*/
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            temperature.textContent = currentWeather.temperature_2m; /*display the temperature*/
            feelsLike.textContent = "Feels like " + currentWeather.apparent_temperature + "°C";
            humidity.textContent = currentWeather.relative_humidity_2m + "%";
            windSpeed.textContent = currentWeather.wind_speed_10m + " km/h";

            const weatherCode = currentWeather.weather_code; /*after searching, discovered each weather code corresponds to a specific condition */
            const weatherInfo = getWeatherInfo(weatherCode);
            conditions.textContent = weatherInfo.description;

            const currentHour = Number(currentWeather.time.split("T")[1].split(":")[0]);
            weatherIcon.textContent = currentHour < 6 || currentHour >= 18 ? "🌙" : weatherInfo.icon;

        } else {
            if (currentSearch !== searchNumber) { /*ignore errors from an older search*/
                return;
            }
            loadingMessage.textContent = ""; /*clear the loading message if no data found */
            errorMessage.textContent = "City not found. Please try another name.";
        }

    } catch (error) {
        loadingMessage.textContent = ""; /*clear the loading message if request fails */
        errorMessage.textContent = "Unable to fetch city data. Please try again."; /* display error message if the request fails */
    }
}

function getWeatherInfo(weatherCode) {
    if (weatherCode === 0) {
        return { description: "Clear sky", icon: "☀️" };
    } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
        return { description: "Partly cloudy", icon: "⛅" };
    } else if (weatherCode === 45 || weatherCode === 48) {
        return { description: "Fog", icon: "🌫️" };
    } else if (weatherCode >= 51 && weatherCode <= 55) {
        return { description: "Drizzle", icon: "🌦️" };
    } else if (weatherCode >= 61 && weatherCode <= 65) {
        return { description: "Rain", icon: "🌧️" };
    } else if (weatherCode >= 71 && weatherCode <= 75) {
        return { description: "Snow", icon: "❄️" };
    } else if (weatherCode >= 80 && weatherCode <= 82) {
        return { description: "Rain showers", icon: "🌧️" };
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        return { description: "Thunderstorm", icon: "⛈️" };
    } else {
        return { description: "Unknown weather condition", icon: "❔" };
    }
}
