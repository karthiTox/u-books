const express = require("express");
const morgan = require("morgan");
const fetch = require("node-fetch");
const slowDown = require("express-slow-down");
require("dotenv").config();

const app = express();

app.enable("trust proxy");

const PORT = process.env.PORT || 3000;
const { API_KEY_VALUE } = process.env;
const API_URL = `https://www.googleapis.com/books/v1/volumes?:keyes&key=${API_KEY_VALUE}`;

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100, 
  delayMs: 500
});

app.use(speedLimiter);

app.use(morgan("dev"));

app.use(express.static("public"));

app.use("/books", async (req, res) => {
  try {
    const query_string = req.url.slice(2);
    const response = await fetch(API_URL + "&" + query_string);
    res.json(await response.json());
  } catch {
    res.json({});
  }
});

app.listen(PORT);
