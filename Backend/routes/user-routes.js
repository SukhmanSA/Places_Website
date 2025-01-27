const express = require("express");
const router = express.Router()
const { check } = require("express-validator")

const userControllers = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

router.get("/", userControllers.getAllUsers)

router.post("/signup", fileUpload.single("image"),
    [
        check("title").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({min:6})
    ],userControllers.signup)

router.post("/login", [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({min:6})
    ],userControllers.login)

router.post("/google-login", fileUpload.single("image"), userControllers.googleLogin)

router.get("/:uid", userControllers.getUserById)

router.patch("/:uid", userControllers.updateUsername)

router.delete("/:uid", userControllers.deleteUser)

module.exports = router