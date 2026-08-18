// ==================================================
// SMARTCLASS IoT
// SCRIPT PRINCIPAL
// ==================================================


// ==================================================
// VARIÁVEIS DO ARDUINO
// ==================================================

let portaSerial = null;
let leitor = null;

let temperaturaAtual = null;
let umidadeAtual = null;
let luminosidadeAtual = null;

let quantidadeAlertas = 0;

let alertas = [];


// ==================================================
// LIMITES DOS SENSORES
// ==================================================

const LIMITE_TEMPERATURA = 28;
const LIMITE_UMIDADE = 70;
const LIMITE_LUMINOSIDADE = 350;


// ==================================================
// ELEMENTOS
// ==================================================

const botaoConectar =
    document.getElementById("connectArduino");

const statusConexao =
    document.getElementById("connectionStatus");

const temperaturaElemento =
    document.getElementById("temperatura");

const umidadeElemento =
    document.getElementById("umidade");

const luminosidadeElemento =
    document.getElementById("luminosidade");


// ==================================================
// INICIALIZAÇÃO
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    configurarNavegacao();

    carregarAlertas();

    atualizarInterface();

    atualizarStatusConexao(false);

});


// ==================================================
// NAVEGAÇÃO ENTRE AS TELAS
// ==================================================

function configurarNavegacao() {

    const botoes =
        document.querySelectorAll(".nav-item");

    const paginas =
        document.querySelectorAll(".page");


    botoes.forEach(botao => {

        botao.addEventListener("click", () => {

            const pagina =
                botao.dataset.page;


            // Remove página ativa
            paginas.forEach(p => {

                p.classList.remove(
                    "active-page"
                );

            });


            // Remove botão ativo
            botoes.forEach(b => {

                b.classList.remove(
                    "active"
                );

            });


            // Mostra a página escolhida
            const paginaSelecionada =
                document.getElementById(
                    `page-${pagina}`
                );


            if (paginaSelecionada) {

                paginaSelecionada.classList.add(
                    "active-page"
                );

            }


            // Marca botão selecionado
            botao.classList.add("active");

        });

    });

}


// ==================================================
// BOTÃO CONECTAR
// ==================================================

if (botaoConectar) {

    botaoConectar.addEventListener(
        "click",
        conectarArduino
    );

}


// ==================================================
// CONECTAR ARDUINO
// ==================================================

async function conectarArduino() {

    if (!("serial" in navigator)) {

        alert(
            "Seu navegador não suporta conexão serial. Use o Google Chrome ou Microsoft Edge."
        );

        return;

    }


    // Se já estiver conectado
    if (portaSerial) {

        return;

    }


    try {

        console.log(
            "Selecionando porta do Arduino..."
        );


        portaSerial =
            await navigator.serial.requestPort();


        await portaSerial.open({
            baudRate: 9600
        });


        console.log(
            "Arduino conectado!"
        );


        atualizarStatusConexao(true);


        iniciarLeitura();


    } catch (erro) {

        console.error(
            "Erro ao conectar ao Arduino:",
            erro
        );


        portaSerial = null;


        atualizarStatusConexao(false);

    }

}


// ==================================================
// ATUALIZAR STATUS DA CONEXÃO
// ==================================================

function atualizarStatusConexao(conectado) {

    const statusElementos = [

        document.getElementById(
            "connectionStatus"
        ),

        document.getElementById(
            "connectionStatusMonitoramento"
        ),

        document.getElementById(
            "connectionStatusAlertas"
        )

    ];


    statusElementos.forEach(status => {

        if (!status) {
            return;
        }


        if (conectado) {

            status.innerHTML =
                '<span class="status-dot"></span> Arduino conectado';

            status.classList.add(
                "connected"
            );

        } else {

            status.innerHTML =
                '<span class="status-dot"></span> Arduino desconectado';

            status.classList.remove(
                "connected"
            );

        }

    });


    // Botão do Dashboard
    if (botaoConectar) {

        if (conectado) {

            botaoConectar.textContent =
                "🟢 Arduino conectado";

        } else {

            botaoConectar.textContent =
                "🔌 Conectar Arduino";

        }

    }


    // Status da comunicação
    const communicationStatus =
        document.getElementById(
            "communicationStatus"
        );


    if (communicationStatus) {

        communicationStatus.textContent =
            conectado
                ? "Conectado"
                : "Desconectado";

    }

}


