const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const socialRoutes = require("./routes/social");
const postRoutes = require("./routes/posts");
const engagementRoutes = require("./routes/engagement");
const analyticsRoutes = require("./routes/analytics");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser(
  process.env.COOKIE_SECRET
  || process.env.AUTH_JWT_SECRET
  || process.env.DEMO_SESSION_SECRET,
));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ success: true, message: "API is healthy" });
});

app.use("/auth", authRoutes);
app.use("/social", socialRoutes);
app.use("/v1/social", socialRoutes);
app.use("/posts", postRoutes);
app.use("/engagement", engagementRoutes);
app.use("/analytics", analyticsRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

module.exports = app;