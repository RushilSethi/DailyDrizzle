const locationInput = document.getElementById("location_input");
const locationSearch = document.getElementById("location_search");
const currentLocationBtn = document.getElementById("current_location_btn");

const apiKey = "e411b3ac9894468fa69120046241010";

locationSearch.addEventListener("click", function () {
    const locationVal = locationInput.value;
    if (validateInput(locationVal)) {
        fetchWeather(locationVal.trim());
    }
});

function fetchWeather(city) {
    const currentData = fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`).then(response => response.json());
    const forecastData = fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=yes`).then(response => response.json());

    Promise.all([currentData, forecastData])
        .then(([currentData, forecastData]) => {
            displayWeather(city, currentData, forecastData);
        }).catch(error => {
            console.error('Error fetching weather data:', error);
            // Implement function showError(); that displays error in a good UI under the search bar 
        });
}

function validateInput(locationVal) {
    const trimmedInput = locationVal.trim();
    if (trimmedInput === '') {
        alert("Please enter a valid location");
        return false;
    }
    return true;
}

function displayWeather(city, currentData, forecastData) {
    console.log(currentData);

    const cityName = document.getElementById("city_name");
    cityName.innerHTML = `<img src="../assets/location-pin-svgrepo-com.svg" class="h-12 w-12 mr-2">
                          <span class="text-white text-2xl font-semibold">
                              ${currentData.location.name}, ${currentData.location.country}
                          </span>`;

    const localDate = document.getElementById("current_date");
    localDate.innerText = formatDate(currentData.location.localtime);

    const currentConditionParent = document.getElementById("primary_current_data");

    const currentTemp = document.getElementById("current_tempc");
    const tempC = currentData.current.temp_c
    currentTemp.innerText = `${tempC} °C`;

    const currentCondition = document.getElementById("current_condition");
    currentCondition.innerText = currentData.current.condition.text;

    const currentWeatherDataText = document.getElementById("current_weather_data_text");
    const conditionCode = currentData.current.condition.code;

    let weatherIcon = document.getElementById("weather-icon");

    if (!weatherIcon) {
        weatherIcon = document.createElement("span");
        weatherIcon.id = "weather-icon";
        currentConditionParent.insertBefore(weatherIcon, currentWeatherDataText);
    }
    weatherIcon.innerHTML = `<img src="${getWeatherSVGPath(conditionCode)}" class="h-40 w-40" />`;

    const personalizedMessageContainer = document.getElementById("personalized_message_container");
    personalizedMessageContainer.innerText = getPersonalizedWeatherMessage(conditionCode, tempC);

    const forecastHourly = forecastData.forecast.forecastday[0];
    const hourlyContainer = document.getElementById("hourly_container");
    hourlyContainer.innerHTML = '';

    forecastHourly.hour.forEach((hourlyData) => {
        const time = get12HourTime(hourlyData.time);
        const tempC = hourlyData.temp_c;
        const conditionCode = hourlyData.condition.code;

        const hourItem = document.createElement("div");
        hourItem.classList.add("flex", "flex-col", "items-center", "bg-white", "rounded-lg", "px-4", "p-2", "shadow-md", "min-w-[20%]", "min-h-[8]");
        
        const hourConditionSVG = getWeatherSVGPath(conditionCode);
        hourItem.innerHTML = `
            <div>${time}</div>
            <img src="${hourConditionSVG}" class="h-20 w-20" />
            <div>${tempC} °C</div>
        `;

        hourlyContainer.appendChild(hourItem);
    });


    const humidityWindspeed = document.getElementById("humidity_windspeed");
    humidityWindspeed.innerHTML = `<div class="flex">
                    <img src="../assets/humidity-svgrepo-com.svg" class="h-14 w-14 mr-2">
                    <div class="text-white">
                        <div>Humidity(in %)</div>
                        <div>${currentData.current.humidity}</div>
                    </div>
                </div>
                <div class="flex">
                    <img src="../assets/wind-svgrepo-com.svg" class="h-14 w-14 mr-2">
                    <div class="text-white">
                        <div>Wind Speed(in km/hr)</div>
                        <div>${currentData.current.wind_kph}</div>
                    </div>
                </div>`;  
    
    updateAQIDisplay(currentData.current.air_quality);

    const forecastContainer = document.getElementById("forecast_container");
    forecastContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const forecastDay = forecastData.forecast.forecastday[i];
        const date = formatDate(forecastDay.date);
        const dayCondition = forecastDay.day.condition;
        const TempC = forecastDay.day.avgtemp_c;

        // Create a tile for each day's forecast
        const dayTile = document.createElement("div");
        dayTile.classList.add("flex", "flex-col", "items-center", "bg-white", "rounded-lg", "shadow-md", "p-2", "m-2", "w-full");

        // Add content to the tile
        dayTile.innerHTML = `
            <div class="text-lg font-semibold text-center">${date}</div>
            <img src="${getWeatherSVGPath(dayCondition.code)}" class="h-14 w-14 mx-auto" alt="${dayCondition.text} image" />
            <div class="text-lg mt-2">${dayCondition.text}</div>
            <div class="text-lg">${TempC} °C</div>
        `;

        forecastContainer.appendChild(dayTile);
    }
}

