const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// ==================================================
// ⭐ CORS — 允许 GitHub Pages 访问 API（最重要）
// ==================================================
app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "https://zhenfei662.github.io",
            "https://zhenfei662.github.io/Vinylapp-2"
        ],
        methods: ["GET", "POST"],
        credentials: false
    })
);

app.use(express.json());

// ==================================================
// 🔑 Discogs Token
// ==================================================
const DISCOGS_TOKEN = "hyqkNGqoZckmslmFbNTHxzueHizfCiPiEKGJfvjP";

// ==================================================
// 🔍 Search API
// GET /api/search?q=vinyl
// ==================================================
app.get("/api/search", async (req, res) => {
    try {
        const query = req.query.q || "vinyl";

        const response = await axios.get(
            "https://api.discogs.com/database/search",
            {
                params: { q: query, type: "release", per_page: 15 },
                headers: {
                    Authorization: `Discogs token=${DISCOGS_TOKEN}`
                }
            }
        );

        res.json(response.data.results);
    } catch (err) {
        console.error("Discogs Search Error:", err.message);
        res.status(500).json({ error: "Discogs search failed" });
    }
});

// ==================================================
// 🔍 Release Detail API
// GET /api/release/:id
// ==================================================
app.get("/api/release/:id", async (req, res) => {
    const releaseId = req.params.id;

    try {
        const response = await axios.get(
            `https://api.discogs.com/releases/${releaseId}`,
            {
                headers: {
                    Authorization: `Discogs token=${DISCOGS_TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error("Release fetch error:", err.message);
        res.status(500).json({ error: "Release fetch failed" });
    }
});

// ==================================================
// 🚀 Start Server
// ==================================================
app.listen(5000, () => {
    console.log("🔥 Server running at http://localhost:5000");
});
