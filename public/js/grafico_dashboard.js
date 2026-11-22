function criarGraficoGeneros(generos) {
    var canvas = document.getElementById("grafico_generos");
    var nomesGeneros = [];
    var quantidades = [];

    for (var i = 0; i < generos.length; i++) {
        nomesGeneros.push(generos[i].genero);
        quantidades.push(Number(generos[i].total));
    }

    new Chart(canvas, {
        type: "doughnut",
        plugins: [ChartDataLabels],
        data: {
            labels: nomesGeneros,
            datasets: [{
                data: quantidades,
                backgroundColor: [
                    "#4b7bec",
                    "#a678f0",
                    "#f5b65c",
                    "#ffda4a",
                    "#e56b6f",
                    "#49b8a5"
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
                datalabels: {
                    color: "#ffffff",
                    textStrokeColor: "#000000",
                    textStrokeWidth: 2,
                    font: {
                        weight: "bold",
                        size: 13
                    },
                    formatter: function (valor, contexto) {
                        var valores = contexto.dataset.data;
                        var total = 0;

                        for (var i = 0; i < valores.length; i++) {
                            total += Number(valores[i]);
                        }

                        if (total === 0) {
                            return "";
                        }

                        return ((valor / total) * 100).toFixed(1) + "%";
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}
