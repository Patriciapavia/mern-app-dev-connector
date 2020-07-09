const express = require("express");
const app = express();
const connectDB = require("./config/db");

// connect to db

connectDB();

app.get("/", (req, res) => res.send("API RUNING"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
