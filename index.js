const express = require("express");
require("dotenv").config();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const database = require("./config/database");
const routesApiVer1 = require("./api/v1/routes/index.route");
const cors = require("cors");


// connect database
database.connect();

// Local variables
// app.locals.prefixAdmin = "admin";
const app = express();
const port = process.env.PORT || 3000;

// cors
app.use(cors());

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//cookie

app.use(cookieParser());

// Routes Version 1
routesApiVer1(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});