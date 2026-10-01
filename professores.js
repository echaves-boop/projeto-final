const SUPABASE_URL = "https://qaegmrobufjplzyyslkd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const botaoApagarTodos =
    document.getElementById("botaoApagarTodos");

const botaoTrocarSenha =
    document.getElementById("botaoTrocarSenha");

const confirmacaoApagarTodos =
    document.getElementById("confirmacaoApagarTodos");

const confirmacaoTrocarSenha =
    document.getElementById("confirmacaoTrocarSenha");

const mensagem =
    document.getElementById("mensagem");


let senhaApagarTodos = "1234";


function mostrarMensagem(texto, tipo = "sucesso") {

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className = tipo;
    mensagem.style.display = "block";
}


/* =====================================================
   APAGAR TODOS OS CADASTROS
===================================================== */

if (botaoApagarTodos) {

    botaoApagarTodos.addEventListener("click", function () {

        if (!confirmacaoApagarTodos) return;

        confirmacaoApagarTodos.innerHTML = `

            <div class="caixa-senha">

                <p>
                    <strong>
                        Digite a senha para apagar todos os cadastros:
                    </strong>
                </p>

                <input
                    type="password"
                    id="senhaApagarTodos"
                    placeholder="Digite a senha"
                >

                <button
                    type="button"
                    id="confirmarSenhaApagarTodos"
                    class="botao-confirmar"
                >
                    Confirmar
                </button>

                <button
                    type="button"
                    id="cancelarApagarTodos"
                    class="botao-cancelar"
                >
                    Cancelar
                </button>

                <span
                    id="erroSenhaApagarTodos"
                    class="erro-senha"
                ></span>

            </div>
        `;


        const campoSenha =
            document.getElementById("senhaApagarTodos");

        const botaoConfirmar =
            document.getElementById(
                "confirmarSenhaApagarTodos"
            );

        const botaoCancelar =
            document.getElementById(
                "cancelarApagarTodos"
            );


        campoSenha.focus();


        botaoConfirmar.addEventListener(
            "click",
            verificarSenhaApagarTodos
        );


        botaoCancelar.addEventListener(
            "click",
            cancelarApagarTodos
        );

    });

}


/* =====================================================
   VERIFICAR SENHA PARA APAGAR
===================================================== */

function verificarSenhaApagarTodos() {

    const campo =
        document.getElementById("senhaApagarTodos");

    const erro =
        document.getElementById("erroSenhaApagarTodos");


    if (!campo || !erro) return;


    if (campo.value.trim() === "") {

        erro.textContent =
            "Digite a senha.";

        erro.style.display =
            "block";

        campo.focus();

        return;
    }


    if (campo.value !== senhaApagarTodos) {

        erro.textContent =
            "Senha incorreta.";

        erro.style.display =
            "block";

        campo.value = "";

        campo.focus();

        return;
    }


    mostrarConfirmacaoApagarTodos();
}


/* =====================================================
   CONFIRMAÇÃO FINAL
===================================================== */

function mostrarConfirmacaoApagarTodos() {

    if (!confirmacaoApagarTodos) return;


    confirmacaoApagarTodos.innerHTML = `

        <div class="confirmacao-exclusao">

            <h3>Atenção!</h3>

            <p>
                Todos os cadastros das salas serão apagados.
            </p>

            <p>
                Essa ação não poderá ser desfeita.
            </p>

            <button
                type="button"
                id="confirmarApagarTodosDefinitivo"
                class="botao-apagar-definitivo"
            >
                Apagar todos
            </button>

            <button
                type="button"
                id="cancelarApagarTodosDefinitivo"
                class="botao-cancelar"
            >
                Cancelar
            </button>

        </div>
    `;


    document
        .getElementById("confirmarApagarTodosDefinitivo")
        .addEventListener(
            "click",
            apagarTodosOsCadastros
        );


    document
        .getElementById("cancelarApagarTodosDefinitivo")
        .addEventListener(
            "click",
            cancelarApagarTodos
        );
}


/* =====================================================
   APAGAR CADASTROS NO SUPABASE
===================================================== */

async function apagarTodosOsCadastros() {

    if (!confirmacaoApagarTodos) return;


    const { error } = await banco
        .from("salas")
        .delete()
        .not("id", "is", null);


    if (error) {

        console.error(error);

        mostrarMensagem(
            "Erro ao apagar os cadastros: " +
            error.message,
            "erro"
        );

        return;
    }


    confirmacaoApagarTodos.innerHTML = "";


    mostrarMensagem(
        "Todos os cadastros foram apagados com sucesso!",
        "sucesso"
    );
}


