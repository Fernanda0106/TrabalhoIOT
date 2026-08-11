let portaSerial = null;
let leitor = null;

let temperaturaAtual = null;
let umidadeAtual = null;
let luminosidadeAtual = null;

let quantidadeAlertas = 0;


// ================================
// ELEMENTOS DA PÁGINA
// ================================

const botaoConectar = document.getElementById("connectArduino");

const statusConexao = document.getElementById("connectionStatus");

const temperaturaElemento =
    document.getElementById("temperatura");

const umidadeElemento =
    document.getElementById("umidade");

const luminosidadeElemento =
    document.getElementById("luminosidade");

const communicationStatus =
    document.getElementById("communicationStatus");


// ================================
// BOTÃO CONECTAR
// ================================

if (botaoConectar) {

    botaoConectar.addEventListener(
        "click",
        conectarArduino
    );

}


// ================================
// CONECTAR ARDUINO
// ================================

async function conectarArduino() {

    if (!("serial" in navigator)) {

        alert(
            "Seu navegador não suporta conexão serial. Use o Google Chrome ou Microsoft Edge."
        );

        return;
    }


    try {

        // Abre a janela para escolher a porta
        portaSerial =
            await navigator.serial.requestPort();


        // Abre a comunicação serial
        await portaSerial.open({
            baudRate: 9600
        });


        atualizarStatusConexao(true);


        console.log("Arduino conectado.");


        iniciarLeitura();


    } catch (erro) {

        console.error(
            "Erro ao conectar ao Arduino:",
            erro
        );

        atualizarStatusConexao(false);

    }

}


// ================================
// STATUS DA CONEXÃO
// ================================

function atualizarStatusConexao(conectado) {

    if (!statusConexao) {
        return;
    }


    if (conectado) {

        statusConexao.innerHTML =
            '<span class="status-dot"></span> Arduino conectado';


        statusConexao.classList.add("connected");


        if (botaoConectar) {

            botaoConectar.textContent =
                "🟢 Arduino conectado";

        }


        if (communicationStatus) {

            communicationStatus.textContent =
                "Conectado";

        }

    } else {

        statusConexao.innerHTML =
            '<span class="status-dot"></span> Arduino desconectado';


        statusConexao.classList.remove("connected");


        if (botaoConectar) {

            botaoConectar.textContent =
                "🔌 Conectar Arduino";

        }


        if (communicationStatus) {

            communicationStatus.textContent =
                "Desconectado";

        }

    }

}


// ================================
// LER DADOS DO ARDUINO
// ================================

async function iniciarLeitura() {

    if (!portaSerial) {
        return;
    }


    const decoder =
        new TextDecoderStream();


    portaSerial.readable.pipeTo(
        decoder.writable
    );


    leitor =
        decoder.readable.getReader();


    let textoRecebido = "";


    try {

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
            "Erro na leitura:",
            erro
        );

        atualizarStatusConexao(false);

    }

}



// ================================
// PROCESSAR DADOS (CORRIGIDO)
// ================================

function processarDados(linha) {

    console.log("Dados recebidos:", linha);

    /*
       Exemplo de linha recebida: "23.6,62.4,730"
       23.6 = temperatura
       62.4 = umidade
       730  = luminosidade
    */

    // Separa por vírgula e limpa caracteres ocultos como \r e espaços em branco
    const dados = linha.split(",").map(item => item.trim());

    if (dados.length !== 3) {
        return;
    }

    const temperatura = parseFloat(dados[0]);
    const umidade = parseFloat(dados[1]);
    const luminosidade = parseInt(dados[2], 10);

    // Validação dos números
    if (
        Number.isNaN(temperatura) ||
        Number.isNaN(umidade) ||
        Number.isNaN(luminosidade)
    ) {
        console.warn("Valor inválido recebido:", dados);
        return;
    }

    // Atribui às variáveis globais
    temperaturaAtual = temperatura;
    umidadeAtual = umidade;
    luminosidadeAtual = luminosidade;

    // Atualiza a tela e os alertas!
    atualizarInterface();
    verificarAlertas();
}


// ================================
// ATUALIZAR INTERFACE
// ================================

function atualizarInterface() {

    if (temperaturaElemento) {

        temperaturaElemento.textContent =
            temperaturaAtual.toFixed(1);

    }


    if (umidadeElemento) {

        umidadeElemento.textContent =
            umidadeAtual.toFixed(1);

    }


    if (luminosidadeElemento) {

        luminosidadeElemento.textContent =
            luminosidadeAtual;

    }


    atualizarSituacao();

}


// ================================
// VERIFICAR ALERTAS
// ================================

function verificarAlertas() {

    let alertas = [];


    if (temperaturaAtual > 28) {

        alertas.push(
            "Temperatura acima do limite"
        );

    }


    if (umidadeAtual > 70) {

        alertas.push(
            "Umidade acima do limite"
        );

    }


    if (luminosidadeAtual > 350) {

        alertas.push(
            "Luminosidade acima do limite"
        );

    }


    if (alertas.length > 0) {

        atualizarSituacao(true);

    } else {

        atualizarSituacao(false);

    }

}


// ================================
// SITUAÇÃO DO AMBIENTE
// ================================

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


    if (!status || !titulo) {
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

    }

}


// ================================
// LIMPAR ALERTAS
// ================================

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

    quantidadeAlertas = 0;


    const total =
        document.getElementById(
            "totalAlerts"
        );


    const lista =
        document.getElementById(
            "alertsList"
        );


    if (total) {

        total.textContent = "0";

    }


    if (lista) {

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

    }

}