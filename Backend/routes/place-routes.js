const express = require('express');
const router = express.Router();
const { check } = require("express-validator")
const fileUpload = require("../middleware/file-upload");
const auth = require("../middleware/auth")

const placeControllers = require("../controllers/places-controller")

router.get('/:pid', placeControllers.getPlaceById );

router.get("/user/:uid", placeControllers.getPlacesByUserId);

router.use(auth)

router.post("/", fileUpload.single("image"),[
        check("title").not().isEmpty(),
        check("description").isLength({min:5}),
        check("address").not().isEmpty()
    ], placeControllers.createPlace)

router.patch("/:pid", [
    check("title").not().isEmpty(),
    check("description").isLength({min:5})
    ], placeControllers.updatePlaceById)

router.delete("/:pid", placeControllers.deletePlaceById)

module.exports = router;