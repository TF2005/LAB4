## Setup Instructions

### 1. Get an API Key

1. Visit the [OpenWeatherMap website](https://home.openweathermap.org/api_keys).
2. Create an account or sign in.
3. Open the **API Keys** section.
4. Copy your API key. It may take some time for a newly created key to become active.

### 2. Configure the API Key

1. Open the `js` folder in the project.
2. Copy `config.example.js` and rename the copy to `config.js`.
3. Open `config.js` and replace `YOUR_API_KEY_HERE` with your own OpenWeatherMap API key.

The file should look like this:

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

Replace the placeholder with your actual key. Do not share your key or commit `config.js` to Git.

### 3. Run the Application

Open `index.html` in your browser and search for a city to view its current weather and forecast.

### Important

The real `js/config.js` file is excluded from Git using `.gitignore`. The `js/config.example.js` file is included in the repository so that other users can configure their own API keys.