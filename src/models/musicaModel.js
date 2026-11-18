var database = require("../database/config")


// aqui faz o insert de músicas quando o usuário clica nela no popup de sugestões
function cadastrar(musica, artista, genero, id_musica, id_artista, capa, foto_artista) { 

    console.log("salvei uma música ai")

    var instrucaoSql = `
        INSERT INTO musica (musica, artista, genero, id_musica, id_artista, capa, foto_artista) VALUES 
        ('${musica}', '${artista}', '${genero}', '${id_musica}', '${id_artista}', '${capa}', '${foto_artista}');
    `;

    return database.executar(instrucaoSql);
}

// aqui eu faço a associação entre a música, e o usuário que a selecionou 
function associarUsuario(fk_usuario, fk_musica) {

    var instrucaoSql = `
        INSERT INTO usuario_musica (fk_usuario, fk_musica) VALUES
        ('${fk_usuario}', '${fk_musica}');
    `;

    return database.executar(instrucaoSql);

}

module.exports = {

    associarUsuario,
    cadastrar

};

// depois, fui e criei musicaController.js