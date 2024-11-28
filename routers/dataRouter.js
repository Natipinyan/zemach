const express = require("express");
const router = express.Router();

let dataObjects = [];
let avg = [];

router.post("/getData", (req, res) => {
    const newData = req.body;

    if (newData && newData.id) {
        let existingData = dataObjects.find(item => item.id === newData.id);

        if (existingData) {
            newData.positions.forEach((newPosition, positionIndex) => {
                if (existingData.positions[positionIndex]) {
                    existingData.positions[positionIndex].UV_radiation += newPosition.UV_radiation;
                    existingData.positions[positionIndex].soilMoisture += newPosition.soilMoisture;
                    existingData.positions[positionIndex].lightIntensity += newPosition.lightIntensity;
                    existingData.positions[positionIndex].humidity += newPosition.humidity;
                    existingData.positions[positionIndex].temperature += newPosition.temperature;
                } else {
                    existingData.positions.push({ ...newPosition });
                }
            });
            existingData.counter += 1;
        } else {
            newData.counter = 1;
            dataObjects.push({ ...newData });
        }

        if (existingData && existingData.counter >= 10) {
            avg.push({
                id: existingData.id,
                positions: existingData.positions.map(position => ({
                    UV_radiation: position.UV_radiation / existingData.counter,
                    soilMoisture: position.soilMoisture / existingData.counter,
                    lightIntensity: position.lightIntensity / existingData.counter,
                    humidity: position.humidity / existingData.counter,
                    temperature: position.temperature / existingData.counter
                }))
            });

            existingData.positions.forEach(position => {
                position.UV_radiation = 0;
                position.soilMoisture = 0;
                position.lightIntensity = 0;
                position.humidity = 0;
                position.temperature = 0;
            });
            existingData.counter = 0;
            console.log(`Data for ID ${existingData.id} moved to avg and reset.`);
        }

        console.log("data");
        console.log(JSON.stringify(dataObjects, null, 2));
        console.log("avg");
        console.log(JSON.stringify(avg, null, 2));

        res.status(200).json({ message: "Data received and updated successfully", data: newData });
    } else {
        res.status(400).json({ message: "No data received or missing ID" });
    }
});

module.exports = router;
