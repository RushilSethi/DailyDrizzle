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
    cityName.innerText = `${currentData.location.name}, ${currentData.location.country}`;

    const localDate = document.getElementById("current_date");
    localDate.innerText = formatDate(currentData.location.localtime);


    
}


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
    if (day > 3 && day < 21) return "th"; // Covers 11th to 20th
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}
