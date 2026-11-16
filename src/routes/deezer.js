var express = require("express");
var router = express.Router();

var deezerController = require("../controllers/deezerController");

//Recebendo os dados do html e direcionando para a função de busca de deezerController.js
router.get("/buscar", function (req, res) {
    deezerController.buscar(req, res);
})

module.exports = router;