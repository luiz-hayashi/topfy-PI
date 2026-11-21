var database = require("../database/config")


// aqui faz o insert de músicas quando o usuário clica nela no popup de sugestões
function cadastrar(musica, artista, genero, id_musica, id_artista, capa, foto_artista) { 

    console.log("salvei uma música ai")

    var instrucaoSql = `
        INSERT INTO musica (musica, artista, genero, id_musica, id_artista, capa, foto_artista) VALUES 
        (?, ?, ?, ?, ?, ?, ?);
    `;

    var valores = [musica, artista, genero, id_musica, id_artista, capa, foto_artista]

    return database.executar(instrucaoSql, valores);

}

// aqui eu faço a associação entre a música, e o usuário que a selecionou 
function associarUsuario(fk_usuario, fk_musica) {

    var instrucaoSql = `
        INSERT INTO usuario_musica (fk_usuario, fk_musica) VALUES
        (?, ?);
    `;

    return database.executar(instrucaoSql, [fk_usuario, fk_musica]);
}


// aqui é onde acontece a intrução para o SQL fazer SELECT, para exibir as músicas que já existem na playlist 
// do usuário
function listar(idUsuario) {

    var instrucaoSql = `
        SELECT m.id, m.id_musica, m.musica, m.artista, m.capa, m.genero
        FROM usuario_musica um
        JOIN musica m ON m.id = um.fk_musica
        WHERE um.fk_usuario = ?;
    `;

    return database.executar(instrucaoSql, [idUsuario]);

}

// caso o usuário remova a música da playlist usando aquele "x", vai ser removido primeiro a associação do BD
// e logo depois a própria música do BD (caso exista a mesma música pra mais de um usuário, só vai ser removida
// a que possui o id em que foi inserida pelo usuário) 

function removerAssociacao(fk_usuario, fk_musica) {

    var instrucaoSql = 
    `DELETE FROM usuario_musica WHERE fk_usuario = ? AND fk_musica = ?;`

    return database.executar(instrucaoSql, [fk_usuario, fk_musica]);

}

// aqui, caso o usuário opte por remover uma música da sua playlist, faz o delete do banco de dados

function removerMusica(id) {

    var instrucaoSql = 
    `DELETE FROM musica WHERE id = ? AND NOT EXISTS (SELECT 1 FROM usuario_musica WHERE fk_musica = ?);`

    return database.executar(instrucaoSql, [id, id]);

}

function atualizarGenero (idMusica, genero) {

    var instrucaoSql = 
    `UPDATE musica SET genero = ? WHERE id = ?;`

    return database.executar(instrucaoSql, [genero, idMusica])

}

module.exports = {

    associarUsuario,
    cadastrar,
    listar,
    removerAssociacao,
    removerMusica,
    atualizarGenero

};

// depois, fui e criei musicaController.js