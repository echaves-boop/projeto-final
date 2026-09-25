const SUPABASE_URL = "https://qaegmrobufjplzyyslkd.supabase.co";
const SUPABASE_KEY = "sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const botaoCadastrar =
    document.querySelector('button[type="submit"]');

const botaoLimpar =
    document.querySelector('button[type="reset"]');

const resultado =
    document.getElementById("resultado");

const mensagem =
    document.getElementById("mensagem");

let salas = [];
let indiceEditando = null;

let dadosCadastroPendente = null;
let indiceSenha = null;
let acaoSenha = null;


function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
    mensagem.style.display = "block";
}


/* =========================================
   FORMULÁRIO PARA CRIAR SENHA (NOVO CADASTRO)
========================================= */

function carregarFormularioSenha(dados) {
    dadosCadastroPendente = dados;

    mensagem.innerHTML = `
        <div class="caixa-senha">
            <p>
                <strong>
                    Crie uma senha para esta sala
                </strong>
            </p>

            <input
                type="password"
                id="senhaCadastro"
                placeholder="Digite a senha"
            >

            <input
                type="password"
                id="confirmarSenhaCadastro"
                placeholder="Confirme a senha"
            >

            <button
                type="button"
                id="confirmarCadastroSenha">
                Confirmar senha
            </button>

            <button
                type="button"
                id="cancelarCadastroSenha">
                Cancelar
            </button>

            <p id="mensagemSenhaCadastro"></p>
        </div>
    `;

    mensagem.className = "info";
    mensagem.style.display = "block";

    document
        .getElementById("confirmarCadastroSenha")
        .addEventListener("click", confirmarCadastroSenha);

    document
        .getElementById("cancelarCadastroSenha")
        .addEventListener("click", cancelarCadastroSenha);

    document
        .getElementById("senhaCadastro")
        .focus();
}


/* =========================================
   CONFIRMAR SENHA DO CADASTRO
========================================= */

async function confirmarCadastroSenha() {
    const senha = document.getElementById("senhaCadastro").value;
    const confirmacao = document.getElementById("confirmarSenhaCadastro").value;
    const mensagemSenha = document.getElementById("mensagemSenhaCadastro");

    if (senha.trim() === "") {
        mensagemSenha.textContent = "Digite uma senha.";
        mensagemSenha.className = "erro";
        return;
    }

    if (senha.length < 4) {
        mensagemSenha.textContent = "A senha deve ter pelo menos 4 caracteres.";
        mensagemSenha.className = "erro";
        return;
    }

    if (confirmacao.trim() === "") {
        mensagemSenha.textContent = "Confirme a senha.";
        mensagemSenha.className = "erro";
        return;
    }

    if (senha !== confirmacao) {
        mensagemSenha.textContent = "As senhas não são iguais.";
        mensagemSenha.className = "erro";
        return;
    }

    const novaSala = {
        sala: dadosCadastroPendente.sala,
        participantes: dadosCadastroPendente.participantes,
        provas: dadosCadastroPendente.provas,
        senha: senha,
        pontos: 0,
        pontos_provas: [0, 0, 0, 0, 0, 0, 0, 0]
    };

    const { error } = await banco
        .from("salas")
        .insert([novaSala]);

    if (error) {
        console.error(error);
        mensagemSenha.textContent = "Erro ao cadastrar a sala: " + error.message;
        mensagemSenha.className = "erro";
        return;
    }

    dadosCadastroPendente = null;

    limparCampos();

    mostrarMensagem(
        "Sala cadastrada com sucesso!",
        "sucesso"
    );

    await carregarSalas();
}


function cancelarCadastroSenha() {
    dadosCadastroPendente = null;
    mostrarMensagem("Cadastro cancelado.", "erro");
}


/* =========================================
   CAMPO DE SENHA PARA EDITAR, EXCLUIR OU VER PONTOS
========================================= */

