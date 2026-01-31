const express = require("express");
const { readDB } = require("../utils/db");
const router = express.Router();

router.get("/", async (req, res) => {
  const adapter = require("../utils/adapter");
  const products = await adapter.getProducts();
  return res.json({ ok: true, products });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const adapter = require("../utils/adapter");
  const p = await adapter.getProductById(id);
  if (!p) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true, product: p });
});

module.exports = router;
