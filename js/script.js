const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");


searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); /* remove the browser's default refresh after submitting */
    const city = cityInput.value;
    console.log(city);

if (city === "") { /* check if input is empty */
    errorMessage.textContent = "Please enter a city name.";
    return;
}

errorMessage.textContent = ""; /* delete the error message once adjusted */
getWeather(city); /* call the function to get the weather for the city */
});

async function getWeather(city) {
    try {
        const params = new URLSearchParams({
            name: city
        });
        const url = "https://geocoding-api.open-meteo.com/v1/search?" + params; /*created the url to fetch*/
        const response = await fetch(url); /*fetch will send the request to the api to convert the city name to geocoding */

        if (!response.ok) { /*ok attribute is true if the request was successful*/
            throw new Error("Request failed");
        }
        const data = await response.json(); /* convert the response back to JS object */

        if (data.results && data.results.length > 0) { /* check if the results array is defined and is not empty */
            const cityData = data.results[0];

            const weatherParams = new URLSearchParams({
                latitude: cityData.latitude,
                longitude: cityData.longitude,
                current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
            });

            const weatherUrl = "https://api.open-meteo.com/v1/forecast?" + weatherParams; /*another request to get the weather data for the city from the geocoding infomartion response*/
            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) {
                throw new Error("Weather request failed");
            }
            const weatherData = await weatherResponse.json();
            const currentWeather = weatherData.current;

            cityName.textContent = cityData.name; /*display name of the city we searched for */
            temperature.textContent = currentWeather.temperature_2m + " °C"; /*display the temperature*/
            feelsLike.textContent = "Feels like: " + currentWeather.apparent_temperature + " °C";
            humidity.textContent = "Humidity: " + currentWeather.relative_humidity_2m + "%";
            windSpeed.textContent = "Wind speed: " + currentWeather.wind_speed_10m + " km/h";
            
            const weatherCode = currentWeather.weather_code; /*after searching, discovered each weather code corresponds to a specific condition */
            if (weatherCode === 0) {
                conditions.textContent = "Clear sky";
            } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
                conditions.textContent = "Partly cloudy or overcast";
            } else if (weatherCode === 45 || weatherCode === 48) {
                conditions.textContent = "Fog";
            } else if (weatherCode >= 51 && weatherCode <= 55) {
                conditions.textContent = "Drizzle";
            } else if (weatherCode >= 61 && weatherCode <= 65) {
                conditions.textContent = "Rain";
            } else if (weatherCode >= 71 && weatherCode <= 75) {
                conditions.textContent = "Snow";
            } else if (weatherCode >= 80 && weatherCode <= 82) {
                conditions.textContent = "Rain showers";
            } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
                conditions.textContent = "Thunderstorm";
            } else {
                conditions.textContent = "Unknown weather condition";
            }

        } else {
            errorMessage.textContent = "City not found. Please try another name.";
        }

    } catch (error) {
        errorMessage.textContent = "Unable to fetch city data. Please try again."; /* display error message if the request fails */
    }
}
