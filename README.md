# EVI Envelope

1) Google Earth Engine (GEE) code to generate PDSI and Weather Data summarized biweekly- currently set to 2019 but dates can be changed based on what year you want to be predicted
This is set to run for the San Francisco Bay Area tidal wetlands. To change the study area, update the “flux” variable to the desired study area. This can be a feature asset within GEE or a polygon drawn within GEE. 
The output files are saved as multiband_weather_Biweek_all_2019.tif and Multiband_PDSI_Biweek_2019.tif
The year is automatically appended depending on the year specified  

    Click [here](https://code.earthengine.google.com/dd287aa68b15dbfd7e9d8eab231d90de) to open the GEE code;
    
    Needed GEE output for modeling EVI within R: Multiband_weather_biweek_2019 and Multiband_PDSI_Biweek_2019

2) GEE code to generate EVI history 2013-2018 – this is the date range used to build the model. EVI history is based on Landsat 8 data 
This is set to run for the bay area tidal wetlands. To change the study area, update the “flux” variable to the desired study area. 

    Click [here](https://code.earthengine.google.com/571beaa40f5611b0680af94c8139d511) to open the GEE code;
    
    Needed GEE output for modeling EVI within R: multiband_evi_biweekly_history

3) “Predict_m24_every2week_2019_210722.R”     R code to model fortnight EVI for a given year, which is the same year as the PDSI and Weather dataset, in this case 2019

4) “mod.pres24_Biweek_ls.rds” fitted model coefficient values. Needed for R code

5) “elevmhhw_30m_pj.tif” elevation above mean higher high water in meters for the San Francisco Bay Area. Data from Point Blue doi:10.1371/journal.pone.0027388


Other notes
The study area is set in GEE as the “flux” variable and can be changed by uploading/drawing a different polygon. 
The GEE code outputs everything in a raster format. The final EVI values are predicted on a pixel by pixel basis set to a Landsat pixel (30 meters). 

## Reference:

Miller G.J. , Dronova I., Oikawa P.Y., Knox S.H., Windham-Myers L., Shahan J., Stuart-Haëntjens P., 2021 The potential of satellite remote sensing time series to uncover wetland phenology under unique challenges of tidal setting. under review
