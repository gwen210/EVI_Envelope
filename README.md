# EVI_Envelope

1) Google Earth Engine (GEE) code to generate PDSI and Weather Data summarized biweekly- currently set to 2019 but dates based on what year you want to be predicted
This is set to run for the San Francisco Bay Area tidal wetlands. To change the study area, update the “flux” variable to the desired study area. 
The output files are saved as multiband_weather_Biweek_all_2019.tif
The year is automatically appended depending on the year specified  
https://code.earthengine.google.com/dd287aa68b15dbfd7e9d8eab231d90de

Important Outputs – Multiband_weather_biweek_2019 and Multiband_PDSI_Biweek_2019

2) GEE code to generate EVI history 2013-2018 – this is the date range used to build the model. EVI history is based on Landsat 8 data 
This is set to run for the bay area tidal wetlands. To change the study area, update the “flux” variable to the desired study area. 
https://code.earthengine.google.com/571beaa40f5611b0680af94c8139d511
Needed output multiband_evi_biweekly_history

3) “Predict_m24_every2week_2019_210722.R”     R code to predict desired year biweekly EVI, which is the same year as the PDSI and Weather dataset, in this case 2019


4) “mod.pres24_Biweek_ls.rds” fitted model coefficient values. 

5) “elevmhhw_30m_pj.tif” elevation above mean higher high water in meters for the San Francisco Bay Area. Data from Point Blue

6) “multiband_evi_biweekly_history_L8_2013_2018.tif” Evi history datafile (2013-2018 summary) 
    This is the output from GEE code listed in 2 

7) “multiband_PDSI_Biweek_2019.tif” and “multiband_weather_tmin_Biweek_2019” PDSI and Weather Outputs from GEE code listed in 1

Other notes
The study area is set in GEE as the “flux” variable and can be changed by uploading/drawing a different polygon. 
The GEE code outputs everything in a raster format. The final EVI values are predicted on a pixel by pixel basis set to a Landsat pixel (30 meters). 

Reference
