const { dataObjects } = require("../middleWare/middlewareDataRtr");

function processData() {
    let newData = dataObjects.map(obj => {
        let newPositions = obj.positions.map(position => {
            return {
                UV_radiation: position.UV_radiation / obj.counter,
                soilMoisture: position.soilMoisture / obj.counter,
                lightIntensity: position.lightIntensity / obj.counter,
                humidity: position.humidity / obj.counter,
                temperature: position.temperature / obj.counter
            };
        });

        return {
            id: obj.id,
            Status: obj.Status,
            positions: newPositions,
            counter: obj.counter
        };
    });

    return newData;
}

module.exports = processData;