// HELPER FUNCTIONS

// Function to format date into usable format
function formatDate(input) {
    const date = new Date(input);

    const day = date.getDate();
    const suffix = getDaySuffix(day);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();

    return `${day}${suffix} ${month}, ${year}`;
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return "th"; // Covers 11th to 20th, REMEMBER THIS
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

// Function that helps in displaying the correct image as per the weather condition
const weatherSVGPaths = {
    clear: '../assets/weather/clear.svg',
    clouds: '../assets/weather/clouds.svg',
    drizzle: '../assets/weather/drizzle.svg',
    rain: '../assets/weather/rain.svg',
    thunderstorm: '../assets/weather/thunderstorm.svg',
    snow: '../assets/weather/snow.svg',
    atmosphere: '../assets/weather/atmosphere.svg'
};

function getWeatherSVGPath(conditionCode) {
    // Clear
    if ([1000].includes(conditionCode)) {
        return weatherSVGPaths.clear;
    }

    // Clouds
    else if ([1003, 1006, 1009].includes(conditionCode)) {
        return weatherSVGPaths.clouds;
    }

    // Drizzle
    else if ([1063, 1150, 1153, 1168, 1171, 1180].includes(conditionCode)) {
        return weatherSVGPaths.drizzle;
    }

    // Rain
    else if ([1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1273].includes(conditionCode)) {
        return weatherSVGPaths.rain;
    }

    // Thunderstorm
    else if ([1087, 1273, 1276].includes(conditionCode)) {
        return weatherSVGPaths.thunderstorm;
    }

    // Snow
    else if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(conditionCode)) {
        return weatherSVGPaths.snow;
    }

    // Atmosphere (mist, fog, etc.)
    else if ([1030, 1135, 1147].includes(conditionCode)) {
        return weatherSVGPaths.atmosphere;
    }

    // Default path for unmapped codes
    return '../assets/weather/error-cloud.svg';
}

// Convert 24-hour time to 12-hour time
function get12HourTime(time) {
    let hour = parseInt(time.substring(11, 13));
    let period = hour >= 12 ? 'pm' : 'am';

    hour = hour % 12 || 12; // Handles cases for hour=0 or 12, REMEMBER THIS

    return `${hour}${period}`;
}

