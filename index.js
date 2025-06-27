const express = require("express");
const { rateLimit } = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: 1000,
  legacyHeaders: false,
  standardHeaders: "draft-7"
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api", limiter);

app.get("/", function(req, res) {
  res.sendFile("index.html");
  console.log(req.cookies)
})

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`)
})
