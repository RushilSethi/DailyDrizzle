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



async function fetchWeather(city){
    try{
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=e411b3ac9894468fa69120046241010&q=${city}&aqi=yes`);
        if(!response.ok){
            throw new Error("Weather Data Not Found");
        }
        const data = await response.json();
        console.log(data);
        // displayWeather(data);
    }catch(error){
        console.error(error);
        alert(error.message || 'Error fetching weather data. Please try again.');
    }
}

function validateInput(locationVal){
    const trimmedInput = locationVal.trim();
    if(trimmedInput === ''){
        alert("please enter a valid location");
        return false;
    }
    return true;
}

