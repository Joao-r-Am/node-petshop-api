const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const NaoEncontrado = require('./errors/NaoEncontrado')
const CampoInvalido = require('./errors/CampoInvalido')
const DadosNaoForncecidos = require('./errors/DadosNaoForncecidos')
const ValorNaoSuportado = require('./errors/ValorNaoSuportado')
const formatosAceitos = require('./Serializador').formatosAceitos
const SerializadorErro = require('./Serializador').SerializadorErro

app.use(bodyParser.json())

app.use((requisicao, resposta, proximo) => {
    let formatoRequisitado = requisicao.header('Accept')

    if(formatoRequisitado === '*/*') {
        formatoRequisitado = 'application/json'
    }

    if(formatosAceitos.indexOf(formatoRequisitado) === -1) {
        resposta.status(406)
        resposta.end()
        return
    }

    resposta.setHeader('Content-Type', formatoRequisitado)
    proximo()
})

app.use((requisicao, resposta, proximo) => {
    resposta.set('Access-Control-Allow-Origin', '*')
    proximo()
})

const roteador = require('./rotas/fornecedores')
app.use('/api/fornecedores', roteador)

const roteadorV2 = require('./rotas/fornecedores/rotas.v2')
app.use('/api/v2/fornecedores/', roteadorV2)

app.use((erro, requisicao, resposta, proximo) => {
    let status = 500

    if(erro instanceof NaoEncontrado){
        status = 404
    }

    if(erro instanceof CampoInvalido || erro instanceof DadosNaoForncecidos){
        status = 400
    }

    if(erro instanceof ValorNaoSuportado) {
        status = 406
    }

    const serializador = new SerializadorErro(
        resposta.getHeader('Content-Type')
    )

    resposta.status(status)
    resposta.send(
        serializador.serializar({
            mensagem: erro.message,
            id: erro.idErro
        })
    )
})
app.listen(config.get('api.porta'), () => console.log('A api esta funfando'))