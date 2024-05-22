const SolisInverterClient = require('./lib/solis_inverter_client.js')

const express = require('express')
const app = express()
const port = 3000



const address = process.env.SOLIS_ADDRESS
const username = process.env.SOLIS_USERNAME
const password = process.env.SOLIS_PASSWORD
if (!address) {
    console.error('address not given')
    process.exit(1)
}

if (!port) {
    console.error('port not given')
    process.exit(1)
}

const inverter = new SolisInverterClient(address, username, password)

let lastData = {
    inverter: {
        serial: "",
        model: ""
    },
    power: 0,
    energy: {
        today: 0,
        total: 0
    }
};

app.get('/metrics', async (req, res) => {
    try {
        const data = await inverter.fetchData();
        if (data) {
            if (lastData.inverter.serial === "" || lastData.inverter.model === "") {
                lastData.inverter = data.inverter;
            }
            lastData.power = data.power;
            lastData.energy = data.energy;
        }
    } catch (error) {
        if (lastData) {
            lastData.power = 0;
        }
    }
    
    if (lastData) {
        let prometeus_metrics = ""
        prometeus_metrics += `solis_current_power{inverter_serial="${lastData.inverter.serial}",inverter_model="${lastData.inverter.model}"} ${lastData.power}\n`;
        prometeus_metrics += `solis_yield_today{inverter_serial="${lastData.inverter.serial}",inverter_model="${lastData.inverter.model}"} ${lastData.energy.today}\n`;
        prometeus_metrics += `solis_total_today{inverter_serial="${lastData.inverter.serial}",inverter_model="${lastData.inverter.model}"} ${lastData.energy.total}\n`;

        res.setHeader('content-type', 'text/plain');
        res.send(prometeus_metrics)
    } else {
        res.setHeader('content-type', 'text/plain');
        res.send("")
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})