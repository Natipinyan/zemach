let dataObjects = [];
let avg = [];

const handleData = (req, res, next) => {
    const newData = req.body;

    if (newData && newData.id) {
        let existingData = dataObjects.find(item => item.id === newData.id);

        if (existingData) {
            addToExist(newData, existingData);
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

function addToExist(newData, existingData){
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
}

function moveToAvg(existingData){
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
    pushToDb(avg);
}

async function pushToDb(avg) {

    let deviceList = await processDevices();

    avg.forEach((data) => {

        let matchingDevice = deviceList.find(item => item.device_id === data.id);
        let plants = [matchingDevice.plant_id_1, matchingDevice.plant_id_2, matchingDevice.plant_id_3];
        console.log(plants);
        let plantCounter = 0;

        data.positions.forEach((position) => {
        const plantID = plants[plantCounter++];

            const sql = `
                INSERT INTO environmental_data_avg (
                    device_id, plant_ID, uv_radiation, soil_humidity, light, air_temperature, air_humidity, measurement_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                data.id,
                plantID,
                position.UV_radiation,
                position.soilMoisture,
                position.lightIntensity,
                position.temperature,
                position.humidity
            ];

            db_pool.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Error inserting data into DB:", err);
                } else {
                    console.log(`Data for ID ${data.id} inserted successfully. Plant ID: ${plantID}`);
                }
            });
        });
    });
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

module.exports = {
    handleData,
    dataObjects,
    avg
};
