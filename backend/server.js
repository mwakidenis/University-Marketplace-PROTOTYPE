const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: "./backend/.env" }); // Explicit path for .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve defaultimage.jpg and other assets from public/
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve uploaded images and other static assets
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Serve other static files like frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "Frontend")));

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// 🔹 Test API Route
app.get("/api", (req, res) => {
  res.send("🚀 API is running...");
});

// 🔹 Check MongoDB Connection Status
app.get("/api/test-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ success: true, message: "✅ MongoDB Connected", collections });
  } catch (error) {
    res.json({ success: false, message: "❌ MongoDB NOT Connected" });
  }
});

// 🔹 Import Product Routes
app.use("/api/products", require("./routes/products"));

// 🔹 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
