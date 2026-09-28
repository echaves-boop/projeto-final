const SUPABASE_URL="https://qaegmrobufjplzyyslkd.supabase.co";
const SUPABASE_KEY="sb_publishable_6WJelxpl7Ozi2Ml1nLGrfg_e_ucCncE";
const banco=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const botaoCadastrar=document.querySelector('button[type="submit"]');
const botaoLimpar=document.querySelector('button[type="reset"]');
const resultado=document.getElementById("resultado");
const mensagem=document.getElementById("mensagem");
const botaoApagarTodos=document.getElementById("botaoApagarTodos");
const confirmacaoApagarTodos=document.getElementById("confirmacaoApagarTodos");
const botaoTrocarSenha=document.getElementById("botaoTrocarSenha");
const confirmacaoTrocarSenha=document.getElementById("confirmacaoTrocarSenha");

let salas=[];
let indiceEditando=null;
let dadosCadastroPendente=null;
let indiceSenha=null;
let acaoSenha=null;
let senhaApagarTodos="1234";

function mostrarMensagemGeral(texto,tipo="sucesso"){
    if(!mensagem)return;
    mensagem.textContent=texto;
    mensagem.className=tipo;
    mensagem.style.display="block";
}

function exibirErroAoLadoDoCampo(elementoInput,textoErro){
    if(!elementoInput)return;
    let spanErro=elementoInput.parentElement.querySelector(".erro-ao-lado");
    if(!spanErro){
        spanErro=document.createElement("span");
        spanErro.className="erro-ao-lado erro";
        spanErro.style.color="#d32f2f";
        spanErro.style.marginLeft="10px";
        spanErro.style.fontWeight="bold";
        spanErro.style.fontSize="0.9em";
        spanErro.style.display="inline-block";
        elementoInput.after(spanErro);
    }
    spanErro.textContent=textoErro;
    spanErro.style.display="inline-block";
    elementoInput.focus();
}

function limparErrosCampos(){
    document.querySelectorAll(".erro-ao-lado").forEach(el=>{
        el.textContent="";
        el.style.display="none";
    });
}

function carregarFormularioSenha(dados){
    dadosCadastroPendente=dados;
    mensagem.innerHTML=`
        <div class="caixa-senha">
            <p><strong>Crie uma senha para esta sala</strong></p>
            <div style="margin-bottom:8px;">
                <input type="password" id="senhaCadastro" placeholder="Digite a senha">
            </div>
            <div style="margin-bottom:8px;">
                <input type="password" id="confirmarSenhaCadastro" placeholder="Confirme a senha">
            </div>
            <button type="button" id="confirmarCadastroSenha">Confirmar senha</button>
            <button type="button" id="cancelarCadastroSenha">Cancelar</button>
        </div>`;
    mensagem.className="info";
    mensagem.style.display="block";
    document.getElementById("confirmarCadastroSenha").addEventListener("click",confirmarCadastroSenha);
    document.getElementById("cancelarCadastroSenha").addEventListener("click",cancelarCadastroSenha);
    document.getElementById("senhaCadastro").focus();
}

