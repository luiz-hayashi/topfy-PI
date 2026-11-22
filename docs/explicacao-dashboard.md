# Explicação completa da dashboard do Topfy

Este documento explica como a dashboard funciona do início ao fim: como a página é carregada, onde o ID do usuário é guardado, qual rota busca os dados, como o servidor consulta o banco e como cada resultado aparece no HTML, na lista de gêneros, no gráfico e nos cards.

O objetivo é permitir que um aluno consiga acompanhar o caminho de cada informação e explicar o que cada função faz.

---

## 1. Visão geral do fluxo

O caminho principal dos dados é:

```text
login
  → guarda ID e e-mail no sessionStorage
  → tela_dashboard.html valida a sessão
  → navegador chama GET /musica/dashboard/:idUsuario
  → rota encaminha a chamada ao controller
  → controller valida o ID e chama três funções do model
  → model executa consultas SQL no MySQL
  → controller devolve os resultados como JSON
  → JavaScript decide se mostra o estado vazio
  → JavaScript prepara e exibe resumo, gêneros, artistas e gráfico
```

Em termos de separação de responsabilidades:

- **HTML** define os elementos que aparecem na página.
- **CSS** define como esses elementos são apresentados.
- **JavaScript do navegador** solicita os dados e preenche os elementos.
- **Rota** recebe a URL e encaminha a requisição.
- **Controller** valida a requisição e coordena a resposta.
- **Model** contém as consultas SQL.
- **Banco de dados** guarda as músicas e as associações entre músicas e usuários.

---

## 2. Arquivos envolvidos

| Arquivo | Responsabilidade |
| --- | --- |
| `public/tela_dashboard.html` | Estrutura da tela e funções que carregam e exibem os dados |
| `public/js/grafico_dashboard.js` | Preparação dos dados e criação do gráfico de rosca |
| `public/css/tela_dashboard.css` | Aparência, posicionamento e adaptação a telas menores |
| `public/js/sessao.js` | Validação da sessão, nome do usuário e encerramento da sessão |
| `public/login.html` | Depois do login, guarda o ID e o e-mail no `sessionStorage` |
| `src/routes/musica.js` | Define a rota de consulta da dashboard |
| `src/controllers/musicaController.js` | Valida o ID, chama as consultas e monta o JSON |
| `src/models/musicaModel.js` | Define as consultas SQL de gêneros, artistas e resumo |
| `src/database/config.js` | Abre a conexão com o MySQL e executa as consultas |
| `app.js` | Configura o Express, serve a pasta `public` e registra os roteadores |

---

## 3. De onde vem o ID do usuário?

O ID usado pela dashboard é guardado no navegador durante o login.

Em `public/login.html`, depois que o servidor confirma que o login deu certo, o navegador lê o JSON da resposta e salva:

```js
sessionStorage.EMAIL_USUARIO = json.email;
sessionStorage.ID_USUARIO = json.id;
```

Esses valores ficam no `sessionStorage` da aba atual. A dashboard lê o ID com:

```js
var idUsuario = sessionStorage.ID_USUARIO;
```

O ID não é digitado na dashboard nem buscado pelo nome do usuário. Ele vem da resposta de autenticação do servidor.

### Validação e nome da sessão

No início de `public/tela_dashboard.html`, o `<body>` contém:

```html
<body onload="validarSessao(); carregarDashboard()">
```

Quando o carregamento da página termina, são chamadas duas funções, nesta ordem:

1. `validarSessao()`
2. `carregarDashboard()`

`validarSessao()`, definida em `public/js/sessao.js`, consulta `sessionStorage.EMAIL_USUARIO`.

- Quando o e-mail existe, a função pega a parte antes do `@` e coloca o texto no elemento HTML `#b_usuario`.
- Quando não existe, redireciona o navegador para a tela de login.

O nome exibido é, portanto, derivado do e-mail. Por exemplo, para `ana@exemplo.com`, a função mostra `ana`.

