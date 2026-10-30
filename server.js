import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MeshRescue Backend is running!");
});
app.get("/api/tinyfish-search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  if (!process.env.TINYFISH_API_KEY) {
    return res.status(500).json({ error: "TinyFish API key is missing" });
  }

  try {
    const response = await fetch(
      `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&location=IN&language=en`,
      {
        headers: {
          "X-API-Key": process.env.TINYFISH_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});