function mostrarCampoSenha(indice, acao) {
    indiceSenha = indice;
    acaoSenha = acao;

    const sala = salas[indice];
    const containerConfirmacao = document.getElementById(`confirmacao-${indice}`);

    if (!sala || !containerConfirmacao) {
        mostrarMensagem("Sala não encontrada.", "erro");
        return;
    }

    if (!sala.senha) {
        mostrarMensagem("Esta sala ainda não possui uma senha cadastrada.", "erro");
        return;
    }

    const acaoTexto = acao === "editar" ? "editar" : acao === "excluir" ? "excluir" : "ver as pontuações da";

    containerConfirmacao.innerHTML = `
        <div class="caixa-senha">
            <p>
                <strong>
                    Digite a senha para ${acaoTexto} sala ${sala.sala}:
                </strong>
            </p>

            <input
                type="password"
                id="senhaAcao-${indice}"
                placeholder="Digite a senha"
            >

            <button
                type="button"
                id="confirmarSenhaAcao-${indice}">
                Confirmar
            </button>

            <button
                type="button"
                id="cancelarSenhaAcao-${indice}">
                Cancelar
            </button>

            <p id="mensagemSenhaAcao-${indice}"></p>
        </div>
    `;

    document
        .getElementById(`confirmarSenhaAcao-${indice}`)
        .addEventListener("click", () => confirmarSenhaAcao(indice));

    document
        .getElementById(`cancelarSenhaAcao-${indice}`)
        .addEventListener("click", () => cancelarSenhaAcao(indice));

    document
        .getElementById(`senhaAcao-${indice}`)
        .focus();
}


/* =========================================
   CONFIRMAR SENHA DA AÇÃO
========================================= */

function confirmarSenhaAcao(indice) {
    const senhaInput = document.getElementById(`senhaAcao-${indice}`);
    const mensagemSenha = document.getElementById(`mensagemSenhaAcao-${indice}`);

    if (!senhaInput) return;

    const senhaDigitada = senhaInput.value;
    const sala = salas[indice];

    if (!sala) {
        mostrarMensagem("Sala não encontrada.", "erro");
        return;
    }

    if (senhaDigitada.trim() === "") {
        mensagemSenha.textContent = "Digite a senha.";
        mensagemSenha.className = "erro";
        return;
    }

    if (senhaDigitada !== sala.senha) {
        mensagemSenha.textContent = "Senha incorreta.";
        mensagemSenha.className = "erro";
        senhaInput.value = "";
        senhaInput.focus();
        return;
    }

    const acao = acaoSenha;

    cancelarSenhaAcao(indice);

    if (acao === "editar") {
        editarSalaAutorizada(indice);
    } else if (acao === "excluir") {
        mostrarConfirmacaoExclusao(indice);
    } else if (acao === "pontuacao") {
        mostrarPontuacaoAutorizada(indice);
    }
}


function cancelarSenhaAcao(indice) {
    indiceSenha = null;
    acaoSenha = null;

    const containerConfirmacao = document.getElementById(`confirmacao-${indice}`);
    if (containerConfirmacao) {
        containerConfirmacao.innerHTML = "";
    }
}


/* =========================================
   EXIBIR PONTUAÇÃO POR PROVA (AUTORIZADO)
========================================= */

function verPontuacaoProvas(indice) {
    mostrarCampoSenha(indice, "pontuacao");
}

function mostrarPontuacaoAutorizada(indice) {
    const sala = salas[indice];
    const containerConfirmacao = document.getElementById(`confirmacao-${indice}`);

    if (!sala || !containerConfirmacao) return;

    const pontosProvas = sala.pontos_provas || [0, 0, 0, 0, 0, 0, 0, 0];

    let itensPontuacao = "";
    pontosProvas.forEach((pts, idx) => {
        itensPontuacao += `<li><strong>Prova ${idx + 1}:</strong> ${pts} pontos</li>`;
    });

    containerConfirmacao.innerHTML = `
        <div class="detalhes-pontuacao" style="margin-top: 10px; padding: 10px; background-color: #f0f4f8; border-radius: 6px;">
            <h3>📊 Pontuação por Prova</h3>
            <ul style="list-style: none; padding-left: 0;">
                ${itensPontuacao}
            </ul>
            <button type="button" onclick="cancelarSenhaAcao(${indice})">Fechar</button>
        </div>
    `;
}


/* =========================================
   CARREGAR SALAS
========================================= */

async function carregarSalas() {
    const { data, error } = await banco
        .from("salas")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        mostrarMensagem("Erro ao carregar as salas: " + error.message, "erro");
        return;
    }

    salas = data || [];

    mostrarSalas();
    mostrarRankingInicial();
}


/* =========================================
   CADASTRAR / ATUALIZAR
========================================= */