//function that gives a personalized message based on weather condition and temperature
function getPersonalizedWeatherMessage(conditionCode, tempC) {
    const hotThreshold = 30;
    const warmThreshold = 20;
    const coolThreshold = 10;

    let message = "";

    if (conditionCode === 1000) {
        // Clear
        if (tempC > hotThreshold) message = "It's a beautiful sunny day! ☀️ Don't forget to drink plenty of water and wear your sunglasses. 🕶️";
        else if (tempC > warmThreshold) message = "Perfect weather for a picnic! 🧺 Grab your favorite snacks and enjoy the outdoors! 🍉";
        else if (tempC > coolThreshold) message = "A clear evening is perfect for a stroll! 🚶‍♂️ Bring a light jacket just in case it gets chilly. 🧥";
        else message = "Enjoy the sunshine while it lasts! 🌞 Dress warmly if you plan to be outside for a while! ❄️";
    } else if ([1003, 1006, 1009].includes(conditionCode)) {
        // Partly Cloudy
        if (tempC > hotThreshold) message = "Warm and partly cloudy! ☁️ Great day for outdoor activities. Just remember to stay hydrated! 💧";
        else if (tempC > warmThreshold) message = "The sun is peeking through! 🌤️ A perfect day for a light jacket if you're heading out. 🧥";
        else if (tempC > coolThreshold) message = "A mix of sun and clouds; it’s a good idea to keep a sweater handy! 🧣";
        else message = "Mildly chilly, but the sun will break through! 🌥️ Don't forget to bundle up for the breeze. 🍂";
    } else if ([1001, 1030, 1135, 1147].includes(conditionCode)) {
        // Cloudy
        if (tempC > hotThreshold) message = "It’s a bit gloomy but still warm; a great day for a movie marathon indoors! 🎥🍿";
        else if (tempC > warmThreshold) message = "Cloudy but comfortable; perfect for a cozy day with a book and your favorite drink! 📖☕";
        else if (tempC > coolThreshold) message = "Overcast skies today; take an umbrella just in case the drizzle hits! ☔";
        else message = "Cool and cloudy; stay warm, maybe enjoy some soup while watching the weather change! 🍲";
    } else if ([1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
        // Drizzle/Rain
        if (tempC > hotThreshold) message = "A warm drizzle is refreshing! 🌦️ Don’t forget your raincoat and enjoy the unique weather! ☔";
        else if (tempC > warmThreshold) message = "Light rain outside; grab your umbrella and take a moment to enjoy the soothing sound of raindrops. 🎶";
        else if (tempC > coolThreshold) message = "Drizzling today; perfect for snuggling up with a warm drink at home. ☕️ Stay cozy! 🛋️";
        else message = "It's raining and chilly; stay dry and keep warm with a blanket and a good movie! 🎬";
    } else if ([1087, 1273, 1276].includes(conditionCode)) {
        // Thunderstorm
        if (tempC > hotThreshold) message = "A thunderstorm is brewing! ⚡ Stay indoors and enjoy the show from the comfort of your home. 🏡";
        else if (tempC > warmThreshold) message = "Stormy weather ahead; find a cozy spot and relax with your favorite activities indoors! 📚";
        else if (tempC > coolThreshold) message = "Thunderstorms are expected; it’s a great time for a movie marathon or reading a good book! 🍿📖";
        else message = "Stay warm and safe during the storm! 🔥 Maybe light a candle and enjoy a peaceful evening. 🕯️";
    } else if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(conditionCode)) {
        // Snow
        if (tempC > hotThreshold) message = "Unusual warm snow! ❄️ Enjoy the winter wonderland but stay hydrated in the unusual heat! 💦";
        else if (tempC > warmThreshold) message = "Light snowflakes are falling; perfect for hot chocolate indoors! ☕ Enjoy the view from your window! 🌨️";
        else if (tempC > coolThreshold) message = "Snowy and chilly; bundle up for some fun outside! ⛄ Don't forget your gloves and scarf! 🧤🧣";
        else message = "A winter wonderland! 🌨️ Perfect for building snowmen or cozying up by the fire with a warm drink! 🔥";
    } else if ([1135, 1147].includes(conditionCode)) {
        // Fog
        if (tempC > hotThreshold) message = "A warm fog surrounds us; drive safely and enjoy the mysterious atmosphere! 🌫️🚗";
        else if (tempC > warmThreshold) message = "Misty mornings can be beautiful; take your time outdoors and enjoy the serene vibes! 🌄";
        else if (tempC > coolThreshold) message = "Foggy and cool; great day to stay in with a cup of tea and a good book! 🍵📚";
        else message = "Cold and foggy; visibility is low, so be careful. ⚠️ It's a perfect time for a cozy day inside! 🛋️";
    }
    
    return message;
}

