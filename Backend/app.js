const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")

const placesRoutes = require("./routes/place-routes")
const userRoutes = require("./routes/user-routes")
const HttpError = require("./models/http-error")
const cors = require("cors");

const app = express();

app.use(bodyParser.json())

app.use("/uploads/images",express.static(path.join("uploads","images")))

app.use(cors({ origin: "http://localhost:5173" }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});


app.use('/api/places',placesRoutes)

app.use("/api/users", userRoutes)

app.use((req, res, next)=>{
    return next(new HttpError("No Route was found",404))
})

app.use((error,req,res,next)=>{

    if(req.file){
        fs.unlink(req.file.path,error=>{
            console.log(error)
        })
    }

    if(res.headerSent){
        return next(error)
    }

    res.status(error.code || 500).json({message:error.message || "An unknown error waas found!"})

})
// Harpreet%4022
mongoose.connect(
    'mongodb+srv://sukhmanwebdev:Harpreet%4022@cluster0.euto9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(()=>{
    app.listen(5000)
}).catch(err=>{
    console.log(err)
})