if (botaoCadastrar) {
    botaoCadastrar.addEventListener("click", async function(event) {
        event.preventDefault();

        const inputSala = document.getElementById("sala");
        const inputParticipantes = document.getElementById("participantes");

        const sala = inputSala ? inputSala.value.trim() : "";
        const participantes = inputParticipantes ? inputParticipantes.value.trim() : "";

        if (sala === "") {
            mostrarMensagem("Preencha o nome da sala.", "erro");
            if (inputSala) inputSala.focus();
            return;
        }

        if (participantes === "") {
            mostrarMensagem("Informe o número de participantes.", "erro");
            if (inputParticipantes) inputParticipantes.focus();
            return;
        }

        if (Number(participantes) < 4) {
            mostrarMensagem("A sala precisa ter no mínimo 4 participantes.", "erro");
            if (inputParticipantes) inputParticipantes.focus();
            return;
        }

        const provas = [];

        for (let i = 1; i <= 8; i++) {
            const campo = document.getElementById("prova" + i);
            const participante = campo ? campo.value.trim() : "";

            if (participante === "") {
                mostrarMensagem("Preencha o participante da Prova " + i + ".", "erro");
                if (campo) campo.focus();
                return;
            }

            provas.push(participante);
        }

        /* ATUALIZAR SALA */
        if (indiceEditando !== null) {
            const salaAtual = salas[indiceEditando];

            const { error } = await banco
                .from("salas")
                .update({
                    sala: sala,
                    participantes: Number(participantes),
                    provas: provas
                })
                .eq("id", salaAtual.id);

            if (error) {
                console.error(error);
                mostrarMensagem("Erro ao atualizar o cadastro: " + error.message, "erro");
                return;
            }

            mostrarMensagem("Cadastro atualizado com sucesso!", "sucesso");
            indiceEditando = null;
            botaoCadastrar.textContent = "Cadastrar sala";
            limparCampos();
            await carregarSalas();
            return;
        }

        /* NOVA SALA */
        const dados = {
            sala: sala,
            participantes: Number(participantes),
            provas: provas
        };

        carregarFormularioSenha(dados);
    });
}


/* =========================================
   MOSTRAR SALAS
========================================= */

function mostrarSalas() {
    resultado.innerHTML = "";

    if (salas.length === 0) {
        resultado.innerHTML = "<p>Nenhuma sala cadastrada.</p>";
        return;
    }

    salas.forEach(function(sala, indice) {
        let listaProvas = "";
        const provas = sala.provas || [];

        provas.forEach(function(participante, numero) {
            listaProvas += `
                <li>
                    <strong>Prova ${numero + 1}</strong><br>
                    <strong>Participantes da equipe ${numero + 1}:</strong>
                    ${participante || "Não informado"}
                </li>
            `;
        });

        resultado.innerHTML += `
            <div class="cadastro">
                <h2>🏫 Sala: ${sala.sala}</h2>
                <p><strong>Número de participantes:</strong> ${sala.participantes}</p>
                <h3>Participantes das provas</h3>
                <ol>${listaProvas}</ol>

                <button type="button" class="botaoPontuacao" onclick="verPontuacaoProvas(${indice})">Ver pontuação das provas</button>
                <button type="button" class="botaoEditar" onclick="editarSala(${indice})">Editar cadastro</button>
                <button type="button" class="botaoExcluir" onclick="excluirSala(${indice})">Excluir sala</button>

                <div id="confirmacao-${indice}"></div>
            </div>
        `;
    });
}


/* =========================================
   EDITAR SALA
========================================= */

function editarSala(indice) {
    mostrarCampoSenha(indice, "editar");
}

