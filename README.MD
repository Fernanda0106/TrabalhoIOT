# SmartClass IoT

## Sistema de Monitoramento Inteligente de Ambientes

Projeto desenvolvido como parte da avaliação final do SENAI, com o objetivo de aplicar conceitos de Internet das Coisas (IoT), sensores, microcontroladores e desenvolvimento de interfaces.

O SmartClass IoT foi desenvolvido para realizar o monitoramento das condições de uma sala, utilizando sensores conectados a um Arduino. O sistema foi planejado para acompanhar temperatura, umidade e luminosidade, permitindo visualizar as informações de forma simples e organizada.

---

## 📌 Sobre o projeto

O SmartClass IoT é uma solução de monitoramento ambiental criada para acompanhar as condições de uma sala de aula.

A proposta utiliza sensores para coletar informações do ambiente e apresentar esses dados em uma interface web.

O sistema possui uma interface com visualização das informações, área de monitoramento e gerenciamento de alertas.

O projeto também foi estruturado para receber dados reais provenientes do Arduino e dos sensores utilizados na solução.

---

## 🎯 Objetivos

### Objetivo geral

Desenvolver uma solução de IoT capaz de monitorar condições ambientais de uma sala e apresentar as informações de maneira clara em uma interface web.

### Objetivos específicos

- Monitorar a temperatura do ambiente;
- Monitorar a umidade do ambiente;
- Monitorar a luminosidade;
- Utilizar sensores conectados a um Arduino;
- Apresentar os dados coletados em uma interface web;
- Criar uma área específica para monitoramento;
- Identificar situações que ultrapassem limites definidos;
- Registrar alertas;
- Facilitar a visualização das condições do ambiente;
- Aplicar conceitos de IoT estudados durante o curso.

---

## 🏫 Aplicação

A solução foi pensada inicialmente para uma **sala de aula**.

O monitoramento pode auxiliar na identificação de condições ambientais que possam afetar o conforto dos alunos e professores ou indicar a necessidade de alguma intervenção.

Entre as informações acompanhadas estão:

| Variável | Sensor | Unidade |
|---|---|---|
| Temperatura | DHT22 | °C |
| Umidade | DHT22 | % |
| Luminosidade | LDR | ADC |

---

## 🔧 Componentes

### Arduino

O Arduino funciona como o microcontrolador responsável por receber as informações dos sensores e realizar a leitura dos dados.

### DHT22

O DHT22 é utilizado para realizar a medição de:

- Temperatura;
- Umidade.

### LDR

O LDR é utilizado para identificar a variação da luminosidade do ambiente.

Quando a iluminação muda, o comportamento elétrico do LDR também muda, permitindo que o Arduino faça a leitura dessa variação.

---

## 💻 Tecnologias utilizadas

### Hardware

- Arduino;
- Sensor DHT22;
- Sensor LDR;
- Resistor;
- Protoboard;
- Jumpers.

### Software

- HTML5;
- CSS3;
- JavaScript;
- Arduino IDE;
- Comunicação serial.

---

## 🖥️ Interface do sistema

O sistema possui três áreas principais:

### Dashboard

A tela inicial apresenta um resumo das condições do ambiente.

São exibidos:

- Temperatura;
- Umidade;
- Luminosidade;
- Situação atual do ambiente;
- Quantidade de alertas;
- Status da conexão com o Arduino.

---

### Monitoramento

A área de monitoramento apresenta as informações coletadas pelos sensores.

A proposta é permitir que os valores sejam acompanhados durante o funcionamento do sistema.

São monitorados:

- 🌡️ Temperatura;
- 💧 Umidade;
- ☀️ Luminosidade.

---

### Alertas

A área de alertas permite acompanhar situações em que os valores ultrapassem os limites definidos para o ambiente.

O sistema apresenta a quantidade de alertas registrados e informa quando não existem ocorrências.

Os alertas podem ser utilizados para identificar situações que necessitem de atenção.

---

## 🔌 Comunicação com o Arduino

O projeto foi estruturado para utilizar o Arduino como responsável pela coleta das informações dos sensores.

O fluxo previsto para funcionamento é:

```text
DHT22 ──────┐
            │
            ▼
         Arduino
            │
            │ Comunicação
            ▼
      Sistema SmartClass
            │
            ▼
       Interface Web

       O Arduino realiza as leituras dos sensores e os dados são enviados para o sistema, permitindo que as informações sejam apresentadas na interface.

🚨 Sistema de alertas

O sistema utiliza limites para identificar condições que precisam de atenção.

Exemplo de limites utilizados na interface:

Variável	Limite de alerta
Temperatura	28 °C
Umidade	70%
Luminosidade	350 ADC

Os valores podem ser ajustados de acordo com a necessidade da aplicação.

Quando uma leitura ultrapassar um limite definido, o sistema poderá registrar uma ocorrência na área de alertas.

📁 Estrutura do projeto
SmartClass/
│
├── index.html
├── monitoramento.html
├── alertas.html
├── style.css
├── script.js
│
└── README.md