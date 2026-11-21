// a rota só recebe a requisição, o controller trata a os dados recebidos, e o model salva no banco de dados (SQL)

var musicaModel = require("../models/musicaModel");

// aqui faz a tratativa de dados a serem recebidos pela requisicao (req.body), e valida se tem algo em branco

function cadastrar(req, res) {

    var { musica, artista, genero, id_musica, id_artista, capa, foto_artista} = req.body;

    if (!musica || !artista || !genero || !id_musica || !id_artista || !capa || !foto_artista) {

        res.status(400).send("Todos os campos são obrigatórios");

        return;

    }

    // se não tiver nada em branco, ele faz o cadastro dos dados que recebeu, e devolve o insert ID gerado pelo SQL
    // ou o erro se tiver dado errado ne

    musicaModel.cadastrar(musica, artista, genero, id_musica, id_artista, capa, foto_artista)
    .then(function (resultado) {

        res.json({ id: resultado.insertId, sucesso: true});

    })

    .catch(function (erro){

        res.status(500).json(erro.sqlMessage);

    })

}

// aqui ele pega a fk do usuario e da musica, chama a model

function associar(req, res) {

    var {fk_usuario, fk_musica} = req.body;

    musicaModel.associarUsuario(fk_usuario, fk_musica)
    .then(function () {

        res.json({sucesso: true});

    })

    // e se der erro ele mostra também

    .catch(function (erro) {

        res.status(500).json(erro.sqlMessage);

    })


}

// aqui ele faz o controle da listagem de músicas de acordo com o idusuario que está logado.

function listar(req, res) {

    var idUsuario = req.params.idUsuario;

    musicaModel.listar(idUsuario)
    .then(function (resultado) {

        res.json(resultado);

    })
    .catch(function (erro) {

        res.status(500).json(erro.sqlMessage);

    })

}

// aqui a função remover faz a tratativa da solicitação de remoção da música, e verifica se é possível por meio
// da condicional abaixo

function remover(req, res) {

    var idUsuario = req.params.idUsuario
    var idMusica = req.params.idMusica

    if (isNaN(idUsuario) || isNaN(idMusica)) {

        res.status(400).send('Os IDs são inválidos')
        
        return

    }

    musicaModel.removerAssociacao(idUsuario, idMusica)
    .then(function () {

        return musicaModel.removerMusica(idMusica)

    })

    .then(function () {

        res.json({sucesso: true})

    })

    .catch(function (erro){

        res.status(500).json(erro.sqlMessage)

    }) 


} 

// aqui acontece a verificação, e a função de atualizar o gênero por meio do controllers

function atualizarGenero(req, res) {

    var idMusica = req.params.idMusica

    var genero = req.body.genero

    if (isNaN(idMusica) || !genero || !genero.trim())  {

        res.status(400).send("Dados inválidos");

        return;

    }

    musicaModel.atualizarGenero(idMusica, genero.trim())

        .then(function () {

            res.json({sucesso:true})

        })

    .catch(function (erro) {

        res.status(500).json(erro.sqlMessage)

    })

}

module.exports = {

    cadastrar,
    associar,
    listar,
    remover,
    atualizarGenero

}

// depois, fui e criei musica.js, em routes, para criar a rota. 