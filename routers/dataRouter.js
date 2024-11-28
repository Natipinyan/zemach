const express = require("express");
const router = express.Router();

let dataObjects = [];

router.post("/getData", (req, res) => {
    const newData = req.body;

    if (newData) {
        const dataObject = { ...newData };
        dataObjects.push(dataObject);

        res.status(200).json({ message: "Data received and converted successfully", data: dataObject });
    } else {
        res.status(400).json({ message: "No data received" });
    }
});

module.exports = router;