### Encerramento da sessão pela logo

O HTML define `onclick="limparSessao()"` na imagem da logo. A função `limparSessao()`, em `sessao.js`:

1. Executa `sessionStorage.clear()`, removendo os dados da sessão da aba.
2. Redireciona para `/index.html`.

---

## 4. Recursos carregados pelo HTML

No `<head>` de `public/tela_dashboard.html` são referenciados:

```html
<link rel="stylesheet" href="css/tela_dashboard.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2" defer></script>
<script src="./js/grafico_dashboard.js" defer></script>
<script src="./js/sessao.js"></script>
```

- O primeiro endereço carrega o CSS da página.
- Chart.js desenha o gráfico.
- `chartjs-plugin-datalabels` permite desenhar os percentuais dentro das fatias.
- `grafico_dashboard.js` contém a função que configura o gráfico.
- `sessao.js` contém as funções de sessão.

Os três primeiros scripts usam `defer`. Isso permite que o navegador leia o HTML antes de executar esses scripts e mantém a ordem em que aparecem: Chart.js, o plugin de rótulos e, depois, o código do gráfico.

O servidor permite acessar arquivos da pasta `public` por causa de `express.static(...)`, configurado em `app.js`.

---

## 5. Estrutura visual no HTML

### Navbar

Dentro do `<nav>` ficam:

- A logo, que também chama `limparSessao()` quando clicada.
- Links para Playlist, Dashboard e Quiz.
- O elemento `#b_usuario`, preenchido por `validarSessao()`.
- A imagem do usuário.

### Estado vazio

O elemento `.conteudo_pagina_vazio` contém:

- `imagens/sem-dashboard.png`.
- O texto “Você precisa adicionar músicas para ter acesso a Dashboard”.

Essa parte é mostrada quando o servidor informa que o total de músicas do usuário é zero.

### Painel principal

O elemento `<main class="dashboard">` organiza:

- Um parágrafo com ID `mensagem_dashboard`, destinado à mensagem de erro.
- `.painel_generos`, com o título, o canvas do gráfico e a lista de gêneros.
- `.painel_artistas`, com o título e o espaço onde os cartões dos artistas são criados.
- `.painel_resumo`, com os três cards de totais.

### Elementos que recebem dados

| Elemento HTML | Informação colocada nele |
| --- | --- |
| `#b_usuario` | Parte do e-mail antes do `@`, vinda do `sessionStorage` |
| `#total_musicas` | `dados.resumo.total_musicas` |
| `#total_artistas` | `dados.resumo.total_artistas` |
| `#total_generos` | `dados.resumo.total_generos` |
| `#lista_generos` | Itens de gênero e quantidade criados pelo JavaScript |
| `#lista_artistas` | Cartões de artistas criados pelo JavaScript |
| `#grafico_generos` | Canvas usado pelo Chart.js para desenhar a rosca |
| `#mensagem_dashboard` | Mensagem quando a requisição falha |

---

## 6. A requisição feita pelo navegador

### Função `carregarDashboard()`

Essa função está no `<script>` de `public/tela_dashboard.html`. Ela coordena o carregamento:

1. Lê `sessionStorage.ID_USUARIO`.
2. Faz um `fetch` para `/musica/dashboard/` seguido do ID.
3. Verifica se a resposta HTTP deu certo.
4. Converte a resposta para JSON.
5. Decide se existe música na playlist.
6. Se houver músicas, chama as funções que preparam e exibem os dados.
7. Se houver um erro na requisição, exibe a mensagem de erro.

O endereço chamado tem este formato:

```text
/musica/dashboard/:idUsuario
```

Para o usuário de ID `12`, por exemplo:

```text
/musica/dashboard/12
```

### `fetch`, `.then()` e `.catch()`

