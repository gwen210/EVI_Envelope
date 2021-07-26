
#Function to load and install libraries
loadandinstall <- function(mypkg) {if (!is.element(mypkg, installed.packages()[,1])){install.packages(mypkg)}; library(mypkg, character.only=TRUE)  }

#Load libraries and installs libraries if needed
loadandinstall("raster")
loadandinstall("rgdal")
loadandinstall("ggplot2")
loadandinstall("dplyr")
loadandinstall("lubridate")
loadandinstall("stringr")

#Set Working Directory - where most of the files are stored - user prompt
#The working directory folder needs to contain the PDSI, Temperature and Elevation Files


# Files need to have a specific naming convention
# The PDSI and Temperature files need to be named in a specific way
# for example the temperature file for 2016 needs to be named multiband_weather_Biweek_all_2016.tif
# while the PDSI file for 2016 needs to be named multiband_PDSI_Biweek_all_2016.tif
# or temperature for 2019 EVI predictions needs to be named multiband_weather_Biweek_all_2019.tif  
#the year within the file name is updated to the year being predicted
# The PDSI and Temperature files can be/were generated in google earth engine


# the elevation file needs to be elevation above mean high high water (meters)
#the file name is elevmhhw_30m_pj.tif

#The fitted model parameter file (.rds file) also needs to be in the folder
#the file name is mod.pres24_Biweek_ls.rds

# The EVI histories also have specific names, and the file used changes based on what year is being predicted
# For prediction year 2016 use "multiband_evi_biweekly_history_L7L8_2010_2015.tif"
# For prediction year 2017 use "multiband_evi_biweekly_history_L7L8_2011_2016.tif"
# For prediction year 2018 use "multiband_evi_biweekly_history_L7L8_2012_2017.tif"
# For prediction year 2019, 2020 and 2021 use "multiband_evi_biweekly_history_L8_2013_2018.tif"
# Only Landsat 8 was used for EVI history for 2019, 2020 or 2021 EVI predictions
# Landsat 7 and Landsat 8 are used for predicting EVI between 2016 - 2018 this is because 
# Landsat 8 was not available before 2013 and we are using 6 years of EVI history to get historical EVI biweekly means
# Within the file name it indicates the years used to create the EVI history. 
# For example multiband_evi_biweekly_history_L7L8_2010_2015.tif used landsat 7 and landsat 8 (L7L8) for years 2010 through 2015
# The EVI history files can be/were generated in google earth engine


wkdir =  readline(prompt = "Enter working directory full path : ")
setwd(wkdir)

#print directory
print(paste( "directory with input files: ", getwd()))



#Enter the year you're predicting - user prompt
varyear = readline(prompt = "Enter predicting year : ");

#Enter the folder to save all the output data in - user prompt
varfolder = readline(prompt = "Enter folder name to save output data in : ");

#create subfolder if it doesnt already exist
dir.create(file.path(wkdir, varfolder), showWarnings = FALSE)



## Code Below creates an upper, lower and mean predicted EVI raster and saves the 
## modeled EVI into the output folder specified above

#################################################
###Dont need to edit below code
###################################################


###EVI History 
#Automatically find the right EVI history to use based on the prediction year
# For prediction year 2016 use "multiband_evi_biweekly_history_L7L8_2010_2015.tif"
# For prediction year 2017 use "multiband_evi_biweekly_history_L7L8_2011_2016.tif"
# For prediction year 2018 use "multiband_evi_biweekly_history_L7L8_2012_2017.tif"
# For prediction year 2019, 2020 and 2021 use "multiband_evi_biweekly_history_L8_2013_2018.tif"
# Landsat 7 not used from 2019, 2020 or 2021 EVI predictions
 
if (varyear == 2016) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2010_2015.tif"
} else if (varyear == 2017) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2011_2016.tif"
} else if (varyear ==2018) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2012_2017.tif"
} else if (varyear == 2019) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else if (varyear == 2020) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else if (varyear == 2021) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else  print("Prediction Year out of range")


#Google earth engine output of  biweekly means historical 2013-2018 for study area (https://code.earthengine.google.com/571beaa40f5611b0680af94c8139d511)
week_mean = stack(EVIhistory)

