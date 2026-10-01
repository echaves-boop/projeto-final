const SUPABASE_URL = "https://qaegmrobufjplzyyslkd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";

let banco;

let salas = [];

document.addEventListener("DOMContentLoaded", function () {

    banco = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    carregarSalas();

});


async function cadastrarSala() {

    const sala =
        document.getElementById("sala").value.trim();

    const participantes =
        document.getElementById("participantes").value.trim();


    if (sala === "") {

        alert("Digite o nome da sala.");

        return;
    }


    if (participantes === "") {

        alert("Digite o número de participantes.");

        return;
    }


    if (Number(participantes) < 4) {

        alert("A sala precisa ter pelo menos 4 participantes.");

        return;
    }


    const provas = [];

    const descricoes = [];


    for (let i = 1; i <= 8; i++) {

        const descricao =
            document.getElementById(
                "descricao" + i
            ).value.trim();


        const prova =
            document.getElementById(
                "prova" + i
            ).value.trim();


        if (descricao === "") {

            alert(
                "Preencha a descrição da Prova " +
                i +
                "."
            );

            return;
        }


        if (prova === "") {

            alert(
                "Preencha os participantes da Prova " +
                i +
                "."
            );

            return;
        }


        descricoes.push(descricao);

        provas.push(prova);
    }


    const senha =
        prompt(
            "Digite uma senha para esta sala:"
        );


    if (senha === null) {

        return;
    }


    if (senha.trim() === "") {

        alert("A senha não pode ficar vazia.");

        return;
    }


    const dados = {

        sala: sala,

        participantes: Number(participantes),

        provas: provas,

        descricoes: descricoes,

        senha: senha,

        pontos: 0,

        pontos_provas: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]
    };


    const { error } =
        await banco
            .from("salas")
            .insert([dados]);


    if (error) {

        console.error(error);

        alert(
            "Erro ao cadastrar sala:\n" +
            error.message
        );

        return;
    }


    alert("Sala cadastrada com sucesso!");

    limparTudo();

    carregarSalas();
}


function limparTudo() {

    document.getElementById("sala").value = "";

    document.getElementById("participantes").value = "";


    for (let i = 1; i <= 8; i++) {

        document.getElementById(
            "descricao" + i
        ).value = "";


        document.getElementById(
            "prova" + i
        ).value = "";
    }


    const mensagem =
        document.getElementById("mensagem");


    if (mensagem) {

        mensagem.style.display = "none";

        mensagem.textContent = "";
    }
}


async function carregarSalas() {

    const resultado =
        document.getElementById("resultado");


    const { data, error } =
        await banco
            .from("salas")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        resultado.innerHTML = `

            <p class="sem-cadastro">
                Não foi possível carregar os dados.
            </p>

        `;

        return;
    }


    salas = data || [];


    mostrarSalas();
}


function mostrarSalas() {

    const resultado =
        document.getElementById("resultado");


    if (salas.length === 0) {

        resultado.innerHTML = `

            <p class="sem-cadastro">
                Nenhuma sala cadastrada.
            </p>

        `;

        return;
    }


    resultado.innerHTML = "";


    salas.forEach(function (sala, indice) {

        let provasHTML = "";


        const provas =
            sala.provas || [];


        const descricoes =
            sala.descricoes || [];


        for (
            let i = 0;
            i < provas.length;
            i++
        ) {

            provasHTML += `

                <li>

                    <strong>
                        Descrição:
                    </strong>

                    ${descricoes[i] || "Não informada"}

                    <br>

                    <strong>
                        Participantes:
                    </strong>

                    ${provas[i] || "Não informado"}

                </li>

            `;
        }


        resultado.innerHTML += `

            <div class="cadastro">

                <h3>
                    Sala: ${sala.sala}
                </h3>

                <p>

                    <strong>
                        Número de participantes:
                    </strong>

                    ${sala.participantes}

                </p>

                <ol>

                    ${provasHTML}

                </ol>

                <button
                    type="button"
                    class="botaoExcluir"
                    onclick="excluirSala(${indice})"
                >
                    Excluir sala
                </button>

            </div>

        `;
    });
}


async function excluirSala(indice) {

    const sala =
        salas[indice];


    if (!sala) {

        return;
    }


    const senha =
        prompt(
            "Digite a senha da sala para excluir:"
        );


    if (senha === null) {

        return;
    }


    if (senha !== sala.senha) {

        alert("Senha incorreta.");

        return;
    }


    const confirmar =
        confirm(
            "Tem certeza que deseja excluir a sala " +
            sala.sala +
            "?"
        );


    if (!confirmar) {

        return;
    }


    const { error } =
        await banco
            .from("salas")
            .delete()
            .eq(
                "id",
                sala.id
            );


    if (error) {

        console.error(error);

        alert(
            "Erro ao excluir sala:\n" +
            error.message
        );

        return;
    }


    alert("Sala excluída com sucesso!");

    carregarSalas();
}