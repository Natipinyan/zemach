let dataObjects = [];
let avg = [];

const handleData = (req, res, next) => {
    const newData = req.body;
    addMinMaxToPositions(newData);

    if (newData && newData.id) {
        let existingData = dataObjects.find(item => item.id === newData.id);

        if (existingData) {

            addToExist(newData, existingData);
            compareMinMax(newData, existingData);
        } else {
            newData.counter = 1;
            dataObjects.push({ ...newData });
        }

        if (existingData && existingData.counter >= 10) {
            moveToAvg(existingData);
        }

        console.log("data");
        console.log(JSON.stringify(dataObjects, null, 2));
        console.log("avg");
        console.log(JSON.stringify(avg, null, 2));
        next();
    } else {
        res.status(400).json({ message: "No data received or missing ID" });
    }
};
function addToExist(newData, existingData) {
    newData.positions.forEach((newPosition, positionIndex) => {
        if (existingData.positions[positionIndex]) {
            const existingPosition = existingData.positions[positionIndex];

            existingPosition.UV_radiation += newPosition.UV_radiation;
            existingPosition.soilMoisture += newPosition.soilMoisture;
            existingPosition.lightIntensity += newPosition.lightIntensity;
            existingPosition.humidity += newPosition.humidity;
            existingPosition.temperature += newPosition.temperature;


            existingPosition.UV_radiation_max = Math.max(existingPosition.UV_radiation_max, newPosition.UV_radiation);
            existingPosition.UV_radiation_min = Math.min(existingPosition.UV_radiation_min, newPosition.UV_radiation);
            existingPosition.soilMoisture_max = Math.max(existingPosition.soilMoisture_max, newPosition.soilMoisture);
            existingPosition.soilMoisture_min = Math.min(existingPosition.soilMoisture_min, newPosition.soilMoisture);
            existingPosition.lightIntensity_max = Math.max(existingPosition.lightIntensity_max, newPosition.lightIntensity);
            existingPosition.lightIntensity_min = Math.min(existingPosition.lightIntensity_min, newPosition.lightIntensity);
            existingPosition.humidity_max = Math.max(existingPosition.humidity_max, newPosition.humidity);
            existingPosition.humidity_min = Math.min(existingPosition.humidity_min, newPosition.humidity);
            existingPosition.temperature_max = Math.max(existingPosition.temperature_max, newPosition.temperature);
            existingPosition.temperature_min = Math.min(existingPosition.temperature_min, newPosition.temperature);
        } else {

            existingData.positions.push({ ...newPosition });
        }
    });
    existingData.counter += 1;
}


function moveToAvg(existingData) {
    avg.push({
        id: existingData.id,
        positions: existingData.positions.map(position => ({
            UV_radiation: position.UV_radiation / existingData.counter,
            soilMoisture: position.soilMoisture / existingData.counter,
            lightIntensity: position.lightIntensity / existingData.counter,
            humidity: position.humidity / existingData.counter,
            temperature: position.temperature / existingData.counter,
            UV_radiation_max: position.UV_radiation_max,
            UV_radiation_min: position.UV_radiation_min,
            soilMoisture_max: position.soilMoisture_max,
            soilMoisture_min: position.soilMoisture_min,
            lightIntensity_max: position.lightIntensity_max,
            lightIntensity_min: position.lightIntensity_min,
            humidity_max: position.humidity_max,
            humidity_min: position.humidity_min,
            temperature_max: position.temperature_max,
            temperature_min: position.temperature_min
        }))
    });

    // איפוס הערכים הרגילים, המינימליים והמקסימליים
    existingData.positions.forEach(position => {
        position.UV_radiation = 0;
        position.soilMoisture = 0;
        position.lightIntensity = 0;
        position.humidity = 0;
        position.temperature = 0;
        position.UV_radiation_max = 0;
        position.UV_radiation_min = 0;
        position.soilMoisture_max = 0;
        position.soilMoisture_min = 0;
        position.lightIntensity_max = 0;
        position.lightIntensity_min = 0;
        position.humidity_max = 0;
        position.humidity_min = 0;
        position.temperature_max = 0;
        position.temperature_min = 0;
    });

    existingData.counter = 0;
    console.log(`Data for ID ${existingData.id} moved to avg and reset.`);
    pushToDb(avg);
}

