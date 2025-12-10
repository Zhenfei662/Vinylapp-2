console.log("🔥 CURRENT SERVER FILE IS RUNNING:", __filename);
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ===============================
// MongoDB Connect
// ===============================
console.log("MONGO_URL =", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected (Atlas)"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ===============================
// Vinyl Schema
// ===============================
const VinylSchema = new mongoose.Schema({
  title: String,
  artist: String,
  year: String,
  genre: String,
  coverImage: String,
});

const Vinyl = mongoose.model("Vinyl", VinylSchema);

// ===============================
// Discogs Search API (保持 /api/... 不动)
// ===============================
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q || "vinyl";

    const response = await axios.get("https://api.discogs.com/database/search", {
      params: { q: query, type: "release", per_page: 15 },
      headers: {
        Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
      },
    });

    res.json(response.data.results);
  } catch (err) {
    console.error("Discogs Search Error:", err.message);
    res.status(500).json({ error: "Discogs search failed" });
  }
});

// ===============================
// Discogs Release Detail API
// ===============================
app.get("/api/release/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.discogs.com/releases/${req.params.id}`,
      {
        headers: { Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}` },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Release fetch error:", err.message);
    res.status(500).json({ error: "Release fetch failed" });
  }
});

// ===============================
// CRUD: Vinyl Collection  (方案 A) —— 去掉 /api 前缀
// ===============================

// GET all
app.get("/vinyls", async (req, res) => {
  const list = await Vinyl.find();
  res.json(list);
});

// POST create
app.post("/vinyls", async (req, res) => {
  try {
    const vinyl = new Vinyl(req.body);
    await vinyl.save();
    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ error: "Save failed" });
  }
});

// PUT update
app.put("/vinyls/:id", async (req, res) => {
  try {
    await Vinyl.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE remove
app.delete("/vinyls/:id", async (req, res) => {
  try {
    await Vinyl.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===============================
// Start Server
// ===============================
app.listen(5000, () => {
  console.log("🔥 Server running at http://localhost:5000");
});
