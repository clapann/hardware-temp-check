const si = require('systeminformation');
const chalk = require('chalk');
const clear = require('clear');

function getCPUData() {
    return new Promise(async (resolve, reject) => {
        const data = await si.cpu();
        const temp = (await si.cpuTemperature()).main;

        resolve({ name: data.brand, temp: celsiusToFahrenheit(temp) });
    });
}

function getGPUData() {
    return new Promise((resolve, reject) => {
        si.graphics().then(data => {
            resolve({ name: data.controllers[0].name, temp: celsiusToFahrenheit(data.controllers[0].temperatureGpu) });
        });
    });
}

function celsiusToFahrenheit(celsius) {
    if(!celsius) return 'Unknown | Re-run as Admin';
    return Math.round((celsius * 9 / 5) + 32);
}

function getColorizedTemperature(temperature, goodLimit, warningLimit) {
    let colorFunction;

    if (temperature < goodLimit) {
        colorFunction = chalk.green;
    } else if (temperature < warningLimit) {
        colorFunction = chalk.yellow;
    } else {
        colorFunction = chalk.red;
    }

    return colorFunction(`${temperature} °F`);
}

async function main() {
    try {
        const cpu = await getCPUData();
        const gpu = await getGPUData();

        clear();
        console.log(`\n${chalk.cyan('CPU')}: ${chalk.white.bold(cpu.name)} | ${getColorizedTemperature(cpu.temp, 104, 150)}`);
        console.log(`${chalk.blue('GPU')}: ${chalk.white.bold(gpu.name)} | ${getColorizedTemperature(gpu.temp, 104, 122)}`);
        console.log(chalk.gray(`This message gets updated every ${chalk.white.bold('3 seconds')}\n`));
    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

main();
setInterval(() => {
    main();
}, 3000);