async function confirmarCadastroSenha(){
    limparErrosCampos();

    const inputSenha=document.getElementById("senhaCadastro");
    const inputConfirmacao=document.getElementById("confirmarSenhaCadastro");
    const senha=inputSenha?inputSenha.value:"";
    const confirmacao=inputConfirmacao?inputConfirmacao.value:"";

    if(senha.trim()===""){
        exibirErroAoLadoDoCampo(inputSenha,"Digite uma senha.");
        return;
    }

    if(senha.length<4){
        exibirErroAoLadoDoCampo(inputSenha,"Mínimo 4 caracteres.");
        return;
    }

    if(confirmacao.trim()===""){
        exibirErroAoLadoDoCampo(inputConfirmacao,"Confirme a senha.");
        return;
    }

    if(senha!==confirmacao){
        exibirErroAoLadoDoCampo(inputConfirmacao,"As senhas não coincidem.");
        return;
    }

    const{data:senhaExistente,error:erroConsulta}=await banco
        .from("salas")
        .select("id")
        .eq("senha",senha);

    if(erroConsulta){
        console.error(erroConsulta);
        exibirErroAoLadoDoCampo(inputSenha,"Erro ao validar senha no banco.");
        return;
    }

    if(senhaExistente&&senhaExistente.length>0){
        exibirErroAoLadoDoCampo(inputSenha,"Esta senha já está em uso por outra sala. Escolha outra.");
        return;
    }

    const novaSala={
        sala:dadosCadastroPendente.sala,
        participantes:dadosCadastroPendente.participantes,
        provas:dadosCadastroPendente.provas,
        senha:senha,
        pontos:0,
        pontos_provas:[0,0,0,0,0,0,0,0]
    };

    const{error}=await banco.from("salas").insert([novaSala]);

    if(error){
        console.error(error);
        exibirErroAoLadoDoCampo(inputSenha,"Erro: "+error.message);
        return;
    }

    dadosCadastroPendente=null;
    limparCampos();
    mostrarMensagemGeral("Sala cadastrada com sucesso!","sucesso");
    await carregarSalas();
}

function cancelarCadastroSenha(){
    dadosCadastroPendente=null;
    mostrarMensagemGeral("Cadastro cancelado.","erro");
}

function mostrarCampoSenha(indice,acao){
    indiceSenha=indice;
    acaoSenha=acao;

    const sala=salas[indice];
    const containerConfirmacao=document.getElementById(`confirmacao-${indice}`);

    if(!sala||!containerConfirmacao){
        mostrarMensagemGeral("Sala não encontrada.","erro");
        return;
    }

    if(!sala.senha){
        mostrarMensagemGeral("Esta sala ainda não possui uma senha cadastrada.","erro");
        return;
    }

    const acaoTexto=acao==="editar"?"editar":acao==="excluir"?"excluir":"ver as pontuações da";

    containerConfirmacao.innerHTML=`
        <div class="caixa-senha" style="margin-top:10px;">
            <p><strong>Digite a senha para ${acaoTexto} sala ${sala.sala}:</strong></p>
            <div style="display:inline-block;">
                <input type="password" id="senhaAcao-${indice}" placeholder="Digite a senha">
            </div>
            <button type="button" id="confirmarSenhaAcao-${indice}">Confirmar</button>
            <button type="button" id="cancelarSenhaAcao-${indice}">Cancelar</button>
        </div>`;

    document.getElementById(`confirmarSenhaAcao-${indice}`).addEventListener("click",()=>confirmarSenhaAcao(indice));
    document.getElementById(`cancelarSenhaAcao-${indice}`).addEventListener("click",()=>cancelarSenhaAcao(indice));
    document.getElementById(`senhaAcao-${indice}`).focus();
}

function confirmarSenhaAcao(indice){
    limparErrosCampos();

    const senhaInput=document.getElementById(`senhaAcao-${indice}`);
    if(!senhaInput)return;

    const senhaDigitada=senhaInput.value;
    const sala=salas[indice];

    if(!sala){
        mostrarMensagemGeral("Sala não encontrada.","erro");
        return;
    }

    if(senhaDigitada.trim()===""){
        exibirErroAoLadoDoCampo(senhaInput,"Digite a senha.");
        return;
    }

    if(senhaDigitada!==sala.senha){
        exibirErroAoLadoDoCampo(senhaInput,"Senha incorreta.");
        senhaInput.value="";
        return;
    }

    const acao=acaoSenha;
    cancelarSenhaAcao(indice);

    if(acao==="editar")editarSalaAutorizada(indice);
    else if(acao==="excluir")mostrarConfirmacaoExclusao(indice);
    else if(acao==="pontuacao")mostrarPontuacaoAutorizada(indice);
}

function cancelarSenhaAcao(indice){
    indiceSenha=null;
    acaoSenha=null;
    const containerConfirmacao=document.getElementById(`confirmacao-${indice}`);
    if(containerConfirmacao)containerConfirmacao.innerHTML="";
}

function verPontuacaoProvas(indice){
    mostrarCampoSenha(indice,"pontuacao");
}

