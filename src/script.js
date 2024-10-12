const locationInput = document.getElementById("location_input");
const locationSearch = document.getElementById("location_search");
const currentLocationBtn = document.getElementById("current_location_btn");

const apiKey = "e411b3ac9894468fa69120046241010";

locationSearch.addEventListener("click",function(){
    const locationVal = locationInput.value;
    if(validateInput(locationVal)){
        fetchWeather(locationVal.trim());
    }
});

function fetchWeather(city){
    const currentData = fetch(`http://api.weatherapi.com/v1/current.json?key=e411b3ac9894468fa69120046241010&q=${city}&aqi=yes`).then(response => response.json());
    const forecastData = fetch(`http://api.weatherapi.com/v1/forecast.json?key=e411b3ac9894468fa69120046241010&q=${city}&days=3&aqi=yes`).then(response => response.json());

    Promise.all([currentData, forecastData])
        .then(([currentData, forecastData])=>{
            displayWeather(city, currentData, forecastData);
        }).catch(error => {
            console.error('Error fetching weather data:', error);
            //implement function showError(); that displays error in a good ui under the search bar 
        });
}

function validateInput(locationVal){
    const trimmedInput = locationVal.trim();
    if(trimmedInput === ''){
        alert("please enter a valid location");
        return false;
    }
    return true;
}

function displayWeather(city, currentData, forecastData){
    console.log(currentData);


    const cityName = document.getElementById("city_name");
    cityName.innerHTML = `<img src="../assets/location-pin-svgrepo-com.svg" class="h-12 w-12 mr-2">
                          <span class="text-white text-2xl font-semibold">
                              ${currentData.location.name}, ${currentData.location.country}
                          </span>`

    const localDate = document.getElementById("current_date");
    localDate.innerText = formatDate(currentData.location.localtime);

    const currentConditionParent = document.getElementById("primary_current_data");

    const currentTemp = document.getElementById("current_tempc");
    currentTemp.innerText = `${currentData.current.temp_c} °C`;

    const currentCondition = document.getElementById("current_condition");
    currentCondition.innerText = currentData.current.condition.text;

    const currentWeatherDataText = document.getElementById("current_weather_data_text")
    const conditionCode = currentData.current.condition.code; 

    let weatherIcon = document.getElementById("weather-icon");

    if (!weatherIcon) {
        weatherIcon = document.createElement("span");
        weatherIcon.id = "weather-icon";
        currentConditionParent.insertBefore(weatherIcon, currentWeatherDataText);
    }
    weatherIcon.innerHTML = getWeatherSVG(conditionCode);

    console.log(forecastData.forecast)

    const forecastHourly = forecastData.forecast.forecastday[0];
    const hourlyContainer = document.getElementById("hourly_container")
    forecastHourly.hour.forEach((hourlyData)=>{
        const time = get12HourTime(hourlyData.time);
        const tempC = hourlyData.temp_c;
        const conditionCode = hourlyData.condition.code;

        const hourItem = document.createElement("div");
        hourItem.classList.add("flex","flex-col","items-center","bg-white","rounded-lg","p-2","shadow-md","min-w-[20%]","min-h-[8]");
        const hourCondition = getWeatherSVG(conditionCode);
        hourItem.innerHTML = `<div>${time}</div>
                              <div>${hourCondition}</div>
                              <div>${tempC}</div>`

        hourlyContainer.appendChild(hourItem);
    });
    
}

//HELPER FUNCTIONS

//Function to format date into usable format
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


//function that helps in displaying the correct image as per the weather condition
const weatherSVGs = {
    clear: '<img src="../assets/weather/clear.svg" class="h-40 w-40"/>',
    clouds: '<img src="../assets/weather/clouds.svg" class="h-40 w-40"/>',
    drizzle: '<img src="../assets/weather/drizzle.svg" class="h-40 w-40"/>',
    rain: '<img src="../assets/weather/rain.svg" class="h-40 w-40"/>',
    thunderstorm: '<img src="../assets/weather/thunderstorm.svg" class="h-40 w-40"/>',
    snow: '<img src="../assets/weather/snow.svg" class="h-40 w-40"/>',
    atmosphere: '<img src="../assets/weather/atmosphere.svg" class="h-40 w-40"/>'
};

function getWeatherSVG(conditionCode) {
    // Clear
    if ([1000].includes(conditionCode)) {
        return weatherSVGs.clear;
    }

    // Clouds
    else if ([1003, 1006, 1009].includes(conditionCode)) {
        return weatherSVGs.clouds;
    }

    // Drizzle
    else if ([1063, 1150, 1153, 1168, 1171, 1180].includes(conditionCode)) {
        return weatherSVGs.drizzle;
    }

    // Rain
    else if ([1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1273].includes(conditionCode)) {
        return weatherSVGs.rain;
    }

    // Thunderstorm
    else if ([1087, 1273, 1276].includes(conditionCode)) {
        return weatherSVGs.thunderstorm;
    }

    // Snow
    else if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(conditionCode)) {
        return weatherSVGs.snow;
    }

    // Atmosphere(mist, fog, etc.)
    else if ([1030, 1135, 1147].includes(conditionCode)) {
        return weatherSVGs.atmosphere;
    }

    // Default SVG for unmapped codes
    return '<img src="../assets/weather/error-cloud.svg" class="h-36 w-36"></img>';
}

//convert 24hour time to 12 hour time
function get12HourTime(time) {
    let hour = parseInt(time.substring(11, 13));
    let period = hour >= 12 ? 'pm' : 'am';
    
    hour = hour % 12 || 12; //handles cases for hour=0 or 12, REMEMBER THIS
    
    return `${hour}${period}`;
}