- `fetch(...)` inicia a requisição sem recarregar a página.
- O primeiro `.then()` recebe o objeto `resposta`.
- `resposta.ok` indica se o servidor respondeu com um status de sucesso.
- `throw new Error(...)` transforma uma resposta HTTP malsucedida em um erro tratado pelo `.catch()`.
- `resposta.json()` lê o corpo da resposta e transforma o JSON em objeto JavaScript.
- O segundo `.then()` recebe esse objeto em `dados`.
- `.catch()` trata erros de rede ou erros lançados pelos `.then()`.

O fluxo é assíncrono: o navegador continua funcionando enquanto espera o servidor e o banco responderem.

---

## 7. Como a URL chega ao controller

### Configuração em `app.js`

`app.js` registra o roteador de músicas:

```js
app.use("/musica", musicaRouter)
```

O mesmo arquivo registra `express.static(...)` para servir os arquivos de `public`. Também registra parsers para dados JSON e formulários e carrega as rotas da aplicação.

### Rota em `src/routes/musica.js`

A rota específica é:

```js
router.get("/dashboard/:idUsuario", function (req, res) {
    musicaController.dashboard(req, res);
});
```

`GET` é o método HTTP usado para consultar dados. `:idUsuario` é um parâmetro variável da URL. Express disponibiliza esse valor em `req.params.idUsuario`.

O prefixo `/musica` de `app.js` e o caminho `/dashboard/:idUsuario` da rota se juntam:

```text
app.js:                 /musica
src/routes/musica.js:   /dashboard/:idUsuario
URL completa:           /musica/dashboard/:idUsuario
```

A rota recebe a solicitação e encaminha o trabalho ao controller; ela não escreve a consulta SQL.

---

## 8. Controller: validação, chamadas e resposta

### Função `dashboard(req, res)`

Em `src/controllers/musicaController.js`, essa função:

1. Lê `req.params.idUsuario`.
2. Converte o valor usando `Number(...)`.
3. Verifica `Number.isInteger(idUsuario)` e se o número é maior que zero.
4. Se a validação falhar, retorna HTTP `400` com uma mensagem de ID inválido.
5. Se passar, chama as três consultas do model.

### Por que há três chamadas?

A dashboard precisa de três conjuntos diferentes de informação:

1. Contagem de músicas por gênero.
2. Os três artistas com mais músicas.
3. Os totais da playlist.

O controller usa `Promise.all()` para iniciar as três chamadas e aguardar todas:

```js
Promise.all([
    musicaModel.contarGeneros(idUsuario),
    musicaModel.contarArtistas(idUsuario),
    musicaModel.contarResumo(idUsuario)
])
```

`Promise.all()` recebe uma lista de operações assíncronas. Quando todas terminam, o `.then()` recebe uma lista `resultados`, na mesma ordem:

| Expressão | Resultado |
| --- | --- |
| `resultados[0]` | Linhas de gêneros |
| `resultados[1]` | Linhas de artistas |
| `resultados[2]` | Resultado da consulta de resumo |
| `resultados[2][0]` | Primeira linha do resumo |

A consulta de resumo produz uma linha com os três totais. Por isso o controller usa `[0]` para colocar essa linha em `resumo`.

### Formato do JSON retornado

O controller responde com uma estrutura semelhante a:

```json
{
  "generos": [
    { "genero": "Pop", "total": 6 },
    { "genero": "Metal", "total": 4 }
  ],
  "artistas": [
    {
      "id_artista": "artista-exemplo",
      "artista": "Nome do artista",
      "foto_artista": "https://exemplo/foto.jpg",
      "total": 3
    }
  ],
  "resumo": {
    "total_musicas": 17,
    "total_artistas": 10,
    "total_generos": 6
  }
}
```

Os números e nomes acima são apenas um exemplo do formato; os valores reais vêm do banco.

Se uma das consultas rejeitar sua Promise, o `.catch()` do controller responde com HTTP `500`. Como as chamadas estão no `Promise.all()`, uma falha em qualquer uma impede a resposta normal combinada.

---

## 9. Model e consultas SQL

