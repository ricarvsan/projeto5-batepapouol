axios.defaults.headers.common['Authorization'] = 'zTIKqgYY2CkJVaSquSYb4aJo';

let nome = {};
let listaMsgsRecebidas = [];
let msgs = [];
let resolicitarNome = 0;
let nomeDigitado = "";
let listaDeParticipantes = [];
let iniciaAtualizacaoPagina = 0;
let msgEnvio = {};

function abrirListaParticipantes() {
    const participantes = document.querySelector('.lista');
    participantes.classList.remove('hide-list');

    const promessa = axios.get('https://mock-api.driven.com.br/api/vm/uol/participants');
    promessa.then(resposta => { listaDeParticipantes = resposta.data;
        console.log(listaDeParticipantes);
        }
    );
    
}

function fecharListaParticipantes() {
    const participantes = document.querySelector('.lista');
    participantes.classList.add('hide-list');
}

function manterConexao(){
    const promessa = axios.post('https://mock-api.driven.com.br/api/vm/uol/status', nome);
    promessa.catch(resposta => alert(`Deslogado devido ao erro ${resposta.response.status}`));
}

function respostaEnvioNome(resposta){ 
    if(resposta.status === 200) {
        setInterval(manterConexao, 5000);
        renderizarMsgs();
    }
}

function erroEnvioNome(erro){
    if(erro.response.status === 400){
        resolicitarNome++;
        solicitarNome();
    }
}

function solicitarNome(){
    if(resolicitarNome < 1) {
        nomeDigitado = prompt("Digite seu nome:\n");
    } else {
        nomeDigitado = prompt("O nome digitado é inválido ou já está em uso\nPor gentileza digite outro nome:\n");
    }

    nome = {
        name: nomeDigitado
    }

    promessa = axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', nome);
    promessa.then(respostaEnvioNome);
    promessa.catch(erroEnvioNome);       
}

function renderizarMsgs(){
    const promessa = axios.get('https://mock-api.driven.com.br/api/vm/uol/messages');
    promessa.then(receberMsgs);

    if(!iniciaAtualizacaoPagina){
        setInterval(renderizarMsgs, 3000);
        iniciaAtualizacaoPagina++;
    }
}

function enviarMsg() {
    let campoEnviarMsg = document.querySelector('.mensagem-envio');    

    msgEnvio = {
        from: nome.name,
        to: "Todos",
        text: campoEnviarMsg.value,
        type: "message"
    };    
    
    if(campoEnviarMsg.value !== ''){
        console.log(msgEnvio);
        const promessa = axios.post('https://mock-api.driven.com.br/api/vm/uol/messages', msgEnvio);
        promessa.then(resposta => console.log(resposta));
        renderizarMsgs();
        promessa.catch(resposta => console.log(resposta));
        campoEnviarMsg.value = "";
    }    
} 

function receberMsgs(resposta){
    listaMsgsRecebidas = resposta.data;

    const ulMsgs = document.querySelector('.mensagens');
    ulMsgs.innerHTML = '';

    for( let i = 0; i < listaMsgsRecebidas.length; i++){
        let msg = listaMsgsRecebidas[i];
        
        if(msg.type === "status") {
            ulMsgs.innerHTML += `
            <li data-test="message" class="e-s">
                <p><span class="time">(${msg.time})</span> <span class="nome">${msg.from}</span> ${msg.text}</p>
            </li>
        `;
        } else if (msg.type === "private_message"){
            ulMsgs.innerHTML += `
            <li data-test="message" class="pm">
                <p><span class="time">(${msg.time}) </span><span class="nome">${msg.from} </span>reservadamente para <span class="nome">${msg.to}: </span>${msg.text}</p>
            </li>
        `;
        } else {
            ulMsgs.innerHTML += `
            <li data-test="message">
                <p><span class="time">(${msg.time}) </span><span class="nome">${msg.from} </span>para <span class="nome">${msg.to}: </span>${msg.text}</p>
            </li>
        `;
        }
    }
}



solicitarNome();