function mostrarPontuacaoAutorizada(indice){
    const sala=salas[indice];
    const containerConfirmacao=document.getElementById(`confirmacao-${indice}`);
    if(!sala||!containerConfirmacao)return;

    const pontosProvas=sala.pontos_provas||[0,0,0,0,0,0,0,0];
    let itensPontuacao="";

    pontosProvas.forEach((pts,idx)=>{
        itensPontuacao+=`
            <li>
                <strong>Prova ${idx+1}:</strong> ${pts} pontos
            </li>`;
    });

    containerConfirmacao.innerHTML=`
        <div class="detalhes-pontuacao" style="margin-top:10px;padding:10px;background-color:#f0f4f8;border-radius:6px;">
            <h3>Pontuação por Prova</h3>
            <ul style="list-style:none;padding-left:0;">
                ${itensPontuacao}
            </ul>
            <button type="button" onclick="cancelarSenhaAcao(${indice})">Fechar</button>
        </div>`;
}

async function carregarSalas(){
    const{data,error}=await banco
        .from("salas")
        .select("*")
        .order("id",{ascending:true});

    if(error){
        console.error(error);
        mostrarMensagemGeral("Erro ao carregar as salas: "+error.message,"erro");
        return;
    }

    salas=data||[];
    mostrarSalas();
    mostrarRankingInicial();
}

if(botaoCadastrar){
    botaoCadastrar.addEventListener("click",async function(event){
        event.preventDefault();
        limparErrosCampos();

        const inputSala=document.getElementById("sala");
        const inputParticipantes=document.getElementById("participantes");
        const sala=inputSala?inputSala.value.trim():"";
        const participantes=inputParticipantes?inputParticipantes.value.trim():"";

        if(sala===""){
            exibirErroAoLadoDoCampo(inputSala,"Preencha o nome da sala.");
            return;
        }

        if(participantes===""){
            exibirErroAoLadoDoCampo(inputParticipantes,"Informe a quantidade.");
            return;
        }

        if(Number(participantes)<4){
            exibirErroAoLadoDoCampo(inputParticipantes,"Mínimo de 4 participantes.");
            return;
        }

        const provas=[];
        const apenasLetrasRegex=/^[a-zA-Zà-úÀ-Ú\s]+$/;

        for(let i=1;i<=8;i++){
            const campo=document.getElementById("prova"+i);
            const participante=campo?campo.value.trim():"";

            if(participante===""){
                exibirErroAoLadoDoCampo(campo,"Preencha a Prova "+i+".");
                return;
            }

            if(!apenasLetrasRegex.test(participante)){
                exibirErroAoLadoDoCampo(campo,"Apenas letras são permitidas.");
                return;
            }

            provas.push(participante);
        }

        if(indiceEditando!==null){
            const salaAtual=salas[indiceEditando];

            const{error}=await banco
                .from("salas")
                .update({
                    sala:sala,
                    participantes:Number(participantes),
                    provas:provas
                })
                .eq("id",salaAtual.id);

            if(error){
                console.error(error);
                mostrarMensagemGeral("Erro ao atualizar o cadastro: "+error.message,"erro");
                return;
            }

            mostrarMensagemGeral("Cadastro atualizado com sucesso!","sucesso");
            indiceEditando=null;
            botaoCadastrar.textContent="Cadastrar sala";
            limparCampos();
            await carregarSalas();
            return;
        }

        carregarFormularioSenha({
            sala:sala,
            participantes:Number(participantes),
            provas:provas
        });
    });
}

function mostrarSalas(){
    resultado.innerHTML="";

    if(salas.length===0){
        resultado.innerHTML="<p>Nenhuma sala cadastrada.</p>";
        return;
    }

    salas.forEach(function(sala,indice){
        let listaProvas="";
        const provas=sala.provas||[];

        provas.forEach(function(participante,numero){
            listaProvas+=`
                <li>
                    <strong>Prova ${numero+1}</strong><br>
                    <strong>Participantes da equipe ${numero+1}:</strong>
                    ${participante||"Não informado"}
                </li>`;
        });

        resultado.innerHTML+=`
            <div class="cadastro">
                <h2>Sala: ${sala.sala}</h2>
                <p><strong>Número de participantes:</strong> ${sala.participantes}</p>
                <h3>Participantes das provas</h3>
                <ol>${listaProvas}</ol>

                <button type="button" class="botaoPontuacao" onclick="verPontuacaoProvas(${indice})">
                    Ver pontuação das provas
                </button>

                <button type="button" class="botaoEditar" onclick="editarSala(${indice})">
                    Editar cadastro
                </button>

                <button type="button" class="botaoExcluir" onclick="excluirSala(${indice})">
                    Excluir sala
                </button>

                <div id="confirmacao-${indice}"></div>
            </div>`;
    });
}

