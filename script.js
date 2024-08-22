let produtos = localStorage.getItem('produtos') ? JSON.parse(localStorage.getItem('produtos')) : {};

// Função para abrir o modal
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
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function adicionarProduto() {
    const item = document.getElementById("item").value;
    const pesoBruto = parseFloat(document.getElementById("pesoBruto").value);
    const tara = parseFloat(document.getElementById("tara").value);

    let pesoLiquido = pesoBruto - tara;
    if (item.toLowerCase() === 'lata -4%') {
        pesoLiquido *= 0.96; // Desconto de 4% para latas
    }

    if (!produtos[item]) {
        produtos[item] = { pesoBruto: pesoBruto, tara: tara, pesoLiquido: pesoLiquido };
    } else {
        produtos[item].pesoBruto += pesoBruto;
        produtos[item].tara += tara;
        produtos[item].pesoLiquido += pesoLiquido;
    }

    renderizarTabela();
    limparCampos();
    salvarLocalStorage();
    modal.style.display = "none"; // Fechar o modal após adicionar o produto
}

function renderizarTabela() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    let totalPeso = 0;

    for (let item in produtos) {
        const produto = produtos[item];
        totalPeso += produto.pesoLiquido;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item}</td>
            <td>${produto.pesoBruto.toFixed(2)}</td>
            <td>${produto.tara.toFixed(2)}</td>
            <td>${produto.pesoLiquido.toFixed(2)}</td>
            <td class="acoes"><button onclick="excluirProduto('${item}')">Excluir</button></td>
        `;
        tbody.appendChild(tr);
    }

    document.getElementById("totalPeso").textContent = totalPeso.toFixed(2);
}

function excluirProduto(item) {
    const confirmarExclusao = confirm(`Tem certeza que deseja excluir o produto '${item}'?`);
    if (confirmarExclusao) {
        delete produtos[item];
        renderizarTabela();
        salvarLocalStorage();
    }
}

function limparCampos() {
    document.getElementById("form").reset();
}

function imprimirTabela() {
    window.print();
}

function resetTabela() {
    const confirmarReset = confirm("Tem certeza que deseja resetar a tabela?");
    if (confirmarReset) {
        produtos = {};
        renderizarTabela();
        localStorage.removeItem('produtos');
    }
}

function salvarLocalStorage() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
}
// Variável global para armazenar o nome do cliente
// Variável global para armazenar o nome do cliente
let nomeCliente;

window.onload = function() {
    // Solicita o nome do cliente ao carregar a página
    nomeCliente = window.prompt("Por favor, insira o nome do cliente:");

    // Caso o usuário não insira um nome, define um valor padrão
    if (!nomeCliente) {
        nomeCliente = "Cliente Desconhecido";
    }

    // Obter a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Inserir o nome do cliente e a data no cabeçalho da tabela
    const headerInfo = document.getElementById("headerInfo");
    headerInfo.textContent = `Irmãos Soares  -   Cliente: ${nomeCliente}    -   Data: ${dataAtual}`;

    // Renderiza a tabela ao carregar a página
    renderizarTabela();
};

function salvarTabela() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obter a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR');

  
    // Adicionar a tabela ao PDF
    const tabela = document.getElementById("tabela");
    doc.autoTable({
        html: tabela,
        startY: 40,
        styles: { cellPadding: 3, fontSize: 10, halign: 'center' },
    });

    // Salvar o PDF com um nome padrão
    doc.save(`_${nomeCliente.replace(/ /g, "_")}_${dataAtual.replace(/\//g, "-")}.pdf`);
}
