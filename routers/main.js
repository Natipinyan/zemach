const express = require("express");
const router = express.Router();

let receivedData = [];

router.get("/", (req, res) => {
    res.render("demo", { pageTitle: "Main Page" });
});


module.exports = router;
