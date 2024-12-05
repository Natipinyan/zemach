const express = require("express");
const router = express.Router();
const processData = require("../middleWare/middleWarwReadData");

router.get("/", (req, res) => {
    const result = processData();
    res.json(result);
});

module.exports = router;