// ==================================================
// LER DADOS DO ARDUINO
// ==================================================

async function iniciarLeitura() {

    if (!portaSerial) {
        return;
    }


    try {

        const decoder =
            new TextDecoderStream();


        portaSerial.readable.pipeTo(
            decoder.writable
        );


        leitor =
            decoder.readable.getReader();


        let textoRecebido = "";


        while (true) {

            const {
                value,
                done
            } = await leitor.read();


            if (done) {
                break;
            }


            textoRecebido += value;


            const linhas =
                textoRecebido.split("\n");


            textoRecebido =
                linhas.pop();


            for (const linha of linhas) {

                processarDados(
                    linha.trim()
                );

            }

        }

    } catch (erro) {

        console.error(
            "Erro na leitura do Arduino:",
            erro
        );


        atualizarStatusConexao(false);

    }

}


// ==================================================
// PROCESSAR DADOS
// ==================================================

function processarDados(linha) {

    console.log(
        "Dados recebidos:",
        linha
    );


    /*
        O Arduino envia:

        Luminosidade: 810 | Umidade: 82.5% | Temp: 26.0 °C | Sensação: 27.8 °C
    */


    // Extrai a luminosidade
    const luminosidadeMatch =
        linha.match(/Luminosidade:\s*([\d.]+)/i);


    // Extrai a umidade
    const umidadeMatch =
        linha.match(/Umidade:\s*([\d.]+)%/i);


    // Extrai a temperatura
    const temperaturaMatch =
        linha.match(/Temp:\s*([\d.]+)\s*°C/i);


    // Verifica se encontrou os três valores
    if (
        !luminosidadeMatch ||
        !umidadeMatch ||
        !temperaturaMatch
    ) {

        console.warn(
            "Formato inválido:",
            linha
        );

        return;

    }


    // Converte os valores
    const luminosidade =
        parseInt(
            luminosidadeMatch[1],
            10
        );


    const umidade =
        parseFloat(
            umidadeMatch[1]
        );


    const temperatura =
        parseFloat(
            temperaturaMatch[1]
        );


    // Verifica se os valores são válidos
    if (
        Number.isNaN(temperatura) ||
        Number.isNaN(umidade) ||
        Number.isNaN(luminosidade)
    ) {

        console.warn(
            "Valores inválidos:",
            {
                temperatura,
                umidade,
                luminosidade
            }
        );

        return;

    }


    // Salva os valores
    temperaturaAtual =
        temperatura;


    umidadeAtual =
        umidade;


    luminosidadeAtual =
        luminosidade;


    console.log(
        "Temperatura:",
        temperaturaAtual
    );


    console.log(
        "Umidade:",
        umidadeAtual
    );


    console.log(
        "Luminosidade:",
        luminosidadeAtual
    );


    // Atualiza a tela
    atualizarInterface();


    // Verifica os alertas
    verificarAlertas();

}
// ==================================================
// ATUALIZAR INTERFACE
// ==================================================

function atualizarInterface() {


    // ------------------------------
    // DASHBOARD
    // ------------------------------

    if (temperaturaElemento) {

        temperaturaElemento.textContent =
            temperaturaAtual !== null
                ? temperaturaAtual.toFixed(1)
                : "--";

    }


    if (umidadeElemento) {

        umidadeElemento.textContent =
            umidadeAtual !== null
                ? umidadeAtual.toFixed(1)
                : "--";

    }


    if (luminosidadeElemento) {

        luminosidadeElemento.textContent =
            luminosidadeAtual !== null
                ? luminosidadeAtual
                : "--";

    }


    // ------------------------------
    // MONITORAMENTO
    // ------------------------------

    const temperaturaMonitoramento =
        document.getElementById(
            "temperaturaMonitoramento"
        );


    const umidadeMonitoramento =
        document.getElementById(
            "umidadeMonitoramento"
        );


    const luminosidadeMonitoramento =
        document.getElementById(
            "luminosidadeMonitoramento"
        );


    if (temperaturaMonitoramento) {

        temperaturaMonitoramento.textContent =
            temperaturaAtual !== null
                ? temperaturaAtual.toFixed(1)
                : "--";

    }


    if (umidadeMonitoramento) {

        umidadeMonitoramento.textContent =
            umidadeAtual !== null
                ? umidadeAtual.toFixed(1)
                : "--";

    }


    if (luminosidadeMonitoramento) {

        luminosidadeMonitoramento.textContent =
            luminosidadeAtual !== null
                ? luminosidadeAtual
                : "--";

    }


    // Histórico
    const historicoStatus =
        document.getElementById(
            "historicoStatus"
        );


    if (historicoStatus && temperaturaAtual !== null) {

        historicoStatus.textContent =
            "Recebendo dados";

    }


    atualizarSituacao();

}


