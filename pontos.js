const SUPABASE_URL = "https://qaegmrobufjplzyyslkd.supabase.co";
const SUPABASE_KEY = "sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const SENHA_PADRAO = "1234";

const campoSenha =
    document.getElementById("senha");

const botaoEntrar =
    document.getElementById("entrar");

const login =
    document.getElementById("login");

const sistema =
    document.getElementById("sistema");

const mensagemLogin =
    document.getElementById("mensagemLogin");

const listaSalas =
    document.getElementById("listaSalas");

const ranking =
    document.getElementById("ranking");

const senhaAtual =
    document.getElementById("senhaAtual");

const novaSenha =
    document.getElementById("novaSenha");

const botaoAlterarSenha =
    document.getElementById("alterarSenha");

const mensagemSenha =
    document.getElementById("mensagemSenha");

const botaoSair =
    document.getElementById("sair");

let senhaSistema =
    localStorage.getItem(
        "senhaSistema"
    );

if (senhaSistema === null) {

    senhaSistema = SENHA_PADRAO;

    localStorage.setItem(
        "senhaSistema",
        senhaSistema
    );
}

botaoEntrar.addEventListener(
    "click",
    async function () {

        const senhaDigitada =
            campoSenha.value;

        if (senhaDigitada === senhaSistema) {

            login.style.display =
                "none";

            sistema.style.display =
                "block";

            campoSenha.value = "";

            mensagemLogin.textContent =
                "";

            await mostrarSalas();
            mostrarRanking();

        } else {

            mensagemLogin.textContent =
                "Senha incorreta!";

            mensagemLogin.style.color =
                "#d90429";
        }
    }
);

async function buscarSalas() {

    const { data, error } =
        await supabaseClient
            .from("salas")
            .select("*")
            .order("id", {
                ascending: true
            });

    if (error) {

        console.error(error);

        return [];
    }

    return data || [];
}

async function mostrarSalas() {

    const salas =
        await buscarSalas();

    listaSalas.innerHTML = "";

    if (salas.length === 0) {

        listaSalas.innerHTML =
            "<p>Nenhuma sala cadastrada.</p>";

        return;
    }

    salas.forEach(
        function (sala, indice) {

            const provas =
                Array.isArray(sala.provas)
                    ? sala.provas
                    : [];

            const pontosProvas =
                Array.isArray(
                    sala.pontos_provas
                )
                    ? sala.pontos_provas
                    : Array(8).fill(0);

            let provasHTML = "";

            provas.forEach(
                function (
                    participante,
                    numero
                ) {

                    const pontos =
                        Number(
                            pontosProvas[
                                numero
                            ] || 0
                        );

                    provasHTML += `
                        <div class="prova">

                            <strong>
                                Prova ${numero + 1}
                            </strong>

                            <p>
                                Participantes da equipe ${numero + 1}:

                                <strong>
                                    ${participante || "Não informado"}
                                </strong>
                            </p>

                            <label>
                                Pontos:
                            </label>

                            <input
                                type="number"
                                min="0"
                                value="${pontos}"
                                id="pontos-${indice}-${numero}"
                            >

                        </div>
                    `;
                }
            );

            const total =
                calcularTotal(
                    pontosProvas
                );

            listaSalas.innerHTML += `
                <div class="cadastro">

                    <h2>
                        Sala: ${sala.sala}
                    </h2>

                    <p>
                        <strong>
                            Número de participantes:
                        </strong>

                        ${sala.participantes}
                    </p>

                    <h3>
                        Provas
                    </h3>

                    <div class="lista-provas">
                        ${provasHTML}
                    </div>

                    <h3 class="total">

                        Total:

                        <span
                            id="total-${indice}">

                            ${total}

                        </span>

                        pontos

                    </h3>

                    <button
                        type="button"
                        onclick="salvarPontos(${indice})">

                        Salvar pontuação

                    </button>

                    <p
                        id="mensagemPontos-${indice}"
                        class="mensagem-pontos">
                    </p>

                </div>
            `;
        }
    );
}

function calcularTotal(
    pontosProvas
) {

    return pontosProvas.reduce(
        function (total, pontos) {

            return total +
                Number(pontos || 0);

        },
        0
    );
}

async function salvarPontos(indice) {

    const salas =
        await buscarSalas();

    const sala =
        salas[indice];

    if (!sala) {
        return;
    }

    const mensagem =
        document.getElementById(
            `mensagemPontos-${indice}`
        );

    const pontosProvas = [];

    for (let i = 0; i < 8; i++) {

        const campo =
            document.getElementById(
                `pontos-${indice}-${i}`
            );

        const pontos =
            Number(campo.value);

        if (pontos < 0) {

            mensagem.textContent =
                "Os pontos não podem ser negativos.";

            mensagem.style.color =
                "#d90429";

            return;
        }

        pontosProvas.push(pontos);
    }

    const total =
        calcularTotal(
            pontosProvas
        );

    const { error } =
        await supabaseClient
            .from("salas")
            .update({
                pontos_provas: pontosProvas,
                pontos: total
            })
            .eq("id", sala.id);

    if (error) {

        mensagem.textContent =
            "Erro ao salvar a pontuação.";

        mensagem.style.color =
            "#d90429";

        console.error(error);

        return;
    }

    mensagem.textContent =
        "✓ Pontuação salva com sucesso!";

    mensagem.style.color =
        "#008000";

    await mostrarSalas();
    mostrarRanking();
}

async function mostrarRanking() {

    const salas =
        await buscarSalas();

    ranking.innerHTML = "";

    if (salas.length === 0) {

        ranking.innerHTML =
            "<p>Nenhuma sala cadastrada.</p>";

        return;
    }

    const rankingSalas =
        [...salas];

    rankingSalas.sort(
        function (a, b) {

            return Number(b.pontos || 0) -
                Number(a.pontos || 0);
        }
    );

    rankingSalas.forEach(
        function (sala, indice) {

            const posicao =
                indice + 1;

            const pontos =
                Number(
                    sala.pontos || 0
                );

            let medalha = "";

            if (posicao === 1) {

                medalha = "🥇";

            } else if (posicao === 2) {

                medalha = "🥈";

            } else if (posicao === 3) {

                medalha = "🥉";

            } else {

                medalha =
                    `${posicao}º`;
            }

            ranking.innerHTML += `
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
        }
    );
}

botaoAlterarSenha.addEventListener(
    "click",
    function () {

        const senhaAntiga =
            senhaAtual.value;

        const senhaNova =
            novaSenha.value;

        if (
            senhaAntiga !==
            senhaSistema
        ) {

            mensagemSenha.textContent =
                "A senha atual está incorreta.";

            mensagemSenha.style.color =
                "#d90429";

            return;
        }

        if (
            senhaNova.length < 4
        ) {

            mensagemSenha.textContent =
                "A nova senha deve ter pelo menos 4 caracteres.";

            mensagemSenha.style.color =
                "#d90429";

            return;
        }

        senhaSistema =
            senhaNova;

        localStorage.setItem(
            "senhaSistema",
            senhaNova
        );

        mensagemSenha.textContent =
            "✓ Senha alterada com sucesso!";

        mensagemSenha.style.color =
            "#008000";

        senhaAtual.value = "";
        novaSenha.value = "";
    }
);

botaoSair.addEventListener(
    "click",
    function () {

        sistema.style.display =
            "none";

        login.style.display =
            "block";

        mensagemLogin.textContent =
            "";
    }
);

window.salvarPontos =
    salvarPontos;