async function pushToDb(avg) {
    let deviceList = await processDevices();

    for (const data of avg) {
        let matchingDevice = deviceList.find(item => item.device_id === data.id);
        if (!matchingDevice) {
            console.error(`No matching device found for device_id: ${data.id}`);
            continue; // Skip this data if no matching device is found
        }
        let plants = [matchingDevice.plant_id_1, matchingDevice.plant_id_2, matchingDevice.plant_id_3];
        console.log(plants);
        let plantCounter = 0;

        for (const position of data.positions) {
            const plantID = plants[plantCounter++];

            const sql = `
                INSERT INTO environmental_data_avg (
                    device_id,
                    plant_ID,
                    UV_radiation, 
                    lightIntensity, 
                    temperature,
                    humidity,
                    measurement_date,
                    soilMoisture,
                    UV_radiation_max, 
                    UV_radiation_min,
                    lightIntensity_max, 
                    lightIntensity_min,
                    temperature_max, 
                    temperature_min,
                    humidity_max, 
                    humidity_min,
                    soilMoisture_max, 
                    soilMoisture_min
                ) VALUES (?, ?, ?, ?, ?, ?,now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                data.id,
                plantID,
                position.UV_radiation,
                position.lightIntensity,
                position.temperature,
                position.humidity,
                position.soilMoisture,
                position.UV_radiation_max,
                position.UV_radiation_min,
                position.lightIntensity_max,
                position.lightIntensity_min,
                position.temperature_max,
                position.temperature_min,
                position.humidity_max,
                position.humidity_min,
                position.soilMoisture_max,
                position.soilMoisture_min
            ];

            try {
                await new Promise((resolve, reject) => {
                    db_pool.query(sql, values, (err, result) => {
                        if (err) {
                            console.error("Error inserting data into DB:", err);
                            reject(err);
                        } else {
                            console.log(`Data for ID ${data.id} inserted successfully. Plant ID: ${plantID}`);
                            resolve(result);
                        }
                    });
                });
            } catch (error) {
                console.error("Error inserting data for plantID", plantID, error);
            }
        }
    }
}



function processDevices() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM arduino`;
        db_pool.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching data from arduino:", err);
                reject(err);
            } else {
                console.log("Fetched arduino data:");
                resolve(results);
            }
        });
    });
}

function addMinMaxToPositions(data) {
    if (data && data.positions) {
        data.positions.forEach(position => {
            for (const key of Object.keys(position)) {
                if (typeof position[key] === 'number' && !key.endsWith('_max') && !key.endsWith('_min')) {
                    // הגדרת ערכי מינימום ומקסימום
                    position[`${key}_max`] = position[key];
                    position[`${key}_min`] = position[key];
                }
            }
        });
    }
}


function compareMinMax(newData, existingData) {
    if (newData && newData.positions && existingData && existingData.positions) {
        newData.positions.forEach((position, index) => {
            const existingPosition = existingData.positions[index];

            for (const [key, value] of Object.entries(position)) {
                if (key.endsWith('_max') || key.endsWith('_min')) {
                    const currentMax = existingPosition[`${key}`] || 0;
                    const currentMin = existingPosition[`${key}`] || 0;

                    if (key.endsWith('_max') && value > currentMax) {
                        existingPosition[`${key}`] = value;
                    } else if (key.endsWith('_min') && value < currentMin) {
                        existingPosition[`${key}`] = value;
                    }
                }
            }
        });
    }
}

module.exports = {
    handleData,
    dataObjects,
    avg
};
