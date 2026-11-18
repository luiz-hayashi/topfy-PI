var express = require("express");
var router = express.Router();

var deezerController = require("../controllers/deezerController");

// aqui eu tô criando a função de busca para realizar a requisição para buscar as músicas dentro da API do Deezer
router.get("/buscar", function (req, res) {
    deezerController.buscar(req, res);
})

module.exports = router;