function editarSala(indice){
    mostrarCampoSenha(indice,"editar");
}

function editarSalaAutorizada(indice){
    const sala=salas[indice];

    if(!sala){
        mostrarMensagemGeral("Sala não encontrada.","erro");
        return;
    }

    document.getElementById("sala").value=sala.sala;
    document.getElementById("participantes").value=sala.participantes;

    for(let i=1;i<=8;i++){
        const campo=document.getElementById("prova"+i);
        if(campo){
            campo.value=sala.provas&&sala.provas[i-1]?sala.provas[i-1]:"";
        }
    }

    indiceEditando=indice;
    botaoCadastrar.textContent="Salvar alterações";
    mostrarMensagemGeral("Editando a sala "+sala.sala+".","info");
    window.scrollTo({top:0,behavior:"smooth"});
}

function excluirSala(indice){
    mostrarCampoSenha(indice,"excluir");
}

function mostrarConfirmacaoExclusao(indice){
    const campo=document.getElementById("confirmacao-"+indice);
    const sala=salas[indice];

    if(!campo||!sala)return;

    campo.innerHTML=`
        <div class="confirmacao-exclusao">
            <p>Deseja realmente excluir a sala <strong>${sala.sala}</strong>?</p>
            <button type="button" onclick="confirmarExclusao(${indice})">Sim, excluir</button>
            <button type="button" onclick="cancelarExclusao(${indice})">Cancelar</button>
        </div>`;
}

async function confirmarExclusao(indice){
    const sala=salas[indice];

    if(!sala){
        mostrarMensagemGeral("Sala não encontrada.","erro");
        return;
    }

    const{error}=await banco
        .from("salas")
        .delete()
        .eq("id",sala.id);

    if(error){
        console.error(error);
        mostrarMensagemGeral("Erro ao excluir a sala: "+error.message,"erro");
        return;
    }

    mostrarMensagemGeral("Sala excluída com sucesso!","sucesso");
    await carregarSalas();
}

function cancelarExclusao(indice){
    const campo=document.getElementById("confirmacao-"+indice);
    if(campo)campo.innerHTML="";
    mostrarMensagemGeral("Exclusão cancelada.","info");
}

function mostrarRankingInicial(){
    const rankingInicial=document.getElementById("rankingInicial");
    if(!rankingInicial)return;

    rankingInicial.innerHTML="";

    if(salas.length===0){
        rankingInicial.innerHTML="<p>Nenhuma sala cadastrada.</p>";
        return;
    }

    const rankingSalas=[...salas];

    rankingSalas.sort((a,b)=>Number(b.pontos||0)-Number(a.pontos||0));

    rankingSalas.forEach((sala,indice)=>{
        const posicao=indice+1;
        const pontos=Number(sala.pontos||0);
        const medalha=posicao===1?"🥇":posicao===2?"🥈":posicao===3?"🥉":`${posicao}º`;

        rankingInicial.innerHTML+=`
            <div class="item-ranking">
                <span class="posicao">${medalha}</span>
                <strong>${sala.sala}</strong>
                <span>${pontos} pontos</span>
            </div>`;
    });

    const vencedor=rankingSalas[0];

    rankingInicial.innerHTML+=`
        <div class="mensagem-vencedor" style="margin-top:15px;padding:12px;background-color:#e8f5e9;border:1px solid #c8e6c9;border-radius:8px;text-align:center;color:#2e7d32;">
            <strong>Parabéns à sala ${vencedor.sala}!</strong>
            Vocês lideram o ranking com <strong>${vencedor.pontos||0} pontos</strong>.
            Excelente desempenho!
        </div>

        <div class="observacao-empate" style="margin-top:8px;font-size:.85em;text-align:center;color:#666;font-style:italic;">
            * <strong>Observação:</strong> Em caso de empate, o desempate será decidido com base no trabalho em equipe.
        </div>`;
}