As funções de consulta ficam em `src/models/musicaModel.js`. Elas usam as tabelas `usuario_musica` e `musica`:

- `usuario_musica` associa um usuário às músicas da playlist.
- `musica` contém dados como título, artista, gênero e fotos.
- O `JOIN` conecta a associação ao registro da música.
- `WHERE usuario_musica.fk_usuario = ?` limita os resultados ao usuário solicitado.

O `?` é um marcador de parâmetro. O ID é passado separadamente, por exemplo:

```js
database.executar(instrucaoSql, [idUsuario]);
```

Isso evita colocar o valor diretamente dentro do texto SQL e é também uma proteção importante contra SQL Injection.

### 9.1 `contarGeneros(idUsuario)`

Consulta utilizada para o gráfico e para a lista:

```sql
SELECT musica.genero, COUNT(*) AS total
FROM usuario_musica
JOIN musica ON musica.id = usuario_musica.fk_musica
WHERE usuario_musica.fk_usuario = ?
GROUP BY musica.genero
ORDER BY total DESC;
```

O que cada parte faz:

- `SELECT musica.genero`: retorna o nome do gênero.
- `COUNT(*) AS total`: conta quantas associações/músicas existem no grupo.
- `JOIN`: encontra os dados da música associada ao usuário.
- `WHERE`: considera apenas o usuário do ID recebido.
- `GROUP BY musica.genero`: forma um grupo para cada gênero.
- `ORDER BY total DESC`: coloca primeiro os gêneros com maior contagem.

Essa ordem é importante porque o navegador mantém os quatro primeiros como os gêneros mais ouvidos.

### 9.2 `contarArtistas(idUsuario)`

Essa consulta seleciona:

- `musica.id_artista`
- `musica.artista`
- `musica.foto_artista`
- `COUNT(*) AS total`

Ela relaciona músicas e usuário pelo mesmo `JOIN`, filtra pelo ID, agrupa pelas informações do artista e ordena por quantidade decrescente. `LIMIT 3` faz o banco retornar somente os três artistas mais ouvidos.

As fotos e os nomes dos cartões vêm diretamente das colunas `foto_artista` e `artista`.

### 9.3 `contarResumo(idUsuario)`

Essa consulta calcula três totais:

```sql
COUNT(*) AS total_musicas,
COUNT(DISTINCT musica.id_artista) AS total_artistas,
COUNT(DISTINCT musica.genero) AS total_generos
```

- `COUNT(*)` conta as músicas associadas ao usuário.
- `COUNT(DISTINCT musica.id_artista)` conta IDs de artista sem repetir.
- `COUNT(DISTINCT musica.genero)` conta gêneros sem repetir.

O resumo é uma consulta agregada sem `GROUP BY`, então devolve uma linha com os totais, inclusive quando eles são zero.

### 9.4 Execução em `src/database/config.js`

O model chama `database.executar(instrucaoSql, valores)`. Essa função:

1. Confere se a variável de ambiente está configurada para desenvolvimento ou produção.
2. Cria uma conexão MySQL usando `mysql2` e as configurações do ambiente.
3. Abre a conexão.
4. Executa o SQL com os valores fornecidos.
5. Fecha a conexão.
6. Resolve a Promise com os resultados, ou a rejeita se a consulta falhar.

As configurações de host, banco, usuário, senha e porta são lidas das variáveis de ambiente. `app.js` escolhe o arquivo `.env.dev` quando o ambiente está definido como desenvolvimento.

---

## 10. Decisão entre estado vazio e dashboard

Após converter a resposta para JSON, `carregarDashboard()` verifica:

```js
var temMusicas = Number(dados.resumo.total_musicas) > 0;
```

O `Number(...)` é usado porque o banco pode entregar valores como texto. A comparação produz `true` ou `false`.

### Quando há músicas

```js
estadoVazio.style.display = "none";
dashboard.style.display = "grid";
```

A imagem e a mensagem do estado vazio somem, e a dashboard é mostrada.

