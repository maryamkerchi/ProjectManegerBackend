// index.js
const express = require("express");
const app = express();

// یک route ساده
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// پورت را از Render می‌گیرد
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
