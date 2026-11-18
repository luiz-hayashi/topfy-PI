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

module.exports = router

// agora eu vou mandar isso para appJs, que vai criar a entrada para minha aplicação, que vai receber 
// a requisição, e seguir o fluxo: 
// appJs -> musicaJs (route) -> musicaControllerJs (controller) -> musicaModelJs (model)