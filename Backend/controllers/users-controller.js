const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bycrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const Place = require("../models/place");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');


// getting all users

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "email name places image");
  } catch (err) {
    return next(
      new HttpError("Could not fetch users, please try again later"),
      500
    );
  }

  res.status(201).json(users.map((user) => user.toObject({ getters: true })));
};

// Signing Up

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser1;
  try {
    existingUser1 = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Could not Signup, please try again later", 500));
  }

  let existingUser2;
  try {
    existingUser2 = await User.findOne({ name: name });
  } catch (err) {
    return next(new HttpError("Could not Signup, please try again later", 500));
  }

  if (existingUser1) {
    return next(
      new HttpError(
        "An account with this email already exists, please login instead",
        422
      )
    );
  }

  if (existingUser2) {
    return next(
      new HttpError(
        "An account with this Username already exists, please login instead",
        422
      )
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bycrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user please try again", 500));
  }
  bycrypt.hash(password, 12);

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
    googleAuth: false
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Could not Signup, please try again later"), 500);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "super_secret_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not Signup, please try again later"), 500);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// Logging in

const login = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid Inputs passed, please check your data", 422)
    );
  }
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Could not Login, please try again later", 500));
  }

  if (!identifiedUser) {
    return next(new HttpError("Invalid credentials, login failed ", 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = bycrypt.compare(password, identifiedUser.password);
  } catch (err) {
    return next(new HttpError("Invalid credentials, login failed ", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials, login failed ", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      "super_secret_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not Log in, please try again later"), 500);
  }

  res.status(200).json({
      userId: identifiedUser.id,
      email: identifiedUser.email,
      token: token
    });
};

const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client("991101622384-m25j9ak9vqj09l73p3e1lr3ulk9be73q.apps.googleusercontent.com"); // Replace with your client ID.
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: "991101622384-m25j9ak9vqj09l73p3e1lr3ulk9be73q.apps.googleusercontent.com", // Replace with your client ID.
    });
  } catch (err) {
    return next(new HttpError("Invalid Google token", 401));
  }

  const { email, name, picture } = ticket.getPayload();

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    console.error("Error verifying Google token:", err);
    return next(new HttpError("Login failed, please try again later.", 500));
  }

  if (!user) {
    let localImagePath;
    try {
      const response = await axios({
        url: picture,
        method: "GET",
        responseType: "stream",
      });

      const fileExtension = path.extname(picture.split("?")[0]);
      const fileName = `${uuidv4()}${fileExtension}`;
      const uploadDir = path.join(__dirname, "..", "uploads", "images");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      localImagePath = path.join(uploadDir, fileName);

      const writer = fs.createWriteStream(localImagePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (err) {
      console.error("Error downloading Google profile picture:", err);
      return next(new HttpError("Failed to process image, please try again later.", 500));
    }

    const newUser = new User({
      name,
      email,
      image: `uploads/images/${path.basename(localImagePath)}`,
      password: null,
      places: [],
      googleAuth: true,
    });

    try {
      user = await newUser.save();
    } catch (err) {
      console.error("Database error:", err);
      return next(new HttpError("Signup failed, please try again later.", 500));
    }
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "super_secret_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Login failed, please try again later.", 500));
  }

  res.status(200).json({
    userId: user.id,
    email: user.email,
    token,
  });
};

 
const getUserById = async(req, res, next) => {

  const userId = req.params.uid

  let user;
  try{
    user = await User.findById(userId)
  }catch (err) {
    return next(
      new HttpError("Could not find the User, Please try again.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("No user was found for the provided id.", 404));
  }
  res.json({ user: user.toObject({ getters: true }) });

}

const updateUsername = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Could not find the User, Please try again.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("No user was found for the provided id.", 404));
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ name: req.body.name });
  } catch (err) {
    return next(new HttpError("Could not change username , please try again later", 500));
  }

  if (existingUser) {
    return next(
      new HttpError(
        `An account with the username ${req.body.name} already exists, please select a different name.`,
        422
      )
    );
  }

  user.name = req.body.name;

  try {
    await user.save();
  } catch (err) {
    return next(
      new HttpError("Could not update the username, Please try again.", 500)
    );
  }

  res.status(201).json({ user: user.toObject({ getters: true }) })
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId).populate("places");
  } catch (err) {
    return next(new HttpError("Could not fetch user data. Please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user with the provided ID.", 404));
  }

  const userImagePath = user.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    for (const place of user.places) {
      const placeImagePath = place.image; 
      fs.unlink(placeImagePath, (err) => {
        if (err) {
          console.error(`Error deleting place image: ${placeImagePath}`, err);
        }
      });

      await Place.deleteOne({ _id: place._id }, { session: sess });
    }

    await User.deleteOne({ _id: userId }, { session: sess });

    await sess.commitTransaction();

    fs.unlink(userImagePath, (err) => {
      if (err) {
        console.error(`Error deleting user image: ${userImagePath}`, err);
      }
    });

    res.status(200).json({ message: "User and associated places (including images) deleted." });
  } catch (err) {
    return next(new HttpError("Could not delete the user and places. Please try again.", 500));
  }
};


exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById
exports.updateUsername = updateUsername
exports.deleteUser = deleteUser
exports.googleLogin = googleLogin
