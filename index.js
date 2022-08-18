const express = require("express");
const morgan = require("morgan");
const fetch = require("node-fetch");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = "localhost";
const { API_KEY_VALUE } = process.env;
const API_URL = `https://www.googleapis.com/books/v1/volumes?:keyes&key=${API_KEY_VALUE}`;

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

app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