//function to calculate AQI from the air quality data
function calculateAQI(data) {
    const pollutants = [
      { name: 'co', breakpoints: [0, 9, 12, 15.5, 34, 54, 85, 126, 200] },
      { name: 'no2', breakpoints: [0, 3, 6, 9, 12, 15, 18, 21, 36] },
      { name: 'o3', breakpoints: [0, 53, 70, 101, 126, 157, 188, 236, 375] },
      { name: 'so2', breakpoints: [0, 35, 75, 115, 155, 185, 215, 265, 425] },
      { name: 'pm2_5', breakpoints: [0, 12.1, 35.5, 55.4, 154.9, 254.1, 350.5, 446.9, 604.3] },
      { name: 'pm10', breakpoints: [0, 54.9, 125.5, 154.9, 234.1, 354.5, 424.9, 504.3, 604.3] }
    ];
  
    let maxAQI = 0;
  
    for (const pollutant of pollutants) {
      const concentration = data[pollutant.name];
      let aqi = 0;
  
      for (let i = 0; i < pollutant.breakpoints.length; i++) {
        if (concentration <= pollutant.breakpoints[i]) {
          aqi = Math.round(i * 50);
          break;
        }
      }
  
      maxAQI = Math.max(maxAQI, aqi);
    }
  
    return maxAQI;
  }


//function to update and display AQI
function updateAQIDisplay(data) {
    const aqi = calculateAQI(data);

    let status = '';
    let color = '';
    let emoji = '';
    let message = ''; 
    let aqiBarHeightClass = '';

    if (aqi <= 50) {
        status = 'Good';
        color = 'bg-green-500';
        emoji = '🌱';
        message = 'Enjoy the fresh air!';
        aqiBarHeightClass = 'h-1/6'; // Assign 1/6th of the height
    } else if (aqi <= 100) {
        status = 'Moderate';
        color = 'bg-yellow-500';
        emoji = '🙂';
        message = 'Air quality is acceptable.';
        aqiBarHeightClass = 'h-1/4'; // Assign 1/4th of the height
    } else if (aqi <= 150) {
        status = 'Unhealthy for Sensitive';
        color = 'bg-orange-500';
        emoji = '😷';
        message = 'Sensitive groups should limit outdoor activities.';
        aqiBarHeightClass = 'h-1/3'; // Assign 1/3rd of the height
    } else if (aqi <= 200) {
        status = 'Unhealthy';
        color = 'bg-red-500';
        emoji = '😨';
        message = 'Everyone should reduce prolonged outdoor exertion.';
        aqiBarHeightClass = 'h-1/2'; // Assign half of the height
    } else if (aqi <= 300) {
        status = 'Very Unhealthy';
        color = 'bg-purple-500';
        emoji = '😵';
        message = 'Health alert: Avoid outdoor activities!';
        aqiBarHeightClass = 'h-2/3'; // Assign 2/3rd of the height
    } else {
        status = 'Hazardous';
        color = 'bg-black';
        emoji = '⚠️';
        message = 'Emergency conditions: Stay indoors!';
        aqiBarHeightClass = 'h-full'; // Assign full height
    }

    // Dynamically updating the entire AQI container
    const aqiContainer = document.getElementById("aqi_container");
    aqiContainer.innerHTML = `
      <div class="container mx-auto p-4 text-white">
        <div class="flex justify-center items-center">
          <!-- AQI Value and Message on the Left -->
          <div class="flex flex-col items-center ml-4 text-sm">
            <h2 class="text-2xl font-bold mb-2">Air Quality Index</h2> <!-- Increased font size -->
            <span id="aqi-value" class="text-xl font-bold">${aqi}</span> <!-- Increased font size -->
            <span id="aqi-message" class="block text-lg">${status}: ${message} ${emoji}</span> <!-- Increased font size -->
          </div>

          <!-- Vertical AQI Bar -->
          <div class="flex flex-col items-center mx-4">
            <div class="relative w-8 h-64 bg-gray-200 rounded-lg overflow-hidden">
              <!-- AQI bar fill -->
              <div id="aqi-bar" class="absolute bottom-0 w-full ${color} ${aqiBarHeightClass}"></div>
            </div>
          </div>
          
          <!-- AQI Conditions on the Right -->
          <div class="flex flex-col justify-between h-64 mr-4 text-right text-sm space-y-0.5">
            <span>Hazardous</span>
            <span>Very Unhealthy</span>
            <span>Unhealthy</span>
            <span>Unhealthy for Sensitive</span>
            <span>Moderate</span>
            <span>Good</span>
          </div>
        </div>
      </div>
    `;
}



