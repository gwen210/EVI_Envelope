var imageVisParam = {"opacity":1,"bands":["evi"],"palette":["ffffff","ce7e45","df923d","f1b555","fcd163","99b718","74a901","66a000","529400","3e8601","207401","056201","004c00","023b01","012e01","011d01","011301"]},
    flux = ee.FeatureCollection("users/GMiller/SFEI_dissolved3");

//flux variable is the study area 
//the asset used here for the study are is SFEI_dissolved3 but it can be edited
//to a specific region of interest if needed
//https://code.earthengine.google.com/?asset=users/GMiller/SFEI_dissolved3 


//GEE code to summarize PDSI and weather data biweekly for prediction year
//The temperture and PDSI data can be exported as a multiband raster image and saved into google drive
//There is one band per 14 days (biweek) for a todal of 26 bands
//The code below finds the mean values for each biweek period on a pixel by pixel bases
//click run in the task tab to export the rasters

//Date for predicting EVI
// set start and end year
var startyear = 2019; 
var endyear = 2019; 

//Start date and end date
//change the year only 
var Dstart_hist = '2019-01-01';
var Dend_hist   = '2019-12-31';



//Center on Bay Area
//can change the zoom and centering if needed by editing the lat long (first two numbers)
//or zoom level (third numebr)
Map.setCenter(-122.3242, 37.7878, 9);


//////////////Code below doesnt need to be edited


//dates
var Dstart = Dstart_hist ;
var Dend   = Dend_hist ;


// make a date object
var startdate = ee.Date.fromYMD(startyear, 1, 1);
var enddate = ee.Date.fromYMD(endyear + 1, 1, 1);
print(startdate,"start");



//Weather data 
var weather = ee.ImageCollection('OREGONSTATE/PRISM/AN81d')
                  .filterBounds(flux)
                  .filter(ee.Filter.date(Dstart, Dend));
//PDSI data
var PDSI = ee.ImageCollection("GRIDMET/DROUGHT")
    .filter(ee.Filter.date(Dstart, Dend))
    .select('pdsi')
    .filterBounds(flux);



         
// make a list with years
var years = ee.List.sequence(startyear, endyear);
// make a list with months
var months = ee.List.sequence(1, 12);

var weeks = ee.List.sequence(1, 52/2);
var days = ee.List.sequence(0, 363, 7);
var daysEnd = ee.List.sequence(7, 365, 7);
var day = ee.List.sequence(0, 31);

 

//https://gis.stackexchange.com/questions/280381/google-earth-engine-how-to-calculate-regular-day-interval-means-in-image-collec/280558#280558

//Create function to summarize data biweekly
var temporalCollection = function(collection, start, count, interval, units) {
  // Create a sequence of numbers, one for each time interval.
  var sequence = ee.List.sequence(0, ee.Number(count).subtract(1));

  var originalStartDate = ee.Date(start);

  return ee.ImageCollection(sequence.map(function(i) {
    // Get the start date of the current sequence.
    var startDate = originalStartDate.advance(ee.Number(interval).multiply(i), units);

    // Get the end date of the current sequence.
    var endDate = originalStartDate.advance(
      ee.Number(interval).multiply(ee.Number(i).add(1)), units);

    return collection.filterDate(startDate, endDate).mean()
        .set('system:time_start', startDate.millis())
        .set('system:time_end', endDate.millis());
  }));
};




//Summmarize weather data
var weather_week = temporalCollection(weather.select('tmean'), Dstart, 52/2, 14, 'day');
var multiband_weather_week = weather_week.toBands();
print(multiband_weather_week, "weather biweekly means");

//Summarize PDSI data
var PDSI_week = temporalCollection(PDSI, Dstart, 52/2, 14, 'day');
var multiband_PDSI_week = PDSI_week.toBands();
print(multiband_PDSI_week, "PDSI biweekly means");

// Get the timestamp and convert it to a date.


// Export the image, specifying scale and region.
Export.image.toDrive({
  image: multiband_PDSI_week,
  description: 'multiband_PDSI_Biweek_all_' + startyear,
  scale: 30,
  region: flux
});


Export.image.toDrive({
  image: multiband_weather_week,
  description: 'multiband_weather_Biweek_all_' + startyear,
  scale: 30,
  region: flux
});
