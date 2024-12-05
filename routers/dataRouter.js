const express = require("express");
const router = express.Router();
const { handleData } = require("../middleWare/middlewareDataRtr");

router.post("/getData", handleData, (req, res) => {
    const newData = req.body;
    res.status(200).json({ message: "Data received and updated successfully", data: newData });
});


module.exports = router;
