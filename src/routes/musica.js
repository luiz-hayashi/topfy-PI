// aqui eu crio a rota para receber da API o que o controller vai filtrar, para fazer a inserção do banco de dados

var express = require("express")

var router = express.Router()

var musicaController = require("../controllers/musicaController");

// aqui ele resgata a requisição da API, e envia para a função de cadastrar música, enviada para controllerJS, 
// que envia para models

router.post("/cadastrar", function(req, res) {

    musicaController.cadastrar(req, res);

}) 

// aqui ele resgata a requisição da API, e envia para a função de associar música a um usuário, 
// enviada para controllerJS, que envia para models

router.post("/associar", function (req, res) {

    musicaController.associar(req, res)

})

// aqui é uma rota de requisição que dá get, ou seja, é uma consulta, não uma inserção.
// aqui acontece a listagem de músicas que já existem no banco de dados

router.get("/listar/:idUsuario", function (req, res) {

    musicaController.listar(req, res)

})

// aqui é a rota onde acontece a solicitação dos 

router.get("/dashboard/:idUsuario", function (req, res) {

    musicaController.dashboard(req, res);

});

// aqui é a rota por onde a solicitação de remoção de músicas passa
// note que é router.delete, enquanto a de consulta é -get-, e a de inserção é -post-

router.delete("/remover/:idUsuario/:idMusica", function (req, res) {

    musicaController.remover(req, res)

})

// aqui é a rota que acontece a solicitação de mudança do gênero da música.

router.put("/atualizar-genero/:idMusica", function(req, res) {

    musicaController.atualizarGenero(req, res)

})



module.exports = router

// agora eu vou mandar isso para appJs, que vai criar a entrada para minha aplicação, que vai receber 
// a requisição, e seguir o fluxo: 
// appJs -> musicaJs (route) -> musicaControllerJs (controller) -> musicaModelJs (model)