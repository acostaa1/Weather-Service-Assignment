const express = require("express");
// needed to make calls to external APIs
const cors = require("cors");

const PORT = 3000;
const app = express();

// middleware
app.use(express.json());
app.use(cors());

// controllers
const forecastController = require("./controllers/forecast");
app.use("/forecast", forecastController);

// happy path
app.get("/", (req, res) => {
  res.status(200).json({ message: "You are connected!" });
});

// catch-all error handler
app.use((err, req, res, next) => {
  const code = err.status;
  const error = err.message;

  res.status(code).json({ error });
});

// listen
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
