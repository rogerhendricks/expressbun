import express from "express";

const port = 8000;


const app = express();

app.use(express.json())

const deviceRoutes = require('./routes/device')

app.use('/device', deviceRoutes)

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at  port ${port}...`);
});
