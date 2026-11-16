CREATE DATABASE IF NOT EXISTS topfy;

USE topfy;

CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	email VARCHAR(45) UNIQUE NOT NULL,
	senha VARCHAR(45) NOT NULL
);

CREATE TABLE musica (
	id INT PRIMARY KEY AUTO_INCREMENT,
    musica VARCHAR(45) NOT NULL,
	artista VARCHAR(45) NOT NULL,
	genero VARCHAR(45) NOT NULL,
    id_musica VARCHAR(100) NOT NULL,
    id_artista VARCHAR(100) NOT NULL
    );

CREATE TABLE usuario_musica (
	fk_usuario INT,
	fk_musica INT,
	PRIMARY KEY (fk_usuario, fk_musica),
		CONSTRAINT fk_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id),
		CONSTRAINT fk_musica FOREIGN KEY (fk_musica) REFERENCES musica(id)
);