### Quando não há músicas

```js
estadoVazio.style.display = "flex";
dashboard.style.display = "none";
return;
```

A tela vazia aparece. O `return` encerra esse caminho da função para que ela não tente construir o gráfico ou listas sem dados.

### Quando a requisição falha

O `.catch()`:

1. Exibe o erro no console com `console.error(erro)`.
2. Coloca “Erro ao carregar os dados do dashboard.” no elemento `#mensagem_dashboard`.

Esse caminho é diferente de uma playlist vazia: playlist vazia é uma resposta válida com total zero; falha é um problema ao buscar ou processar a resposta.

---

## 11. Agrupamento dos gêneros em “Outros”

### Função `agruparGeneros(generos)`

O banco retorna todos os gêneros em ordem decrescente de quantidade. Essa função cria uma nova lista que será usada na tela:

1. Começa com `generosAgrupados = []`.
2. Começa com `totalOutros = 0`.
3. Percorre todos os gêneros com um `for`.
4. Quando `i < 4`, adiciona o gênero à lista sem alterar seu nome nem quantidade.
5. Para os itens seguintes, soma `Number(generos[i].total)` em `totalOutros`.
6. Se houver mais de quatro gêneros, adiciona `{ genero: "Outros", total: totalOutros }`.
7. Devolve a lista final.

Exemplo:

```text
Dados recebidos:
Pop 6, Metal 4, Rock 4, Soul 1, Shoegaze 1, Gospel 1

Dados para exibição:
Pop 6, Metal 4, Rock 4, Soul 1, Outros 3
```

“Outros” soma Shoegaze e Gospel nesse exemplo. Se houver quatro gêneros ou menos, a categoria “Outros” não é criada.

O total real de gêneros do card de resumo não muda. O agrupamento altera somente a forma de exibir a lista e o gráfico.

---

## 12. Funções que preenchem os elementos HTML

### 12.1 `mostrarResumo(resumo)`

Recebe o objeto `dados.resumo` e define o texto dos três números:

```js
document.getElementById("total_musicas").textContent = resumo.total_musicas;
document.getElementById("total_artistas").textContent = resumo.total_artistas;
document.getElementById("total_generos").textContent = resumo.total_generos;
```

`getElementById(...)` localiza o card pelo ID. `textContent` altera o texto que aparece. Os rótulos “Músicas”, “Artistas” e “Gêneros” já estão no HTML; a função troca somente os valores numéricos.

### 12.2 `mostrarGeneros(generos)`

Recebe a lista já agrupada:

1. Localiza `#lista_generos`.
2. Limpa o conteúdo anterior com `innerHTML = ""`.
3. Percorre cada gênero usando `for`.
4. Cria um `<li>` com `document.createElement("li")`.
5. Define o texto, por exemplo, “Pop: 6 músicas”.
6. Anexa o item com `appendChild`.

`textContent` é usado para inserir o conteúdo como texto, em vez de interpretar o nome como HTML.

O percentual não aparece na lista: ele é exibido nas fatias do gráfico. A lista mostra o nome e a quantidade de músicas.

### 12.3 `mostrarArtistas(artistas)`

Recebe os até três artistas retornados pela consulta:

1. Localiza `#lista_artistas`.
2. Limpa cartões anteriores com `innerHTML = ""`.
3. Percorre a lista com `for`.
4. Cria um `<div>`, um `<img>` e um `<p>`.
5. Define `imagem.src` com `artista.foto_artista`.
6. Define `imagem.alt` com “Foto de ” seguido do nome.
7. Define o parágrafo como a posição (`i + 1`) e o nome.
8. Usa `appendChild` para montar o cartão e colocá-lo em `#lista_artistas`.

Como a consulta já usa `ORDER BY total DESC`, o índice zero corresponde ao artista mais ouvido. Somar um ao índice transforma `0, 1, 2` nas posições `1º, 2º, 3º`.

---

## 13. Criação do gráfico de rosca

