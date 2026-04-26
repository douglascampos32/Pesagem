let pesagemId = sessionStorage.getItem("pesagemId");

if (!pesagemId) {
    pesagemId = "pesagem_" + Date.now();
    sessionStorage.setItem("pesagemId", pesagemId);
}


let produtos = localStorage.getItem(pesagemId) 
    ? JSON.parse(localStorage.getItem(pesagemId)) 
    : [];
let nomeCliente;

const modal = document.getElementById("itemModal");
const btn = document.getElementById("modalBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}



function novaPesagem() {
    window.open(window.location.href, "_blank");
}

document.addEventListener("keydown", function(e) {

    const tag = document.activeElement.tagName.toLowerCase();

    // 🔒 evita conflito digitando
    const digitando = (tag === "input" || tag === "textarea" || tag === "select");

    // ➕ ABRIR MODAL
    if ((e.key === "+" || (e.key === "=" && e.shiftKey)) && !digitando) {
        e.preventDefault();
        modal.style.display = "block";
        limparCampos(); // 🔥 limpa antes de abrir

   setTimeout(() => {
    const select = document.getElementById("item");
    select.focus();
    select.click(); // 🔥 abre lista automaticamente
    select.size = 10; // mostra mais opções tipo lista aberta
}, 100);
    }

    // ESC → FECHAR MODAL
    if (e.key === "Escape") {
        modal.style.display = "none";
    }


    // F2 → TROCAR CLIENTE
    if (e.key === "F2") {
        e.preventDefault();
        trocarCliente();
    }

    // F4 → IMPRIMIR CUPOM
    if (e.key === "F4") {
        e.preventDefault();
        imprimirCupom();
    }

    // F8 → NOVA PESAGEM
    if (e.key === "F8") {
        e.preventDefault();
        novaPesagem();
    }

    // F9 → RESET
    if (e.key === "F9") {
        e.preventDefault();
        resetTabela();
    }
if (e.key === "Delete") {
    const selecionado = document.querySelector(".selecionado");

    if (selecionado) {
        const index = selecionado.dataset.index;
        excluirProduto(parseInt(index));
    }
}
});



function adicionarProduto() {
    const item = document.getElementById("item").value;
    const pesoBruto = parseFloat(document.getElementById("pesoBruto").value);
    const tara = parseFloat(document.getElementById("tara").value);

    if (isNaN(pesoBruto) || isNaN(tara)) {
        alert("Preencha os campos corretamente!");
        return;
    }

    const pesoLiquido = pesoBruto - tara;

    produtos.push({ item, pesoBruto, tara, pesoLiquido });

    renderizarTabela();
    limparCampos();
    salvarLocalStorage();
    modal.style.display = "none";}

function renderizarTabela() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";
    
    let totalPeso = 0;
    
produtos.forEach((produto, index) => {
    totalPeso += produto.pesoLiquido;
    
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${produto.item}</td>
        <td>${produto.pesoBruto.toFixed(2)}</td>
        <td>${produto.tara.toFixed(2)}</td>
        <td>${produto.pesoLiquido.toFixed(2)}</td>
        <td class="acoes"><button onclick="excluirProduto(${index})">Excluir</button></td>
    `;

    // ✅ AGORA SIM CORRETO
    tr.onclick = function() {
        document.querySelectorAll("#tbody tr").forEach(r => r.classList.remove("selecionado"));
        tr.classList.add("selecionado");
        tr.dataset.index = index;
    };

    tbody.appendChild(tr);
});
    
    document.getElementById("totalPeso").textContent = totalPeso.toFixed(2);

}

function excluirProduto(index) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        produtos.splice(index, 1);
        renderizarTabela();
        salvarLocalStorage();
    }
}

function limparCampos() {
    document.getElementById("form").reset();
}

function registrarPesagem() {
    let lista = JSON.parse(localStorage.getItem("listaPesagens")) || [];

    const existe = lista.find(p => p.id === pesagemId);

    if (!existe) {
        lista.push({
    id: pesagemId,
    cliente: nomeCliente,
    data: new Date().toLocaleString('pt-BR'),
    status: "pendente" // 🔥 novo campo
});

        localStorage.setItem("listaPesagens", JSON.stringify(lista));
    }
}

function resetTabela() {
    if (confirm("Tem certeza que deseja resetar a tabela?")) {

        produtos = [];
        renderizarTabela();

        // 🔥 Remove dados da pesagem
        localStorage.removeItem(pesagemId);
        localStorage.removeItem(pesagemId + "_cliente");

        // 🔥 REMOVE também do painel
        let lista = JSON.parse(localStorage.getItem("listaPesagens")) || [];

        lista = lista.filter(p => p.id !== pesagemId);

        localStorage.setItem("listaPesagens", JSON.stringify(lista));

        // 🔥 Limpa ID atual
        sessionStorage.removeItem("pesagemId");

        // 🔥 Recarrega página limpa
        location.reload();
    }
}
function salvarLocalStorage() {
    localStorage.setItem(pesagemId, JSON.stringify(produtos));
}

function agruparProdutos() {
    const produtosAgrupados = {};
    
    produtos.forEach(({ item, pesoBruto, tara, pesoLiquido }) => {
        if (!produtosAgrupados[item]) {
            produtosAgrupados[item] = { pesoBruto: 0, tara: 0, pesoLiquido: 0 };
        }
        produtosAgrupados[item].pesoBruto += pesoBruto;
        produtosAgrupados[item].tara += tara;
        produtosAgrupados[item].pesoLiquido += pesoLiquido;
    });
    
    return produtosAgrupados;
}function salvarTabela() {
    const { jsPDF } = window.jspdf;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const dataFormatada = dataAtual.replace(/\//g, "-");
    const clienteNome = nomeCliente.replace(/ /g, "_");
    

    // ===== PDF 1: Rascunho completo =====
    
    const docRascunho = new jsPDF();docRascunho.setFontSize(15); // 👈 aumenta aqui
    docRascunho.text(`Cliente: ${nomeCliente.toUpperCase()} - Data: ${dataAtual}`, 10, 10);

    const tabelaRascunho = produtos.map(p => [
        p.item,
        p.pesoBruto.toFixed(2),
        p.tara.toFixed(2),
        p.pesoLiquido.toFixed(2)
    ]);

    docRascunho.autoTable({
        head: [['Item', 'Peso Bruto', 'Tara', 'Peso Líquido']],
        body: tabelaRascunho,
        startY: 20,
          styles: {
        fontSize: 12 // 👈 aumenta aqui (padrão é ~8 ou 9)
    },
    headStyles: {
        fontSize: 13 // 👈 cabeçalho maior
    }
        
    });

    const nomeRascunho = `${clienteNome}_rascunho_${dataFormatada}.pdf`;
    docRascunho.save(nomeRascunho);

    // ===== PDF 2: Resumo agrupado com desconto aplicado =====
    const docResumo = new jsPDF();
    docResumo.text(`Cliente: ${nomeCliente.toUpperCase()} - Data: ${dataAtual}`, 10, 10);
    //docResumo.text('Resumo Agrupado (com desconto em "lata -4%"):', 10, 20);

    const agrupado = {};
    produtos.forEach(({ item, pesoLiquido }) => {
        if (!agrupado[item]) {
            agrupado[item] = 0;
        }

        let liquido = pesoLiquido;
        if (item.toLowerCase() === 'lata -4%') {
            liquido *= 0.96; // Aplica desconto só no PDF
        }

        agrupado[item] += liquido;
    });

    const tabelaResumo = Object.entries(agrupado).map(([item, peso]) => [
        item,
        peso.toFixed(2)
    ]);

    docResumo.autoTable({
        head: [['Item', 'Peso Líquido']],
        body: tabelaResumo,
        startY: 30,
        

    styles: {
        fontSize: 12,
        cellPadding: 3
    },
    headStyles: {
        fontSize: 13
    }
    
    });

    const nomeResumo = `${clienteNome}_${dataFormatada}.pdf`;
    docResumo.save(nomeResumo);
}
window.onload = function() {

    nomeCliente = localStorage.getItem(pesagemId + "_cliente");

    if (!nomeCliente) {
        nomeCliente = prompt("Por favor, insira o nome do cliente:");
        if (!nomeCliente) nomeCliente = "Cliente Desconhecido";

        localStorage.setItem(pesagemId + "_cliente", nomeCliente);
    }

    // 🔥 AQUI MUDA O NOME DA ABA
    document.title = nomeCliente;

    const dataAtual = new Date().toLocaleDateString('pt-BR');

    document.getElementById("headerInfo").textContent =
        `${nomeCliente.toUpperCase()}`;
atualizarStatus("salvo");
    renderizarTabela();
    registrarPesagem();
};
function trocarCliente() {
    let novoCliente = prompt("Digite o nome do novo cliente:");

    if (!novoCliente) {
        alert("Nome inválido!");
        return;
    }

    nomeCliente = novoCliente;

    // salva cliente da pesagem
    localStorage.setItem(pesagemId + "_cliente", nomeCliente);

    // 🔥 ATUALIZA NO PAINEL
    let lista = JSON.parse(localStorage.getItem("listaPesagens")) || [];

    lista = lista.map(p => {
        if (p.id === pesagemId) {
            return {
                ...p,
                cliente: nomeCliente
            };
        }
        return p;
    });

    localStorage.setItem("listaPesagens", JSON.stringify(lista));

    // atualiza tela
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    document.getElementById("headerInfo").textContent =
        `GTA SUCATAS - Cliente: ${nomeCliente} - Data: ${dataAtual}`;
}

function imprimirCupom() {
    const dataAtual = new Date().toLocaleString('pt-BR');

    // Nome do arquivo (para impressão/PDF)
    const nomeArquivo = nomeCliente.trim().replace(/[^a-zA-Z0-9]/g, "_");

    let total = 0;

    // 🔥 AGRUPAR PRODUTOS
    const agrupado = {};

    produtos.forEach(p => {
        if (!agrupado[p.item]) {
            agrupado[p.item] = 0;
        }
        agrupado[p.item] += p.pesoLiquido;
        total += p.pesoLiquido;
    });

    // 🔥 MONTAR ITENS
    let itens = "";

    Object.entries(agrupado)
    .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
    .forEach(([item, peso]) => {
        itens += `
            <div class="item">
                <div>${item}</div>
                <div>${peso.toFixed(2)} Kg</div>
            </div>
        `;
    });

    const numeroWhatsApp = "5521995691457";
    const mensagem = encodeURIComponent(`Olá`);
    const linkWhats = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(linkWhats)}`;

    let win = window.open("", "", "width=300,height=600");

    win.document.write(`
        <html>
        <head>
            <title>Cupom - ${nomeArquivo}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    width: 48mm;
                    text-align: center;
                    margin: 0 auto;
                    padding: 10px;
                    font-size: 13px; /* 🔥 FONTE GERAL MAIOR */
                }

                .logo {
    width: 115%; /* 🔥 maior sem quebrar layout */
    max-width: 48mm; /* garante que não ultrapasse o papel */
    margin-bottom: 8px;
}

                .item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px; /* 🔥 ITENS MAIORES */
                    margin-bottom: 3px;
                }

                .item div:first-child {
                    max-width: 65%;
                    text-align: left;
                }

                .item div:last-child {
                    text-align: right;
                }

                hr {
                    border: none;
                    border-top: 1px dashed black;
                    margin: 8px 0;
                }

                .zap {
                    font-size: 11px;
                    margin-top: 5px;
                    font-weight: bold;
                }

                .total {
                    font-size: 16px; /* 🔥 DESTAQUE TOTAL */
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                }

                @media print {
                    @page { margin: 0; }
                    body { margin: 0.5cm; }
                }
            </style>
        </head>

        <body>
            <img src="logo.png" class="logo">

     
            

            <div style="text-align: left;">
                <div><strong>Cliente:</strong> ${nomeCliente.toUpperCase()}</div>
                <div><strong>Data:</strong> ${dataAtual}</div>
            </div>

            <hr>

            ${itens}

            <hr>

            <div class="total">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)} Kg</span>
            </div>

            <hr>

            <br><br>
            <div style="border-top: 1px solid black; margin-top: 10px;">
                Assinatura
            </div>
 <br><br><br>

               <img src="${qrCodeURL}" style="margin: 10px 0;">
            <div class="zap">Fale conosco no WhatsApp</div>

<br><br><br>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
atualizarStatus("impresso");
    win.document.close();
}
function atualizarStatus(novoStatus) {
    let lista = JSON.parse(localStorage.getItem("listaPesagens")) || [];

    lista = lista.map(p => {
        if (p.id === pesagemId) {
            return {
                ...p,
                status: novoStatus
            };
        }
        return p;
    });

    localStorage.setItem("listaPesagens", JSON.stringify(lista));
}