// ==================================================
// VERIFICAR ALERTAS
// ==================================================

function verificarAlertas() {

    let novosAlertas = [];


    // Temperatura
    if (
        temperaturaAtual !== null &&
        temperaturaAtual > LIMITE_TEMPERATURA
    ) {

        novosAlertas.push(
            `Temperatura acima do limite: ${temperaturaAtual.toFixed(1)} °C`
        );

    }


    // Umidade
    if (
        umidadeAtual !== null &&
        umidadeAtual > LIMITE_UMIDADE
    ) {

        novosAlertas.push(
            `Umidade acima do limite: ${umidadeAtual.toFixed(1)}%`
        );

    }


    // Luminosidade
    if (
        luminosidadeAtual !== null &&
        luminosidadeAtual > LIMITE_LUMINOSIDADE
    ) {

        novosAlertas.push(
            `Luminosidade acima do limite: ${luminosidadeAtual}`
        );

    }


    // Se houver alerta
    if (novosAlertas.length > 0) {

        novosAlertas.forEach(mensagem => {

            registrarAlerta(mensagem);

        });


        atualizarSituacao(true);

    } else {

        atualizarSituacao(false);

    }

}


// ==================================================
// REGISTRAR ALERTA
// ==================================================

function registrarAlerta(mensagem) {

    /*
       Evita registrar exatamente o mesmo
       alerta várias vezes seguidas.
    */

    const ultimoAlerta =
        alertas[alertas.length - 1];


    if (
        ultimoAlerta &&
        ultimoAlerta.mensagem === mensagem
    ) {

        return;

    }


    const novoAlerta = {

        mensagem: mensagem,

        horario:
            new Date().toLocaleTimeString(
                "pt-BR"
            )

    };


    alertas.push(
        novoAlerta
    );


    quantidadeAlertas =
        alertas.length;


    salvarAlertas();


    atualizarListaAlertas();


    atualizarContadorAlertas();

}


// ==================================================
// ATUALIZAR SITUAÇÃO
// ==================================================

function atualizarSituacao(alerta = false) {

    const status =
        document.getElementById(
            "environmentStatus"
        );


    const titulo =
        document.getElementById(
            "statusTitle"
        );


    const descricao =
        document.getElementById(
            "statusDescription"
        );


    const situacao =
        document.getElementById(
            "currentSituation"
        );


    const dashboardDescription =
        document.getElementById(
            "dashboardDescription"
        );


    if (!status || !titulo) {

        return;

    }


    // Ainda não recebeu dados
    if (
        temperaturaAtual === null &&
        umidadeAtual === null &&
        luminosidadeAtual === null
    ) {

        status.classList.remove(
            "alert"
        );


        status.classList.add(
            "normal"
        );


        titulo.textContent =
            "Aguardando dados";


        descricao.textContent =
            "Conecte o Arduino para receber as leituras dos sensores.";


        if (situacao) {

            situacao.textContent =
                "Aguardando dados";

        }


        if (dashboardDescription) {

            dashboardDescription.textContent =
                "Os dados dos sensores aparecerão aqui após a conexão com o Arduino.";

        }


        return;

    }


    if (alerta) {

        status.classList.remove(
            "normal"
        );


        status.classList.add(
            "alert"
        );


        titulo.textContent =
            "Atenção necessária";


        descricao.textContent =
            "Uma ou mais condições ultrapassaram o limite definido.";


        if (situacao) {

            situacao.textContent =
                "Alerta";

        }


        if (dashboardDescription) {

            dashboardDescription.textContent =
                "Há condições do ambiente que precisam de atenção.";

        }

    } else {

        status.classList.remove(
            "alert"
        );


        status.classList.add(
            "normal"
        );


        titulo.textContent =
            "Ambiente normal";


        descricao.textContent =
            "Todas as condições estão dentro dos limites.";


        if (situacao) {

            situacao.textContent =
                "Normal";

        }


        if (dashboardDescription) {

            dashboardDescription.textContent =
                "Temperatura, umidade e luminosidade estão dentro dos limites.";

        }

    }

}


