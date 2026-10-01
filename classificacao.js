const SUPABASE_URL =
    "https://qaegmrobufjplzyyslkd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


let salas = [];


const botaoMostrarProvas =
    document.getElementById(
        "botaoMostrarProvas"
    );

const areaProvas =
    document.getElementById(
        "areaProvas"
    );

const classificacaoGeral =
    document.getElementById(
        "classificacaoGeral"
    );

const classificacoesProvas =
    document.getElementById(
        "classificacoesProvas"
    );

const mensagem =
    document.getElementById(
        "mensagem"
    );


/* =================================
   CARREGAR SALAS
================================= */

async function carregarSalas() {

    const { data, error } = await banco
        .from("salas")
        .select("sala,pontos,pontos_provas")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(error);

        if (mensagem) {

            mensagem.innerHTML = `
                <p style="color:red;">
                    Erro ao carregar a classificação:
                    ${error.message}
                </p>
            `;

        }

        return;
    }


    salas = data || [];


    mostrarClassificacaoGeral();

}


/* =================================
   CLASSIFICAÇÃO GERAL
================================= */

function mostrarClassificacaoGeral() {

    if (!classificacaoGeral) return;


    if (salas.length === 0) {

        classificacaoGeral.innerHTML =
            "<p>Nenhuma sala cadastrada.</p>";

        return;
    }


    const ranking = [...salas];


    ranking.sort(
        (a, b) =>
            Number(b.pontos || 0) -
            Number(a.pontos || 0)
    );


    let html = "";


    ranking.forEach(function (sala, index) {

        const posicao = index + 1;

        const pontos =
            Number(sala.pontos || 0);


        const medalha =
            posicao === 1
                ? "🥇"
                : posicao === 2
                ? "🥈"
                : posicao === 3
                ? "🥉"
                : `${posicao}º`;


        html += `
            <div class="item-ranking">

                <span class="posicao">
                    ${medalha}
                </span>

                <strong>
                    ${sala.sala}
                </strong>

                <span>
                    ${pontos} pontos
                </span>

            </div>
        `;

    });


    classificacaoGeral.innerHTML = html;

}


/* =================================
   BOTÃO DAS PROVAS
================================= */

if (botaoMostrarProvas) {

    botaoMostrarProvas.addEventListener(
        "click",
        function () {

            if (
                areaProvas.style.display ===
                "block"
            ) {

                areaProvas.style.display =
                    "none";

                botaoMostrarProvas.textContent =
                    "Ver pontuação por prova";

                return;
            }


            mostrarClassificacoesProvas();


            areaProvas.style.display =
                "block";

            botaoMostrarProvas.textContent =
                "Ocultar pontuação por prova";

        }
    );

}


/* =================================
   PONTUAÇÃO DE CADA PROVA
================================= */

function mostrarClassificacoesProvas() {

    if (!classificacoesProvas) return;


    if (salas.length === 0) {

        classificacoesProvas.innerHTML =
            "<p>Nenhuma sala cadastrada.</p>";

        return;
    }


    let html = "";


    /*
       Cria a classificação
       das 8 provas.
    */

    for (
        let numeroProva = 0;
        numeroProva < 8;
        numeroProva++
    ) {


        const ranking = salas.map(
            function (sala) {

                const pontosProvas =
                    Array.isArray(
                        sala.pontos_provas
                    )
                        ? sala.pontos_provas
                        : [
                            0,0,0,0,
                            0,0,0,0
                        ];


                return {

                    sala: sala.sala,

                    pontos: Number(
                        pontosProvas[
                            numeroProva
                        ] || 0
                    )

                };

            }
        );


        /*
           Ordena as salas pela
           pontuação da prova.
        */

        ranking.sort(
            (a, b) =>
                b.pontos - a.pontos
        );


        html += `
            <div
                class="classificacao-prova"
                style="
                    margin-top:20px;
                    padding:15px;
                    border:1px solid #ddd;
                    border-radius:8px;
                "
            >

                <h3>
                    Prova ${numeroProva + 1}
                </h3>
        `;


        ranking.forEach(
            function (sala, index) {

                const posicao =
                    index + 1;


                const medalha =
                    posicao === 1
                        ? "🥇"
                        : posicao === 2
                        ? "🥈"
                        : posicao === 3
                        ? "🥉"
                        : `${posicao}º`;


                html += `
                    <div class="item-ranking">

                        <span class="posicao">
                            ${medalha}
                        </span>

                        <strong>
                            ${sala.sala}
                        </strong>

                        <span>
                            ${sala.pontos} pontos
                        </span>

                    </div>
                `;

            }
        );


        html += `
            </div>
        `;

    }


    classificacoesProvas.innerHTML =
        html;

}


/* =================================
   INICIAR
================================= */

carregarSalas();
