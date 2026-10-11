const cityInput = document.getElementById("cityInput");

const loadingMessage = document.getElementById("loadingMessage");

const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");


const searchForm = document.getElementById("searchForm");
searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); /* remove the browser's default refresh after submitting */
    const city = cityInput.value;
    console.log(city);
});

const errorMessage = document.getElementById("errorMessage");
if (city === "") { /* check if input is empty */
    errorMessage.textContent = "Please enter a city name.";
    return;
}

errorMessage.textContent = ""; /* delete the error message once adjusted */
console.log(city);


async function getWeather(city) {
    try {
        const params = new URLSearchParams({
            name: city
        });
        const url = "https://geocoding-api.open-meteo.com/v1/search?" + params; /*created the url to fetch*/
        const response = await fetch(url); /*fetch will send the request to the api */

        if (!response.ok) { /*ok attribute is true if the request was successful*/
            throw new Error("Request failed");
        }
        const data = await response.json(); /* convert the response back to JS object */

        if (data.results && data.results.length > 0) { /* check if the results array is defined and is not empty */
            const cityData = data.results[0];
            console.log(cityData.name);
            console.log(cityData.latitude);
            console.log(cityData.longitude);
        } else {
            errorMessage.textContent = "City not found. Please try another name.";
        }

    } catch (error) {
        errorMessage.textContent = "Unable to fetch city data. Please try again."; /* display error message if the request fails */
    }
}