#model coefficients 
mod.pres24 <- readRDS("mod.pres24_Biweek_ls.rds")

#elevation mhhw (meters) data from point blue 
ele_mhhw = raster("elevmhhw_30m_pj.tif")*100  #convert from meters to centimeters

#Load biweekly PDSI for prediction year for study area
PDSI_week_mean = stack(paste0("multiband_PDSI_Biweek_all_", varyear, ".tif"))

if (varyear == 2016) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2010_2015.tif"
} else if (varyear == 2017) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2011_2016.tif"
} else if (varyear ==2018) {
 EVIhistory = "multiband_evi_biweekly_history_L7L8_2012_2017.tif"
} else if (varyear == 2019) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else if (varyear == 2020) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else if (varyear == 2021) {
  EVIhistory = "multiband_evi_biweekly_history_L8_2013_2018.tif"
} else  print("Prediction Year out of range")





#Load biweekly weather for prediction year for study area
weather_week_mean = stack(paste0("multiband_weather_Biweek_all_", varyear, ".tif"))


#####################################################

#WriteRasterB helps write larger datasets
# Found tool at but can just write in the function manually devtools::install_github("hagc/rasterB")

writeRasterB<-function(x, filename, ...){
  if(class(x)=="RasterLayer"){
    out <- raster(x)
  }else{
    out <- brick(x, values=FALSE)
  }
  out <- writeStart(out, filename, ...)  # open wrinting session for the output raster
  bs  <- blockSize(out, n=nlayers(x))    # define blocks for writing
  for (i in 1:bs$n) {
    v <- getValuesBlock(x, row=bs$row[i], nrows=bs$nrows[i])
    out <- writeValues(out, v, bs$row[i])
  }
  out <- writeStop(out)
}
###
#resample so the elevation is the same spatial extent as landsat

assign(paste0("ele_mhhw", "_resample") ,resample( ele_mhhw,(weather_week_mean[[1]])))



#predictions

###################model 24
#Load model coefs this can also be hard coded. The model has changed slightly 
#so i've been loading in the saved model coefficients
#model coeffs


#View Model Coefficients conf interval
confint(mod.pres24)

DOY_a24 = summary(mod.pres24)$coefficients[2]
DOY_b24 = summary(mod.pres24)$coefficients[3]
pdsi_a24 =summary(mod.pres24)$coefficients[7]
temp_a24 = summary(mod.pres24)$coefficients[8]
eviweekmean_a24 =summary(mod.pres24)$coefficients[4]
int_24 =summary(mod.pres24)$coefficients[1]
ele_mhhw_a24 = summary(mod.pres24)$coefficients[5]
ele_mhhw_b24 = summary(mod.pres24)$coefficients[6]
 


#modeled results using Model 24 (includes elevation above mhhw )
#lower confidence interval
DOY_a24_2.5 =confint(mod.pres24)[2]
DOY_b24_2.5 = confint(mod.pres24)[3]
pdsi_a24_2.5 = confint(mod.pres24)[7]
temp_a24_2.5 = confint(mod.pres24)[8]
eviweekmean_a24_2.5 =confint(mod.pres24)[4]
int_24_2.5 = confint(mod.pres24)[1]
ele_mhhw_a24_2.5 = confint(mod.pres24)[5]
ele_mhhw_b24_2.5 = confint(mod.pres24)[6]



#upper confidence interval
DOY_a24_97.5 = confint(mod.pres24)[10]
DOY_b24_97.5 = confint(mod.pres24)[11]
pdsi_a24_97.5 = confint(mod.pres24)[15]
temp_a24_97.5 = confint(mod.pres24)[16]
eviweekmean_a24_97.5 = confint(mod.pres24)[12]
int_24_97.5 = confint(mod.pres24)[9]
ele_mhhw_a24_97.5 = confint(mod.pres24)[13]
ele_mhhw_b24_97.5 = confint(mod.pres24)[14]
 


###############Predict lower interval################