/* =====================================================
   CANCELAR APAGAR
===================================================== */

function cancelarApagarTodos() {

    if (confirmacaoApagarTodos) {

        confirmacaoApagarTodos.innerHTML = "";
    }


    mostrarMensagem(
        "Operação cancelada.",
        "info"
    );
}


/* =====================================================
   TROCAR SENHA
===================================================== */

if (botaoTrocarSenha) {

    botaoTrocarSenha.addEventListener(
        "click",
        function () {

            if (!confirmacaoTrocarSenha) return;


            confirmacaoTrocarSenha.innerHTML = `

                <div class="caixa-senha">

                    <h3>Trocar senha</h3>

                    <input
                        type="password"
                        id="senhaAtual"
                        placeholder="Senha atual"
                    >

                    <input
                        type="password"
                        id="novaSenha"
                        placeholder="Nova senha"
                    >

                    <input
                        type="password"
                        id="confirmarNovaSenha"
                        placeholder="Confirme a nova senha"
                    >

                    <button
                        type="button"
                        id="confirmarTrocaSenha"
                        class="botao-confirmar"
                    >
                        Alterar senha
                    </button>

                    <button
                        type="button"
                        id="cancelarTrocaSenha"
                        class="botao-cancelar"
                    >
                        Cancelar
                    </button>

                    <span
                        id="erroTrocaSenha"
                        class="erro-senha"
                    ></span>

                </div>
            `;


            document
                .getElementById("senhaAtual")
                .focus();


            document
                .getElementById("confirmarTrocaSenha")
                .addEventListener(
                    "click",
                    trocarSenha
                );


            document
                .getElementById("cancelarTrocaSenha")
                .addEventListener(
                    "click",
                    cancelarTrocaSenha
                );

        }
    );
}


/* =====================================================
   ALTERAR SENHA
===================================================== */

function trocarSenha() {

    const senhaAtual =
        document.getElementById("senhaAtual");

    const novaSenha =
        document.getElementById("novaSenha");

    const confirmarNovaSenha =
        document.getElementById("confirmarNovaSenha");

    const erro =
        document.getElementById("erroTrocaSenha");


    if (
        !senhaAtual ||
        !novaSenha ||
        !confirmarNovaSenha ||
        !erro
    ) {
        return;
    }


    if (senhaAtual.value.trim() === "") {

        erro.textContent =
            "Digite a senha atual.";

        erro.style.display =
            "block";

        senhaAtual.focus();

        return;
    }


    if (senhaAtual.value !== senhaApagarTodos) {

        erro.textContent =
            "A senha atual está incorreta.";

        erro.style.display =
            "block";

        senhaAtual.value = "";

        senhaAtual.focus();

        return;
    }


    if (novaSenha.value.trim() === "") {

        erro.textContent =
            "Digite a nova senha.";

        erro.style.display =
            "block";

        novaSenha.focus();

        return;
    }


    if (novaSenha.value.length < 4) {

        erro.textContent =
            "A nova senha deve ter pelo menos 4 caracteres.";

        erro.style.display =
            "block";

        novaSenha.focus();

        return;
    }


    if (novaSenha.value === senhaApagarTodos) {

        erro.textContent =
            "A nova senha deve ser diferente da senha atual.";

        erro.style.display =
            "block";

        novaSenha.focus();

        return;
    }


    if (confirmarNovaSenha.value.trim() === "") {

        erro.textContent =
            "Confirme a nova senha.";

        erro.style.display =
            "block";

        confirmarNovaSenha.focus();

        return;
    }


    if (
        novaSenha.value !==
        confirmarNovaSenha.value
    ) {

        erro.textContent =
            "As novas senhas não coincidem.";

        erro.style.display =
            "block";

        confirmarNovaSenha.value = "";

        confirmarNovaSenha.focus();

        return;
    }


    senhaApagarTodos =
        novaSenha.value;


    confirmacaoTrocarSenha.innerHTML = "";


    mostrarMensagem(
        "Senha alterada com sucesso!",
        "sucesso"
    );
}


/* =====================================================
   CANCELAR TROCA DE SENHA
===================================================== */

function cancelarTrocaSenha() {

    if (confirmacaoTrocarSenha) {

        confirmacaoTrocarSenha.innerHTML = "";
    }


    mostrarMensagem(
        "Alteração de senha cancelada.",
        "info"
    );
}
