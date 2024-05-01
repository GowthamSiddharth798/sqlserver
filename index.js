const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const { format } = require('date-fns');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

const config = {
  host: "127.0.0.1",
  user: "root",
  password: "#1234567",
  database: "energy"
};

async function initializeInitialEnergyValue() {
  try {
    console.log("Initializing initial energy value...");
    const response = await axios.get("https://energybackend.onrender.com/api/sensordata");
    const initialData = response.data;
    initialEnergyValue = initialData.energy;
    console.log("Initial energy value stored:", initialEnergyValue);
  } catch (error) {
    console.error("Error initializing initial energy value:", error);
  }
}

async function fetchDataAndStore() {
  try {
    console.log("Fetching and storing sensor data...");
    const response = await axios.get("https://energybackend.onrender.com/api/sensordata");
    const newData = response.data;
    

    let energyConsumption = null;
    if (initialEnergyValue !== null) {
      energyConsumption = newData.energy - initialEnergyValue;
    }

    const query = `
      INSERT INTO sensordata (timestamp, current, power, energy, IRcurrent, IYcurrent, IBcurrent, VRvoltage, VYvoltage, VBvoltage, 
        IRLcurrent, IYLcurrent, IBLcurrent, VRLvoltage, VYLvoltage, VBLvoltage, R_power, Y_power, B_power, Active_power, Reactive_power, 
        Power_factor, Energy_Meter, Voltage, energy_consumption) 
      VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      newData.current, newData.power, newData.energy, newData.IRcurrent, newData.IYcurrent, newData.IBcurrent, 
      newData.VRvoltage, newData.VYvoltage, newData.VBvoltage, newData.IRLcurrent, newData.IYLcurrent, newData.IBLcurrent, 
      newData.VRLvoltage, newData.VYLvoltage, newData.VBLvoltage, newData.R_power, newData.Y_power, newData.B_power, 
      newData.Active_power, newData.Reactive_power, newData.Power_factor, newData.Energy_Meter, newData.Voltage, energyConsumption
    ];

    const connection = await mysql.createConnection(config);
    await connection.query(query, values);
    await connection.end();

    console.log("Sensor data stored successfully:", newData);

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const fileName = `VITB_${currentDate}.txt`;
    const filePath = path.join("C:\\Users\\Lenovo\\Dropbox\\vit", fileName);

    appendDataToFile(newData, filePath);
  } catch (error) {
    console.error("Error fetching and storing sensor data:", error);
  }

  // Call the function recursively with a delay (e.g., every 60 seconds)
  setTimeout(fetchDataAndStore, 60000);
}

function formatSensorData(data) {
  const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const formattedData = `${dateTime},${data.current},${data.power},${data.energy},${data.IRcurrent},${data.IYcurrent},${data.IBcurrent},${data.VRvoltage},${data.VYvoltage},${data.VBvoltage},${data.IRLcurrent},${data.IYLcurrent},${data.IBLcurrent},${data.VRLvoltage},${data.VYLvoltage},${data.VBLvoltage},${data.R_power},${data.Y_power},${data.B_power},${data.Active_power},${data.Reactive_power},${data.Power_factor},${data.Energy_Meter},${data.Voltage}\n`;
  return formattedData;
}

function appendDataToFile(data, filePath) {
  const formattedData = formatSensorData(data);

  fs.appendFile(filePath, formattedData, { flag: 'a+' }, (err) => {
    if (err) {
      console.error("Error appending data to file:", err);
    } else {
      console.log("Data appended to file successfully.");
    }
  });
}

// Initialize initial energy value on server startup
initializeInitialEnergyValue();

// Start fetching and storing sensor data
fetchDataAndStore();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
