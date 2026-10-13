const apiKey = API_KEY;
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


// Get the weather information for the searched city.
async function getWeather(city, currentSearch) {
    try {
        const params = new URLSearchParams({
            q: city,
            limit: "1",
            appid: apiKey
        });
        const url = "https://api.openweathermap.org/geo/1.0/direct?" + params;
        const response = await fetch(url);

        if (currentSearch !== searchNumber) {
            return;
        }

        if (!response.ok) {
            throw new Error("Request failed");
        }
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            const cityData = data[0];

            const weatherParams = new URLSearchParams({
                lat: cityData.lat,
                lon: cityData.lon,
                appid: apiKey,
                units: "metric"
            });

            const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?" + weatherParams;
            const weatherResponse = await fetch(weatherUrl);

            if (currentSearch !== searchNumber) {
                return;
            }

            if (!weatherResponse.ok) {
                throw new Error("Weather request failed");
            }
            const weatherData = await weatherResponse.json();

            const forecastParams = new URLSearchParams({
                lat: cityData.lat,
                lon: cityData.lon,
                appid: apiKey,
                units: "metric"
            });

            const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?" + forecastParams;
            const forecastResponse = await fetch(forecastUrl);

            if (currentSearch !== searchNumber) {
                return;
            }

            if (!forecastResponse.ok) {
                throw new Error("Forecast request failed");
            }
            const forecastData = await forecastResponse.json();

            const currentWeather = weatherData;
            const hourly = forecastData.list;
            hourlyForecastList.innerHTML = ""; /*removes old forecast*/

            /*I wanted to add a 6 forecast boxes for each upcoming hour so i learned the following way through AI assistance*/
            const endIndex = Math.min(6, hourly.length); /*find the 6h upcoming forecast */

            for (let i = 0; i < endIndex; i++) {

                const forecastTime = hourly[i].dt_txt; // for each one, it finds time and temperature*/
                const forecastTemperature = hourly[i].main.temp;
                const forecastWeatherCode = hourly[i].weather[0].id; /*get the weather description and emoji for this forecast hour.*/
                const forecastWeatherInfo = getWeatherInfo(forecastWeatherCode);

                const forecastCard = document.createElement("div");
                forecastCard.className = "forecast-item";

                let hour = Number(forecastTime.split(" ")[1].split(":")[0]); /* get the hour from the forecast time*/

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
                forecastIcon.textContent = forecastWeatherInfo.icon;

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
            const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
            countryName.textContent = countryNames.of(cityData.country);/*display the country of the city we searched for */

            /*I wanted to specify the date and time for every weather retrieve so i learned the following way through AI assistance*/
            const now = new Date();
            currentDate.textContent = "📅" + now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            currentTime.textContent = "⌚" + now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            temperature.textContent = Math.round(currentWeather.main.temp); /*display the temperature*/
            feelsLike.textContent = "Feels like " + Math.round(currentWeather.main.feels_like) + "°C";
            humidity.textContent = currentWeather.main.humidity + "%";
            windSpeed.textContent = currentWeather.wind.speed + " m/s";

            const weatherCode = currentWeather.weather[0].id; /*after searching, discovered each weather code corresponds to a specific condition */
            const weatherInfo = getWeatherInfo(weatherCode);
            conditions.textContent = currentWeather.weather[0].description;

            weatherIcon.textContent = weatherInfo.icon;

        } else {
            if (currentSearch !== searchNumber) { /*ignore errors from an older search*/
                return;
            }
            loadingMessage.textContent = ""; /*clear the loading message if no data found */
            errorMessage.textContent = "City not found. Please try another name.";
        }

    } catch (error) {
        if (currentSearch !== searchNumber) {
            return;
        }
        loadingMessage.textContent = ""; /*clear the loading message if request fails */
        errorMessage.textContent = "Unable to fetch city data. Please try again."; /* display error message if the request fails */
    }
}

function getWeatherInfo(weatherCode) {
    if (weatherCode >= 200 && weatherCode <= 232) {
        return { description: "Thunderstorm", icon: "⛈️" };
    } else if (weatherCode >= 300 && weatherCode <= 321) {
        return { description: "Drizzle", icon: "🌦️" };
    } else if (weatherCode >= 500 && weatherCode <= 531) {
        return { description: "Rain", icon: "🌧️" };
    } else if (weatherCode >= 600 && weatherCode <= 622) {
        return { description: "Snow", icon: "❄️" };
    } else if (weatherCode >= 701 && weatherCode <= 781) {
        return { description: "Fog", icon: "🌫️" };
    } else if (weatherCode === 800) {
        return { description: "Clear sky", icon: "☀️" };
    } else if (weatherCode >= 801 && weatherCode <= 804) {
        return { description: "Partly cloudy", icon: "⛅" };
    } else {
        return { description: "Unknown weather condition", icon: "❔" };
    }
}