function limparCampos(){
    limparErrosCampos();

    const inputSala=document.getElementById("sala");
    const inputParticipantes=document.getElementById("participantes");

    if(inputSala)inputSala.value="";
    if(inputParticipantes)inputParticipantes.value="";

    for(let i=1;i<=8;i++){
        const campo=document.getElementById("prova"+i);
        if(campo)campo.value="";
    }

    indiceEditando=null;

    if(botaoCadastrar){
        botaoCadastrar.textContent="Cadastrar sala";
    }
}

if(botaoLimpar){
    botaoLimpar.addEventListener("click",function(event){
        event.preventDefault();
        limparCampos();
        mostrarMensagemGeral("Campos limpos.","info");
    });
}

if(botaoApagarTodos){
    botaoApagarTodos.addEventListener("click",function(){
        if(!confirmacaoApagarTodos)return;

        confirmacaoApagarTodos.innerHTML=`
            <div class="caixa-senha">
                <p><strong>Digite a senha para apagar todos os cadastros:</strong></p>

                <input type="password" id="senhaApagarTodos" placeholder="Digite a senha">

                <button type="button" id="confirmarSenhaApagarTodos">
                    Confirmar
                </button>

                <button type="button" id="cancelarApagarTodos">
                    Cancelar
                </button>

                <span id="erroSenhaApagarTodos" style="display:none;color:#d32f2f;margin-left:10px;font-weight:bold;"></span>
            </div>`;

        document.getElementById("senhaApagarTodos").focus();

        document
            .getElementById("confirmarSenhaApagarTodos")
            .addEventListener("click",verificarSenhaApagarTodos);

        document
            .getElementById("cancelarApagarTodos")
            .addEventListener("click",cancelarApagarTodos);
    });
}

function verificarSenhaApagarTodos(){
    const campo=document.getElementById("senhaApagarTodos");
    const erro=document.getElementById("erroSenhaApagarTodos");

    if(!campo)return;

    if(campo.value.trim()===""){
        erro.textContent="Digite a senha.";
        erro.style.display="inline-block";
        campo.focus();
        return;
    }

    if(campo.value!==senhaApagarTodos){
        erro.textContent="Senha incorreta.";
        erro.style.display="inline-block";
        campo.value="";
        campo.focus();
        return;
    }

    mostrarConfirmacaoApagarTodos();
}

function mostrarConfirmacaoApagarTodos(){
    if(!confirmacaoApagarTodos)return;

    confirmacaoApagarTodos.innerHTML=`
        <div class="confirmacao-exclusao" style="margin-top:10px;padding:15px;border:2px solid #d32f2f;border-radius:8px;background:#ffebee;">
            <p><strong>Atenção!</strong></p>
            <p>Todos os cadastros das salas serão apagados.</p>
            <p>Essa ação não poderá ser desfeita.</p>

            <button type="button" id="confirmarApagarTodosDefinitivo" style="background:#d32f2f;color:white;border:none;padding:10px 15px;border-radius:5px;">
                Apagar todos
            </button>

            <button type="button" id="cancelarApagarTodosDefinitivo">
                Cancelar
            </button>
        </div>`;

    document
        .getElementById("confirmarApagarTodosDefinitivo")
        .addEventListener("click",apagarTodosOsCadastros);

    document
        .getElementById("cancelarApagarTodosDefinitivo")
        .addEventListener("click",cancelarApagarTodos);
}

async function apagarTodosOsCadastros(){
    if(!confirmacaoApagarTodos)return;

    const{error}=await banco
        .from("salas")
        .delete()
        .not("id","is",null);

    if(error){
        console.error(error);
        mostrarMensagemGeral("Erro ao apagar os cadastros: "+error.message,"erro");
        return;
    }

    salas=[];
    confirmacaoApagarTodos.innerHTML="";
    mostrarMensagemGeral("Todos os cadastros foram apagados com sucesso!","sucesso");
    mostrarSalas();
    mostrarRankingInicial();
}