### Função `criarGraficoGeneros(generos)`

Essa função está isolada em `public/js/grafico_dashboard.js`. Ela recebe a mesma lista agrupada usada por `mostrarGeneros()`.

#### Preparação dos arrays

Primeiro encontra o canvas:

```js
var canvas = document.getElementById("grafico_generos");
```

Depois cria dois arrays vazios:

```js
var nomesGeneros = [];
var quantidades = [];
```

O `for` percorre os gêneros:

- `generos[i].genero` vai para `nomesGeneros`.
- `Number(generos[i].total)` vai para `quantidades`.

Converter `total` para número é importante porque o Chart.js precisa de valores numéricos para calcular o tamanho de cada fatia.

#### Configuração do Chart.js

```js
new Chart(canvas, {
    type: "doughnut",
    ...
});
```

- `canvas` indica onde o gráfico será desenhado.
- `type: "doughnut"` escolhe o tipo rosca.
- `labels` recebe os nomes dos gêneros.
- `datasets[0].data` recebe as quantidades.
- `backgroundColor` define as cores das fatias.
- `borderWidth: 0` remove a borda padrão das fatias.
- `responsive: true` permite que o gráfico se adapte à área disponível.
- `maintainAspectRatio: false` permite que a altura definida pelo CSS seja respeitada.
- `cutout: "55%"` define o tamanho do espaço no centro da rosca.
- `legend.display: false` desliga a legenda automática do Chart.js; a página tem uma lista HTML própria ao lado do gráfico.

### Plugin de rótulos e percentual

O Chart.js é carregado junto com `chartjs-plugin-datalabels`. A configuração `plugins: [ChartDataLabels]` habilita o plugin para esse gráfico.

Dentro de `options.plugins.datalabels`, o `formatter(valor, contexto)` define o texto de cada rótulo:

1. Lê os valores das fatias por `contexto.dataset.data`.
2. Soma esses valores em `total`.
3. Se o total for zero, devolve texto vazio.
4. Divide o valor da fatia por `total`, multiplica por 100 e formata com uma casa decimal.
5. Acrescenta `%`.

Por exemplo:

```text
6 músicas / 17 músicas × 100 = 35,3%
```

O percentual fica dentro da respectiva fatia. O estilo do rótulo é branco e em negrito, com contorno preto definido por `textStrokeColor` e `textStrokeWidth`.

Como o array inclui “Outros” com sua soma, essa fatia também recebe seu percentual.

---

## 14. Como o CSS organiza os painéis

O arquivo `public/css/tela_dashboard.css` cuida da apresentação. Ele não consulta o servidor nem calcula os dados.

### Dashboard principal

`.dashboard` usa CSS Grid para organizar o painel de gêneros de um lado e a coluna de artistas e resumo do outro. A largura, altura máxima, margens e espaçamentos ajudam a limitar a área ocupada pela dashboard.

### Painel de gêneros

`.painel_generos` usa Grid interno:

- O título ocupa as duas colunas e fica centralizado no topo.
- O container `.grafico_de_generos` ocupa a coluna do gráfico.
- `#lista_generos` ocupa a coluna da legenda.
- O padding do container do canvas cria espaço entre o gráfico e a borda do painel.

As bolinhas de cor da lista usam `::before`. Os seletores `:nth-child(1)`, `:nth-child(2)` e seguintes aplicam cores de acordo com a posição. Como a lista e o gráfico recebem a lista agrupada na mesma ordem, as cores acompanham as posições correspondentes.

### Painel de artistas

`#lista_artistas` é uma área Flexbox. Cada cartão é um filho `<div>`. A propriedade CSS `order` muda somente a ordem visual:

- Primeiro artista recebido: fica centralizado.
- Segundo artista recebido: fica à direita.
- Terceiro artista recebido: fica à esquerda.

Isso não altera os nomes nem as posições escritas nos cartões. As larguras das imagens definem o tamanho do pódio: 80% para o primeiro, 65% para o segundo e 50% para o terceiro, com limites máximos em pixels.

