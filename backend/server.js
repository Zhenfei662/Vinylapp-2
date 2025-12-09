const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 🔑 Discogs Token
// ===============================
const DISCOGS_TOKEN = "hyqkNGqoZckmslmFbNTHxzueHizfCiPiEKGJfvjP";

// ===============================
// 🔍 API：搜索 Discogs
// 前端用：GET http://localhost:5000/api/search?q=xxx
// ===============================
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

// ===============================
// Start Server
// ===============================
app.listen(5000, () => console.log("🔥 Server running on http://localhost:5000"));

const axios = require("axios");

// 获取 release 详细信息
app.get("/api/release/:id", async (req, res) => {
    const releaseId = req.params.id;

    try {
        const response = await axios.get(
            `https://api.discogs.com/releases/${releaseId}`,
            {
                headers: {
                    Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
                }
            }
        );
        res.json(response.data);

    } catch (err) {
        res.status(500).json({ error: "Release fetch failed" });
    }
});
