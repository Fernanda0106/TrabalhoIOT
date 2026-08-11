const connectButton =
    document.getElementById("connectButton");

const connectionStatus =
    document.getElementById("connectionStatus");

const systemConnection =
    document.getElementById("systemConnection");

const temperatureElement =
    document.getElementById("temperature");

const humidityElement =
    document.getElementById("humidity");

const lightElement =
    document.getElementById("light");

const statusBanner =
    document.getElementById("statusBanner");

const statusIcon =
    document.getElementById("statusIcon");

const statusTitle =
    document.getElementById("statusTitle");

const statusDescription =
    document.getElementById("statusDescription");

const lastUpdate =
    document.getElementById("lastUpdate");

const alertCountElement =
    document.getElementById("alertCount");


let alertCount = 0;

const maxPoints = 20;

const labels = [];

const temperatureData = [];
const humidityData = [];
const lightData = [];


/* GRÁFICO DE TEMPERATURA */

const temperatureChart =
    new Chart(
        document
            .getElementById("temperatureChart"),
        {
            type: "line",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Temperatura",

                        data: temperatureData,

                        borderColor: "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.10)",

                        fill: true,

                        tension: 0.4,

                        pointRadius: 2
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );


/* GRÁFICO DE UMIDADE */

const humidityChart =
    new Chart(
        document
            .getElementById("humidityChart"),
        {
            type: "line",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Umidade",

                        data: humidityData,

                        borderColor: "#0891b2",

                        backgroundColor:
                            "rgba(8, 145, 178, 0.10)",

                        fill: true,

                        tension: 0.4,

                        pointRadius: 2
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );


/* GRÁFICO DE LUMINOSIDADE */

const lightChart =
    new Chart(
        document
            .getElementById("lightChart"),
        {
            type: "line",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Luminosidade",

                        data: lightData,

                        borderColor: "#d97706",

                        backgroundColor:
                            "rgba(217, 119, 6, 0.10)",

                        fill: true,

                        tension: 0.4,

                        pointRadius: 2
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        max: 1023
                    }
                }
            }
        }
    );


/* CONECTAR ARDUINO */

connectButton.addEventListener(
    "click",
    async () => {

        if (!("serial" in navigator)) {

            alert(
                "Seu navegador não suporta Web Serial. Use Google Chrome ou Microsoft Edge."
            );

            return;
        }


        try {

            const port =
                await navigator
                    .serial
                    .requestPort();


            await port.open({
                baudRate: 9600
            });


            connectionStatus
                .classList
                .remove("disconnected");

            connectionStatus
                .classList
                .add("connected");

            connectionStatus
                .innerHTML =
                '<span class="status-dot"></span>' +
                'Arduino conectado';


            systemConnection.textContent =
                "Conectado";


            connectButton.textContent =
                "Arduino conectado";


            connectButton.disabled = true;


            await readSerial(port);

        }

        catch (error) {

            console.error(error);

            alert(
                "Não foi possível conectar ao Arduino."
            );

        }

    }
);


/* LER PORTA SERIAL */

async function readSerial(port) {

    const decoder =
        new TextDecoderStream();


    const readableStreamClosed =
        port.readable
            .pipeTo(
                decoder.writable
            );


    const reader =
        decoder
            .readable
            .getReader();


    let buffer = "";


    try {

        while (true) {

            const {
                value,
                done
            } =
                await reader.read();


            if (done) {
                break;
            }


            buffer += value;


            const lines =
                buffer.split("\n");


            buffer =
                lines.pop();


            for (const line of lines) {

                processData(
                    line.trim()
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Erro na comunicação:",
            error
        );

    }

    finally {

        reader.releaseLock();

    }

}


/* PROCESSAR DADOS */

function processData(line) {

    if (!line) {
        return;
    }


    try {

        const data =
            JSON.parse(line);


        if (
            data.erro
        ) {

            showError();

            return;
        }


        const temperature =
            Number(
                data.temperatura
            );


        const humidity =
            Number(
                data.umidade
            );


        const light =
            Number(
                data.luminosidade
            );


        updateDashboard(
            temperature,
            humidity,
            light,
            data.alerta
        );

    }

    catch (error) {

        console.log(
            "Linha ignorada:",
            line
        );

    }

}


/* ATUALIZAR DASHBOARD */

function updateDashboard(
    temperature,
    humidity,
    light,
    alert
) {

    temperatureElement.textContent =
        temperature.toFixed(1);


    humidityElement.textContent =
        humidity.toFixed(1);


    lightElement.textContent =
        Math.round(light);


    const now =
        new Date();


    lastUpdate.textContent =
        now.toLocaleTimeString(
            "pt-BR"
        );


    updateStatus(
        temperature,
        humidity,
        light
    );


    updateCharts(
        temperature,
        humidity,
        light
    );

}


/* STATUS */

function updateStatus(
    temperature,
    humidity,
    light
) {

    const temperatureAlert =
        temperature > 28;


    const humidityAlert =
        humidity > 70;


    const lightAlert =
        light < 350;


    const hasAlert =
        temperatureAlert ||
        humidityAlert ||
        lightAlert;


    if (hasAlert) {

        statusBanner
            .classList
            .remove("normal");

        statusBanner
            .classList
            .add("alert");


        statusIcon.textContent =
            "!";


        statusTitle.textContent =
            "Atenção necessária";


        const messages = [];


        if (temperatureAlert) {
            messages.push(
                "temperatura alta"
            );
        }


        if (humidityAlert) {
            messages.push(
                "umidade alta"
            );
        }


        if (lightAlert) {
            messages.push(
                "luminosidade baixa"
            );
        }


        statusDescription.textContent =
            messages.join(" • ");


        alertCount++;


        alertCountElement.textContent =
            alertCount;

    }

    else {

        statusBanner
            .classList
            .remove("alert");

        statusBanner
            .classList
            .add("normal");


        statusIcon.textContent =
            "✓";


        statusTitle.textContent =
            "Ambiente normal";


        statusDescription.textContent =
            "Todas as condições estão dentro dos limites.";

    }

}


/* GRÁFICOS */

function updateCharts(
    temperature,
    humidity,
    light
) {

    const time =
        new Date()
            .toLocaleTimeString(
                "pt-BR"
            );


    if (
        labels.length >= maxPoints
    ) {

        labels.shift();

        temperatureData.shift();

        humidityData.shift();

        lightData.shift();

    }


    labels.push(time);

    temperatureData.push(
        temperature
    );

    humidityData.push(
        humidity
    );

    lightData.push(
        light
    );


    temperatureChart.update(
        "none"
    );

    humidityChart.update(
        "none"
    );

    lightChart.update(
        "none"
    );

}


/* ERRO NO DHT22 */

function showError() {

    statusBanner
        .classList
        .remove("normal");

    statusBanner
        .classList
        .add("alert");


    statusIcon.textContent =
        "!";


    statusTitle.textContent =
        "Erro na leitura";


    statusDescription.textContent =
        "Não foi possível obter dados do DHT22.";

}