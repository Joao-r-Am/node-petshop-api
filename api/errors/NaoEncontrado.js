class NaoEncontrado extends Error{
    constructor() {
        super(`${nome} não foi encontrado`)
        this.name = 'NaoEncotrado'
        this.idErro = 0
    }
}

module.exports = NaoEncontrado