### Cards de resumo

`.cartoes-resumo` usa Flexbox para colocar os três cards lado a lado. Cada `.cartao-resumo` usa Flexbox para centralizar vertical e horizontalmente o número e seu rótulo.

### Telas menores

As media queries modificam o layout conforme a largura:

- Até `800px`, a dashboard passa de duas colunas para uma; no painel de gêneros, gráfico e lista ficam empilhados.
- Até `500px`, alguns tamanhos e espaçamentos dos artistas e cards são ajustados para a largura menor.

---

## 15. Funções e recursos JavaScript usados

| Recurso | Uso na dashboard |
| --- | --- |
| `sessionStorage` | Lê o ID e o e-mail guardados no login |
| `fetch()` | Solicita os dados ao servidor |
| `.then()` | Continua o processamento quando uma operação assíncrona termina |
| `.catch()` | Trata erros da requisição ou do processamento |
| `Number()` | Converte valores recebidos para número |
| `Promise.all()` | Aguarda as três consultas do controller |
| `for` | Percorre os gêneros, artistas e valores do gráfico |
| `push()` | Adiciona itens a arrays |
| `getElementById()` | Localiza elementos pelo ID |
| `querySelector()` | Localiza elementos pela classe |
| `createElement()` | Cria `<li>`, `<div>`, `<img>` e `<p>` |
| `appendChild()` | Coloca os elementos criados dentro de seus containers |
| `textContent` | Atualiza texto na tela |
| `innerHTML = ""` | Limpa uma lista antes de montá-la novamente |
| `style.display` | Alterna a exibição entre dashboard e estado vazio |
| `Chart(...)` | Cria o gráfico com Chart.js |

---

## 16. Exemplo completo com números

Imagine que as consultas retornem:

```text
Gêneros:
Pop 6, Metal 4, Rock 4, Soul 1, Shoegaze 1, Gospel 1

Artistas:
Artista A 3 músicas, Artista B 2 músicas, Artista C 1 música

Resumo:
17 músicas, 10 artistas, 6 gêneros
```

O navegador processa assim:

1. `agruparGeneros()` mantém Pop, Metal, Rock e Soul.
2. Soma Shoegaze e Gospel em `Outros: 2`.
3. `mostrarGeneros()` monta cinco itens: os quatro nomes e Outros, exibindo as quantidades.
4. `criarGraficoGeneros()` cria cinco fatias com os mesmos valores.
5. O `formatter` calcula o percentual de cada uma sobre o total representado.
6. `mostrarArtistas()` cria três cartões numerados na ordem retornada pelo banco.
7. `mostrarResumo()` preenche 17, 10 e 6 nos três cards.

---

## 17. Pontos importantes para explicar na apresentação

Você pode resumir a funcionalidade assim:

> “A página pega o ID do usuário da sessão e chama a rota `/musica/dashboard/:idUsuario`. A rota encaminha ao controller, que valida o ID e pede ao model três resultados: gêneros, artistas e resumo. O model consulta o MySQL. Quando o JSON volta, o JavaScript verifica se há músicas. Se houver, agrupa gêneros menos ouvidos em ‘Outros’, preenche os cards e listas e passa os gêneros para o Chart.js. Se não houver, mostra a imagem de dashboard indisponível.”

Alguns detalhes para lembrar:

- O banco decide a ordem dos gêneros e artistas por quantidade.
- O controller não escreve o SQL; ele coordena model e resposta HTTP.
- O model não monta a interface; ele consulta o banco.
- O CSS não busca nem altera os dados; apenas os apresenta.
- “Outros” é uma soma para exibição. O total de gêneros do resumo continua vindo da consulta original.
- A lista mostra quantidade de músicas; os percentuais aparecem dentro das fatias do gráfico.
- A categoria “Outros” só existe visualmente quando há mais de quatro gêneros.