function editarSalaAutorizada(indice) {
    const sala = salas[indice];

    if (!sala) {
        mostrarMensagem("Sala não encontrada.", "erro");
        return;
    }

    document.getElementById("sala").value = sala.sala;
    document.getElementById("participantes").value = sala.participantes;

    for (let i = 1; i <= 8; i++) {
        const campo = document.getElementById("prova" + i);
        if (campo) {
            campo.value = (sala.provas && sala.provas[i - 1]) ? sala.provas[i - 1] : "";
        }
    }

    indiceEditando = indice;
    botaoCadastrar.textContent = "Salvar alterações";

    mostrarMensagem("Editando a sala " + sala.sala + ".", "info");

    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* =========================================
   EXCLUIR SALA
========================================= */

function excluirSala(indice) {
    mostrarCampoSenha(indice, "excluir");
}

function mostrarConfirmacaoExclusao(indice) {
    const campo = document.getElementById("confirmacao-" + indice);
    const sala = salas[indice];

    if (!campo || !sala) return;

    campo.innerHTML = `
        <div class="confirmacao-exclusao">
            <p>Deseja realmente excluir a sala <strong>${sala.sala}</strong>?</p>
            <button type="button" onclick="confirmarExclusao(${indice})">Sim, excluir</button>
            <button type="button" onclick="cancelarExclusao(${indice})">Cancelar</button>
        </div>
    `;
}

async function confirmarExclusao(indice) {
    const sala = salas[indice];

    if (!sala) {
        mostrarMensagem("Sala não encontrada.", "erro");
        return;
    }

    const { error } = await banco
        .from("salas")
        .delete()
        .eq("id", sala.id);

    if (error) {
        console.error(error);
        mostrarMensagem("Erro ao excluir a sala: " + error.message, "erro");
        return;
    }

    mostrarMensagem("Sala excluída com sucesso!", "sucesso");
    await carregarSalas();
}

function cancelarExclusao(indice) {
    const campo = document.getElementById("confirmacao-" + indice);
    if (campo) {
        campo.innerHTML = "";
    }
    mostrarMensagem("Exclusão cancelada.", "info");
}


/* =========================================
   RANKING
========================================= */

function mostrarRankingInicial() {
    const rankingInicial = document.getElementById("rankingInicial");
    if (!rankingInicial) return;

    rankingInicial.innerHTML = "";

    if (salas.length === 0) {
        rankingInicial.innerHTML = "<p>Nenhuma sala cadastrada.</p>";
        return;
    }

    const rankingSalas = [...salas];

    rankingSalas.sort((a, b) => Number(b.pontos || 0) - Number(a.pontos || 0));

    rankingSalas.forEach((sala, indice) => {
        const posicao = indice + 1;
        const pontos = Number(sala.pontos || 0);

        let medalha = posicao === 1 ? "🥇" : posicao === 2 ? "🥈" : posicao === 3 ? "🥉" : `${posicao}º`;

        rankingInicial.innerHTML += `
            <div class="item-ranking">
                <span class="posicao">${medalha}</span>
                <strong>${sala.sala}</strong>
                <span>${pontos} pontos</span>
            </div>
        `;
    });

    // Mensagem de parabenização ao vencedor
    const vencedor = rankingSalas[0];
    
    rankingInicial.innerHTML += `
        <div class="mensagem-vencedor" style="margin-top: 15px; padding: 12px; background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; text-align: center; color: #2e7d32;">
            🎉 <strong>Parabéns à sala ${vencedor.sala}!</strong> Vocês lideram o ranking com <strong>${vencedor.pontos || 0} pontos</strong>. Excelente desempenho! 🏆
        </div>

        <div class="observacao-empate" style="margin-top: 8px; font-size: 0.85em; text-align: center; color: #666; font-style: italic;">
            * <strong>Observação:</strong> Em caso de empate, o desempate será decidido com base no trabalho em equipe.
        </div>
    `;
}


/* =========================================
   LIMPAR CAMPOS
========================================= */

function limparCampos() {
    const inputSala = document.getElementById("sala");
    const inputParticipantes = document.getElementById("participantes");

    if (inputSala) inputSala.value = "";
    if (inputParticipantes) inputParticipantes.value = "";

    for (let i = 1; i <= 8; i++) {
        const campo = document.getElementById("prova" + i);
        if (campo) campo.value = "";
    }

    indiceEditando = null;
    if (botaoCadastrar) botaoCadastrar.textContent = "Cadastrar sala";
}

if (botaoLimpar) {
    botaoLimpar.addEventListener("click", function(event) {
        event.preventDefault();
        limparCampos();
        mostrarMensagem("Campos limpos.", "info");
    });
}


/* =========================================
   INICIAR E EXPOR FUNÇÕES AO WINDOW
========================================= */

carregarSalas();

window.editarSala = editarSala;
window.excluirSala = excluirSala;
window.verPontuacaoProvas = verPontuacaoProvas;
window.confirmarExclusao = confirmarExclusao;
window.cancelarExclusao = cancelarExclusao;