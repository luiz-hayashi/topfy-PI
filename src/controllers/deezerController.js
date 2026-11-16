function buscar(req, res) {

    /* AQUI ACONTECE A REQUISIÇÃO DE MÚSICAS A SEREM PESQUISADAS PARA A API DO DEEZER */

    var busca = req.query.q

    fetch("https://api.deezer.com/search/track?limit=8&q=" + encodeURIComponent(busca))

    .then(function (resposta) {

        return resposta.json();

    })

    /* AQUI EU BUSCO O JASON DE TODAS AS RESPOSTAS PROVAVÉIS E LIMITO A 8*/

    .then(function (dados) {

        var lista = []

        for (i = 0; i < dados.data.length; i++) {

            lista.push({ 

                id_musica: dados.data[i].id,
                musica: dados.data[i].title,
                id_artista: dados.data[i].artist.id,
                artista: dados.data[i].artist.name,
                foto_artista: dados.data[i].artist.picture_xl,
                capa: dados.data[i].album.cover_medium

             });

        }

        res.json(lista)

    })

    .catch(function (erro) {

        console.log(erro);
        res.status(500).send("Deu erro");

    });

    

}

module.exports = {

    buscar

}