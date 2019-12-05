$(document).ready(function(){
    const API_Key = "146083ba4b9b0c9c46a21818015c3741";
    if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition(function(position) {
        let userLat = position.coords.latitude;
        let userLon = position.coords.longitude;
        todayForecastLatLon(userLat, userLon);
        });
        
      } else {
        /* geolocation IS NOT available */
        todayForecast("Orlando");
      }


// Start with my AJAX functions
function todayForecastLatLon(lat, lon){
    let queryURL = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_Key}`;
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).done(function(data){
        let city = data.name;
        // create history link for this search
        if (history.indexOf(city) === -1) {
            history.push(city);
            window.localStorage.setItem("history", JSON.stringify(history));
            makeRow(city);
        }
        todayForecastCard(data);
    }).fail(function(){
        alert("That's not a valid location")
        console.error('failed to get the weather');
    });
    fiveDayForecastLatLon(lat, lon)

}

function todayForecast(city){
    let queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_Key}`;
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).done(function(data){
        // create history link for this search
        if (history.indexOf(city) === -1) {
            history.push(city);
            window.localStorage.setItem("history", JSON.stringify(history));
            makeRow(city);
        }
        todayForecastCard(data);
    }).fail(function(){
        alert("That's not a valid city")
        console.error('failed to get the weather');
    });
    fiveDayForecast(city);
}

function fiveDayForecastLatLon(lat, lon){
    let queryURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_Key}`;
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).done(function(data){
        fiveDayCard(data);
    }).fail(function(){
        console.error('failed to get 5 day forecast');
    });
}

function fiveDayForecast(city){
    // alert("Ran 5 day!");
    let queryURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_Key}`;
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).done(function(data){
        fiveDayCard(data);
    }).fail(function(){
        console.error('failed to get 5 day forecast');
    });
}

// This will create Todays forecast card for the front end with data from the ajax call
function todayForecastCard(data){
    // For the ajax call by city, have to define the lat, lon to be able to run the ultraviolet function.
    var lat = data.coord.lat;
    var lon = data.coord.lon;
    // The div where everything goes
    var todayCard = $("#today");
    todayCard.empty();
    // The text that will be displayed in the card
    var tempText = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
    var humText = $("<p>").addClass("card-text").text("Humitity: " + data.wind.speed + "%");
    var windText = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
    var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png").attr('id', 'weatherimg');
    // Setting up the card > card-body > card-title Bootstrap structure
    var cardBeginning = $('<div>').addClass("card");
    var cardBody = $('<div>').addClass("card-body");
    var cityTitle = $("<h3>").addClass("card-title").text(data.name + " " + new Date().toLocaleDateString());
    cityTitle.append(img);
    // Appending all this to the card body
    cardBody.append(cityTitle, tempText, humText, windText);
    // Calls the ultraviolet function which adds to the card body the UV info
    ultraviolet(lat, lon);

    // Adding cardbody to the card div
    cardBeginning.append(cardBody);
    // Adding the card to the today div
    todayCard.append(cardBeginning);
}
// This will create the cards for the 5 day forecast with data from the ajax call
function fiveDayCard(data){
    var forecast = $("#forecast");
    // Starts the html for the 5 day forecast and adds a row for the content        
    forecast.html("<h4 class='mt-3'>5-Day Forecast:</h4>");
    var row = $('<div class="row">');

    for (var i=0; i<data.list.length; i++){

        var loopdata = data.list[i];
        // Creating a col and card for each days forecast
        var column = $('<div>').addClass("col-md-2");
        var cardBeginning = $('<div>').addClass("card bg-primary");
        var cardBody = $('<div>').addClass("card-body text-white");

        // If the time is 6pm, then display that information
        if (loopdata.dt_txt.indexOf('18:00:00') !== -1 ){
            // Each card will have a title and an icon with the date and weather
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var img = $("<img>").attr("src", `http://openweathermap.org/img/w/${loopdata.weather[0].icon}.png`);
            // Adding the text for temp & humitiy
            var tempeText =  $("<p>").addClass("card-text").text("Temp: " + loopdata.main.temp + " °F");
            var humidText = $("<p>").addClass("card-text").text("Humitity: " + loopdata.main.humidity + "%");
            // appending the information in order, text, title image goes to card body, the body gets appended to the card div, etc.
            // so that on the front end it ends up being row > col > card > card-body > card-title > card-text
            cardBody.append(title, img, tempeText, humidText)
            cardBeginning.append(cardBody);
            column.append(cardBeginning)
            row.append(column);
        }
    }
    // now appending the row to the forecast id div
    forecast.append(row);
}

// The UV information is it's own ajax call and only is available by lat, lon, so I have the ajax call and addition to the card in one function, which 
// gets called in the creation of the card 
function ultraviolet(lat, lon){
    let queryURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_Key}`;
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "json"
    }).done(function(data){
        let result = data.value;
        var uvText = $("<p>").addClass("card-text").text("UV index:  ");
        let btn = $('<span>').addClass("text-white uv").text(result);
        // change background color depending on uv value
        if (data.value < 3) {
            btn.addClass("bg-success");
        }
        else if (data.value < 7) {
            btn.addClass("bg-warning");
        }
        else {
            btn.addClass("bg-danger");
        }
        $("#today .card-body").append(uvText.append(btn));

    });
}

// This button click lets a user enter in a city and search based on city
$('#searchBtn').on('click', function(){
    var city = $('#searchVal').val();
    todayForecast(city);
});
// Clicking on the history items will get the weather for that city
$(".history").on("click", "li", function() {
    todayForecast($(this).text());
  });
// creates a list item for the text passed into it (an array)
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    todayForecast(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }

});