function cancelarApagarTodos(){
    if(confirmacaoApagarTodos){
        confirmacaoApagarTodos.innerHTML="";
    }

    mostrarMensagemGeral("Operação cancelada.","info");
}

if(botaoTrocarSenha){
    botaoTrocarSenha.addEventListener("click",function(){
        if(!confirmacaoTrocarSenha)return;

        confirmacaoTrocarSenha.innerHTML=`
            <div class="caixa-senha">
                <p><strong>Trocar senha administrativa</strong></p>

                <input type="password" id="senhaAtual" placeholder="Senha atual">
                <br><br>

                <input type="password" id="novaSenha" placeholder="Nova senha">
                <br><br>

                <input type="password" id="confirmarNovaSenha" placeholder="Confirme a nova senha">
                <br><br>

                <button type="button" id="confirmarTrocaSenha">
                    Alterar senha
                </button>

                <button type="button" id="cancelarTrocaSenha">
                    Cancelar
                </button>

                <span id="erroTrocaSenha" style="display:none;color:#d32f2f;margin-left:10px;font-weight:bold;"></span>
            </div>`;

        document.getElementById("senhaAtual").focus();

        document
            .getElementById("confirmarTrocaSenha")
            .addEventListener("click",trocarSenha);

        document
            .getElementById("cancelarTrocaSenha")
            .addEventListener("click",cancelarTrocaSenha);
    });
}

function trocarSenha(){
    const senhaAtual=document.getElementById("senhaAtual");
    const novaSenha=document.getElementById("novaSenha");
    const confirmarNovaSenha=document.getElementById("confirmarNovaSenha");
    const erro=document.getElementById("erroTrocaSenha");

    if(!senhaAtual||!novaSenha||!confirmarNovaSenha||!erro)return;

    if(senhaAtual.value.trim()===""){
        erro.textContent="Digite a senha atual.";
        erro.style.display="inline-block";
        senhaAtual.focus();
        return;
    }

    if(senhaAtual.value!==senhaApagarTodos){
        erro.textContent="A senha atual está incorreta.";
        erro.style.display="inline-block";
        senhaAtual.value="";
        senhaAtual.focus();
        return;
    }

    if(novaSenha.value.trim()===""){
        erro.textContent="Digite a nova senha.";
        erro.style.display="inline-block";
        novaSenha.focus();
        return;
    }

    if(novaSenha.value.length<4){
        erro.textContent="A nova senha deve ter pelo menos 4 caracteres.";
        erro.style.display="inline-block";
        novaSenha.focus();
        return;
    }

    if(novaSenha.value===senhaApagarTodos){
        erro.textContent="A nova senha deve ser diferente da senha atual.";
        erro.style.display="inline-block";
        novaSenha.focus();
        return;
    }

    if(confirmarNovaSenha.value.trim()===""){
        erro.textContent="Confirme a nova senha.";
        erro.style.display="inline-block";
        confirmarNovaSenha.focus();
        return;
    }

    if(novaSenha.value!==confirmarNovaSenha.value){
        erro.textContent="As novas senhas não coincidem.";
        erro.style.display="inline-block";
        confirmarNovaSenha.value="";
        confirmarNovaSenha.focus();
        return;
    }

    senhaApagarTodos=novaSenha.value;
    confirmacaoTrocarSenha.innerHTML="";
    mostrarMensagemGeral("Senha alterada com sucesso!","sucesso");
}

function cancelarTrocaSenha(){
    if(confirmacaoTrocarSenha){
        confirmacaoTrocarSenha.innerHTML="";
    }

    mostrarMensagemGeral("Alteração de senha cancelada.","info");
}

carregarSalas();

window.editarSala=editarSala;
window.excluirSala=excluirSala;
window.verPontuacaoProvas=verPontuacaoProvas;
window.confirmarExclusao=confirmarExclusao;
window.cancelarExclusao=cancelarExclusao;