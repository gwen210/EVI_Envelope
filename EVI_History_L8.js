var imageVisParam = {"opacity":1,"bands":["evi"],"palette":["ffffff","ce7e45","df923d","f1b555","fcd163","99b718","74a901","66a000","529400","3e8601","207401","056201","004c00","023b01","012e01","011d01","011301"]};



//GEE code to summarize historical EVI data biweekly (14 days) using Landsat 8 only


// set start and end year
var startyear = 2013; 
var endyear = 2018; 

//Start date and end date
var Dstart_hist = '2013-01-01';
var Dend_hist   = '2018-12-31';

var Dstart = Dstart_hist;
var Dend   = Dend_hist;

//Set study area (flux) this can be changed based on the region a user wants to create EVI preditions for
var flux =  ee.FeatureCollection('users/GMiller/SFEI_dissolved3');


// make a date object
var startdate = ee.Date.fromYMD(startyear, 1, 1);
var enddate = ee.Date.fromYMD(endyear + 1, 1, 1);
print(startdate,"start");


//center map on bay area
Map.setCenter(-122.3242, 37.7878, 9);

//Function to mask pixels with clouds, cloud shadows, or water///////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

// A function to mask out cloudy pixels
var cloud_shadows = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 3,3, 'Cloud_shadows').eq(0);
  // Return an image masking out cloudy areas.
};
var clouds = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 5,5, 'Cloud').eq(0);
  // Return an image masking out cloudy areas.
};
var maskClouds = function(image) {
  var cs = cloud_shadows(image);
  var c = clouds(image);
  image = image.updateMask(cs);
  return image.updateMask(c);
};



//function to generate EVI for landsat 8
function EVI8(image) {
 var evi8 = image.expression(
     '2.5 * ((NIR/10000 - RED/10000) / (NIR/10000 + 6 * RED/10000 - 7.5 * BLUE/10000 + 1))', {
      'NIR': image.select('B5'),
      'RED': image.select('B4'),
      'BLUE': image.select('B2'),
      scale:30
}).rename('evi');
return image.addBands(evi8);
}


//function to change year so the biweekly summation will work - force all the years to be the same
function chngYear(image) {
  var date = ee.Date(image.get('system:time_start'));
  var startDate = date.update(startyear);
return image.set('system:time_start', startDate.millis());
}


//find the landsat 8 data apply the change year, cloud mask and evi function
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')//
                        .filterBounds(flux)
                        .filterDate(Dstart_hist, Dend_hist)
                        .map(maskClouds)   
                        .map(EVI8)
                        .map(chngYear)
                        ;
//select only evi data - remove all unneeded bands
l8 = l8.select('evi');


         
// make a list with years
var years = ee.List.sequence(startyear, endyear);
// make a list with months
var months = ee.List.sequence(1, 12);

var weeks = ee.List.sequence(1, 52/2);
var days = ee.List.sequence(0, 363, 7);
var daysEnd = ee.List.sequence(7, 365, 7);
var day = ee.List.sequence(0, 31);

 

// Make a EVI palette: a list of hex strings.
var palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
               '74A901', '66A000', '529400', '3E8601', '207401', '056201',
               '004C00', '023B01', '012E01', '011D01', '011301'];

//Add first landsat scene to map
Map.addLayer(l8.first(), {bands: ['evi'], min: 0, max: 0.3, palette: palette}, 'first LS');

 


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

    return collection.filterDate(startDate, endDate).mean()  //summarize by mean, can change to get the image count or summarize by median
        .set('system:time_start', startDate.millis())
        .set('system:time_end', endDate.millis());
  }));
};


print(l8, "l8");

//clip rasters to study area
var l8 =ee.ImageCollection(l8)
             .map(function(image){return image.clip(flux)});

//Run function to summarize in biweekly time step
var ls_hist = temporalCollection(l8, Dstart_hist, 52/2, 14, 'day');

// Get the timestamp and convert it to a date.
 
var date = ee.Date(l8.first().get('system:time_start'));
print('Timestamp: ', date); // ee.Date


//Creates one band for each landsat time step
var multiband_ls_hist = ls_hist.toBands();

// Export EVI BiWeekly Mean history, specifying scale and region.
Export.image.toDrive({
  image: multiband_ls_hist,
  description: 'multiband_evi_biweekly_history',
  scale: 30,
  region: flux
});
