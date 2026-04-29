const express = require("express");
const router = express.Router();
const apiData = require('../../models/apiModel')

router.delete('/', async (req, res) => {
  try {
    const result = await apiData.deleteMany({});

    return res.json({
      message: "All data deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Failed to delete data" });
  }

  });

  module.exports = router;