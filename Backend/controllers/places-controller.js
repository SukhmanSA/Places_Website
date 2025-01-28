const { validationResult } = require("express-validator");
const fs = require("fs")
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");


// Get Place By Place Id Controller function


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Could not find the Place, Please try again.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("No place was found for the provided id.", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};


// Get Place By User Id Controller function


const getPlacesByUserId = async(req, res, next) => {
  const userId = req.params.uid;
  
  let userPlaces;
  try{
   userPlaces = await Place.find({creator: userId})
  }catch(err){
    return next(new HttpError("Could not find the Place, Please try again.", 500))
  }

  if (!userPlaces || userPlaces.length === 0) {
    return next(
      new HttpError("No place was found for the provided user.", 404)
    );
  }

  res.json({ places: userPlaces.map(place=> place.toObject({ getters:true })) });
};


// Create Place Controller function


const createPlace = async (req, res, next) => {
  const { title, description, address, creator } = req.body;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log("Validation errors:", error.array());
    return next(new HttpError("Invalid Inputs passed, please check your data", 422));
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    imFage: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
    if (!user) {
      return next(new HttpError("Could not find the user for the provided ID.", 404));
    }
  } catch (err) {
    console.error("User lookup failed:", err);
    return next(new HttpError("Creating a place failed, please try again later", 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace); 
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.error("Transaction failed:", err);
    return next(new HttpError("Creating place failed, Please try again", 500));
  }

  res.status(201).json({ place: createdPlace });
};



// Update Place Controller fumction


const updatePlaceById = async(req, res, next) => {
  const placeId = req.params.pid;

  let updatedPlace;

  try{
    updatedPlace = await Place.findById(placeId)
  }catch(err){
    return next(new HttpError("Could not update the Place, Please try again.", 500))
  }


  updatedPlace.title = req.body.title;
  updatedPlace.description = req.body.description;

  try{
    await updatedPlace.save()
  }catch(err){
    return next(new HttpError("Could not update the Place, Please try again.", 500))
  }

  if(updatedPlace.creator.toString() !== req.userData.userId){
    return next(new HttpError("You are not authorized to update this place.", 401))
  };

  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid Inputs passed, please check your data", 422)
    );
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters:true }) });
};


// Delete Place Controller function


const deletePlaceById = async(req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId).populate("creator")
  }catch(err){
    return next(new HttpError("Could not delete the place, Please try again.", 500))
  }

  if(!place){
    return next(new HttpError("Could not find place!",404))
  }

  const imagePath = place.image;

  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.deleteOne({ _id : placeId }, { session: sess })
    place.creator.places.pull(place)
    await place.creator.save({ session: sess })
    await sess.commitTransaction();
  }catch(err){
    return next(new HttpError("Could not delete the place, Please try again", 500))
  }

  if(place.creator.id.toString() !== req.userData.userId){
    return next(new HttpError("You are not authorized to update this place.", 401))
  };


  fs.unlink(imagePath,err=>{
    console.log(err)
  })

  res.status(200).json({message:'Deleted Place'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