for (i in 1:nlayers(week_mean)){
assign( paste0("predictedEVI_m24_2.5wk_",i ) ,((i*14) * DOY_a24_2.5) + ((i*14)  *DOY_b24_2.5)^2  + 
  ( (get("ele_mhhw_resample")) *ele_mhhw_a24_2.5 ) + ( (get("ele_mhhw_resample")) * ele_mhhw_b24_2.5 )^2 + (  (PDSI_week_mean[[i]])  * pdsi_a24_2.5) +
  (  (weather_week_mean[[i]]) *temp_a24_2.5) + ( (week_mean[[i]] * eviweekmean_a24_2.5 )) +int_24_2.5)
}

#Stack the predictions
predicted_stacked_2.5 = stack()
for (i in 1:nlayers(week_mean)){
assign(paste0("predicted_stacked_2.5" ),
       addLayer(get(paste0("predicted_stacked_2.5" )),get(paste0("predictedEVI_m24_2.5wk_",i)) ))
}
writeRasterB(predicted_stacked_2.5, paste0("\\", varfolder, "\\predicted_stacked_m24_lower_biweek_",varyear,".tif" ), overwrite = T)

#remove stack
rm(predicted_stacked_2.5)

#remove all the lower predicted images to save space
rmList = list()
for (i in 1:nlayers(week_mean)){
  assign("rmList",(paste0("predictedEVI_m24_2.5wk_",i ))  )
  rm(list = rmList)
  rmList = list()
}

#Predict the upper layer
for (i in 1:nlayers(week_mean)){
assign( paste0("predictedEVI_m24_97.5wk",i ) ,((i*14) * DOY_a24_97.5) + ((i*14)  *DOY_b24_97.5)^2  + 
  ( (get("ele_mhhw_resample")) *ele_mhhw_a24_97.5 ) + ( (get("ele_mhhw_resample")) * ele_mhhw_b24_97.5 )^2 + (  (PDSI_week_mean[[i]])  * pdsi_a24_97.5) +
  (  (weather_week_mean[[i]]) *temp_a24_97.5) + ( (week_mean[[i]] * eviweekmean_a24_97.5 )) +int_24_97.5)
}


predicted_stacked_97.5 = stack()
#stack the differences
for (i in 1:nlayers(week_mean)){
assign(paste0("predicted_stacked_97.5" ),
       addLayer(get(paste0("predicted_stacked_97.5" )),get(paste0("predictedEVI_m24_97.5wk", i)) ))
}

#write the raster to file
writeRasterB(predicted_stacked_97.5,  paste0( varfolder, "\\predicted_stacked_m24_upper_biweek_",varyear,".tif" ), overwrite = T)

#remove upper rasters
rmList = list()
for (i in 1:nlayers(week_mean)){
  assign("rmList",(paste0("predictedEVI_m24_97.5wk",i ))  )
  rm(list = rmList)
  rmList = list()
}

rm(predicted_stacked_97.5)



#Predict mean EVI


for (i in 1:nlayers(week_mean)){
assign( paste0("predictedEVI_m24_wk",i ) ,((i*14) * DOY_a24) + ((i*14)  *DOY_b24)^2  + 
  ( (get("ele_mhhw_resample")) *ele_mhhw_a24 ) + ( (get("ele_mhhw_resample")) * ele_mhhw_b24)^2 + (  (PDSI_week_mean[[i]])  * pdsi_a24) +
  (  (weather_week_mean[[i]]) *temp_a24) + ( (week_mean[[i]] * eviweekmean_a24)) +int_24)
}


#Stack the predictions
predicted_stacked = stack()
for (i in 1:nlayers(week_mean)){
assign(paste0("predicted_stacked" ),
       addLayer(get(paste0("predicted_stacked" )),get(paste0("predictedEVI_m24_wk",i)) ))
}

#write the raster to file 
writeRasterB(predicted_stacked, paste0(varfolder, "\\predicted_stacked_m24_mean_biweek_",varyear,".tif" ), overwrite = T)

#remove mean rasters
rmList = list()
for (i in 1:nlayers(week_mean)){
  assign("rmList",(paste0("predictedEVI_m24_wk",i ))  )
  rm(list = rmList)
  rmList = list()
}

rm(predicted_stacked)




gc() #free up ram

#Save R environment if needed
#save.image("GEE_model_m24_2019_Biweekly.RData")
