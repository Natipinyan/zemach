const express = require("express");
const router = express.Router();
const { avg } = require("../middleWare/middlewareDataRtr");


router.get("/", (req, res) => {
    res.json(avg);
});

module.exports = router;
