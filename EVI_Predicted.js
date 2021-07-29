var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-122.03984421587678, 37.469103337527514],
          [-122.03984421587678, 37.4644708823979],
          [-122.03366440630647, 37.4644708823979],
          [-122.03366440630647, 37.469103337527514]]], null, false);
          

//Predicted EVI raster image
//The below code uses the polygon called "geometry" to find the average predicted mean EVI values
// within the region for a given 14 day time period
// The EVI values are plotted in the console for easy visualization
// The EVI values can also be exported to a csv file (in the tasks tab)
//The user also has the option to click anywhere in the study area to get the 
//EVI time series at that point



/// choose what EVI prediction year to pull data from. 
// To do this remove the // from the beginning of the script
// and add // to all the other lines that start with var Timage
// for example EVI_mean_2019 contains biweekly EVI predictions for all the Bay Area Tidal Wetlands

//var Timage = ee.Image("users/GMiller/EVI_mean_2021");
//var Timage = ee.Image("users/GMiller/EVI_mean_2020");
var Timage = ee.Image("users/GMiller/EVI_mean_2019");
//var Timage = ee.Image("users/GMiller/EVI_mean_2018");
//var Timage = ee.Image("users/GMiller/EVI_mean_2017");
//var Timage = ee.Image("users/GMiller/EVI_mean_2016");

//Prediction Year
//Update the prediction year to match the data selected above
var year = 2019 ;


//Set the first day of the year for EVI prediction (first day of the year)
//Make sure the data is january 1st of the prediction year
// Timage, year, and Dstart_hist all need to be the same year
var Dstart_hist = '2019-01-01';

//set center of region of interest (geometry) and zoom level
//geometry is a polygon that can be changed to the desired area
//the polygon can be deleted and created somewhere else or the vertices can be adjusted
Map.centerObject(geometry, 11);


////////////note
// For predicted EVI year 2016,  EVI history includes landsat 7 & 8 for years 2010-2015 
// For predicted EVI year 2017,  EVI history includes landsat 7 & 8 for years 2011-2016 
// For predicted EVI year 2018,  EVI history includes landsat 7 & 8 for years 2012-2017 
// For predicted EVI year 2019, 2020 and 2021 EVI history includes landsat 8 only for years 2013-2018


//////////////////////////////////////////////////////////////////////
///////////////////Dont need to adjust code below/////////////////////
//////////////////////////////////////////////////////////////////////


//get the year

var myImageWithProperties = Timage.set({
  year: year
});

Timage = ee.Image(myImageWithProperties) ;



//converts a multiband raster image to an image collection
//each band is converted to be a single image
//Create function to add DOY and Date to biweek data and to make an image from each band
var AddDOY = function( collection, start, count, interval, units) {
  // Create a sequence of numbers, one for each time interval.
  var sequence = ee.List.sequence(0, ee.Number(count).subtract(1));
//add 7 days so DOY starts at Jan 8th (which is what we used as the middle)
//this is becuase data is predicted biweekly
  var bands =  Timage.bandNames()
  var dayCounter = ee.List.sequence(1, bands.size())

  var newCollection = dayCounter.map(function(b){
    var originalStartDate = ee.Date(start).advance(-7, "day");  //Makes the first day the 8th of the month
    var startDate = originalStartDate.advance(ee.Number(interval).multiply(b), units);
    var img = ee.Image(collection.select(ee.String(bands.get(ee.Number(b).subtract(1)))))
    var dateTest =  ee.Date(startDate).getRelative('day', 'year');
  return(img.rename('evi').set('year', year).set('doy', dateTest).set('system:time_start', startDate.millis()).set("Date", startDate.format(null,'GMT')))
  })
  return newCollection
}
    
 


//Add  EVI date data biweekly
var EVI  = ee.ImageCollection(AddDOY(  Timage , Dstart_hist, 52/2, 2, 'week'));  
print(EVI , "EVI biweekly means");



// Make a EVI palette: a list of hex strings.
var palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
               '74A901', '66A000', '529400', '3E8601', '207401', '056201',
               '004C00', '023B01', '012E01', '011D01', '011301'];



//plot biweek 18
Map.addLayer(Timage.select(18), { min: -0.2, max: 0.9, palette: palette}, 'EVI Biweek 18');








// ----------------------------------------------------------------------------------------
// Create User Interface
// ----------------------------------------------------------------------------------------


// Create a panel to hold our widgets.
var panel = ui.Panel();
panel.style().set('width', '400px');

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'EVI Point Inspector',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
  ui.Label('Click a point on the map to inspect.')
]);
panel.add(intro);

// panels to hold lon/lat values
var lon = ui.Label();
var lat = ui.Label();
panel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Register a callback on the default map to be invoked when the map is clicked.
Map.onClick(function(coords) {
  // Update the lon/lat panel with values from the click event.
  lon.setValue('lon: ' + coords.lon.toFixed(2)),
  lat.setValue('lat: ' + coords.lat.toFixed(2));

  // Add a  cyan dot for the point clicked on.
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var dot = ui.Map.Layer(point, {color: '00FFFF'});
  Map.layers().set(4, dot);
 
 
  
  // Create an VI chart.
  var viChart = ui.Chart.image.series(EVI, point, ee.Reducer.mean(), 30);
  viChart.setOptions({
    title: 'VI',
    vAxis: {title: 'VI', maxValue: 1, minValue: -0.20},
    hAxis: {title: 'Date', format: 'MMM', gridlines: {count: 12}},
  });
  panel.widgets().set(3, viChart);
});

Map.style().set('cursor', 'crosshair');

// Add the panel to the ui.root.
ui.root.insert(0,panel);



// Plot a time series of EVI at a single location.
var EVIChart = ui.Chart.image.series(EVI, geometry)
    .setChartType('ScatterChart')
    .setOptions({
      title: 'Predicted EVI time series at ROI',
      lineWidth: 1,
      pointSize: 3,
    });
print(EVIChart);

////////////////

var filteredCollection = EVI.select('evi')

var timeSeries = ee.FeatureCollection(filteredCollection.map(function(image) {
  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  })
  // reduceRegion doesn't return any output if the image doesn't intersect
  // with the point or if the image is masked out due to cloud
  // If there was no ndvi value found, we set the ndvi to a NoData value -9999
  var evi = ee.List([stats.get('evi'), -9999])
    .reduce(ee.Reducer.firstNonNull())
 
  // Create a feature with null geometry and EVI value and date as properties
  var f = ee.Feature(null, {'evi': evi,
    'date': ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')})
  return f
}))
 

// Export to CSV
Export.table.toDrive({
    collection: timeSeries,
    description: 'Single_Location_EVI_time_series',
    fileNamePrefix: 'EVI_time_series_single',
    fileFormat: 'CSV'
})


