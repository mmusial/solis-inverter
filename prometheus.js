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


app.get('/metrics', async (req, res) => {

    const data = await inverter.fetchData();

    let prometeus_metrics = `solis_current_power{inverter_serial="${data.inverter.serial}",inverter_model="${data.inverter.model}"} ${data.power}\n`;
    prometeus_metrics += `solis_yield_today{inverter_serial="${data.inverter.serial}",inverter_model="${data.inverter.model}"} ${data.energy.today}\n`;
    prometeus_metrics += `solis_total_today{inverter_serial="${data.inverter.serial}",inverter_model="${data.inverter.model}"} ${data.energy.total}\n`;

    res.setHeader('content-type', 'text/plain');
    res.send(prometeus_metrics)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})