// ==================================================
// ATUALIZAR CONTADOR DE ALERTAS
// ==================================================

function atualizarContadorAlertas() {

    quantidadeAlertas =
        alertas.length;


    const contador =
        document.getElementById(
            "alertCount"
        );


    const total =
        document.getElementById(
            "totalAlerts"
        );


    const mensagem =
        document.getElementById(
            "alertMessage"
        );


    const resumo =
        document.getElementById(
            "alertSummaryMessage"
        );


    if (contador) {

        contador.textContent =
            quantidadeAlertas;

    }


    if (total) {

        total.textContent =
            quantidadeAlertas;

    }


    if (quantidadeAlertas === 0) {

        if (mensagem) {

            mensagem.textContent =
                "Nenhum alerta registrado.";

        }


        if (resumo) {

            resumo.textContent =
                "Nenhum alerta registrado.";

        }

    } else {

        if (mensagem) {

            mensagem.textContent =
                `${quantidadeAlertas} alerta(s) registrado(s).`;

        }


        if (resumo) {

            resumo.textContent =
                `${quantidadeAlertas} alerta(s) registrado(s).`;

        }

    }

}


// ==================================================
// MOSTRAR ALERTAS
// ==================================================

function atualizarListaAlertas() {

    const lista =
        document.getElementById(
            "alertsList"
        );


    if (!lista) {

        return;

    }


    if (alertas.length === 0) {

        lista.innerHTML = `

            <div class="empty-alerts">

                <div>✓</div>

                <strong>
                    Nenhum alerta registrado
                </strong>

                <p>
                    Quando temperatura, umidade ou luminosidade ultrapassarem o limite, o alerta aparecerá aqui.
                </p>

            </div>

        `;

        return;

    }


    lista.innerHTML = "";


    alertas.forEach(alerta => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "alert-item";


        item.innerHTML = `

            <div class="alert-icon">
                ⚠
            </div>

            <div class="alert-content">

                <strong>
                    ${alerta.mensagem}
                </strong>

                <p>
                    Registrado às ${alerta.horario}
                </p>

            </div>

        `;


        lista.appendChild(
            item
        );

    });

}


// ==================================================
// SALVAR ALERTAS
// ==================================================

function salvarAlertas() {

    localStorage.setItem(
        "smartclass_alertas",
        JSON.stringify(alertas)
    );

}


// ==================================================
// CARREGAR ALERTAS
// ==================================================

function carregarAlertas() {

    const dados =
        localStorage.getItem(
            "smartclass_alertas"
        );


    if (!dados) {

        alertas = [];

        quantidadeAlertas = 0;

        atualizarListaAlertas();

        atualizarContadorAlertas();

        return;

    }


    try {

        alertas =
            JSON.parse(dados);


        quantidadeAlertas =
            alertas.length;


        atualizarListaAlertas();

        atualizarContadorAlertas();

    } catch (erro) {

        console.error(
            "Erro ao carregar alertas:",
            erro
        );


        alertas = [];

        quantidadeAlertas = 0;

    }

}


// ==================================================
// LIMPAR ALERTAS
// ==================================================

const botaoLimpar =
    document.getElementById(
        "clearAlerts"
    );


if (botaoLimpar) {

    botaoLimpar.addEventListener(
        "click",
        limparAlertas
    );

}


function limparAlertas() {

    alertas = [];

    quantidadeAlertas = 0;


    localStorage.removeItem(
        "smartclass_alertas"
    );


    atualizarListaAlertas();

    atualizarContadorAlertas();


    // Se o ambiente estiver normal,
    // mantém a situação correta.
    verificarAlertas();

}


// ==================================================
// DETECTAR DESCONEXÃO DO ARDUINO
// ==================================================

if ("serial" in navigator) {

    navigator.serial.addEventListener(
        "disconnect",
        evento => {

            console.warn(
                "Arduino desconectado."
            );


            if (
                portaSerial &&
                evento.target === portaSerial
            ) {

                portaSerial = null;

                leitor = null;

                atualizarStatusConexao(
                    false
                );

            }

        }
    );

}