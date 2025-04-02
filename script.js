let produtos = localStorage.getItem('produtos') ? JSON.parse(localStorage.getItem('produtos')) : [];
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
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.onload = function() {
    nomeCliente = window.prompt("Por favor, insira o nome do cliente:");
    if (!nomeCliente) {
        nomeCliente = "Cliente Desconhecido";
    }
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    document.getElementById("headerInfo").textContent = `Irmãos Soares  -   Cliente: ${nomeCliente}    -   Data: ${dataAtual}`;
    renderizarTabela();
};

function adicionarProduto() {
    const item = document.getElementById("item").value;
    const pesoBruto = parseFloat(document.getElementById("pesoBruto").value);
    const tara = parseFloat(document.getElementById("tara").value);
    
    let pesoLiquido = pesoBruto - tara;
    if (item.toLowerCase() === 'lata -4%') {
        pesoLiquido *= 0.96;
    }
    
    produtos.push({ item, pesoBruto, tara, pesoLiquido });
    
    renderizarTabela();
    limparCampos();
    salvarLocalStorage();
    modal.style.display = "none";
}

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

function resetTabela() {
    if (confirm("Tem certeza que deseja resetar a tabela?")) {
        produtos = [];
        renderizarTabela();
        localStorage.removeItem('produtos');
    }
}

function salvarLocalStorage() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
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
}

function salvarTabela() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    doc.text(`Irmãos Soares  -   Cliente: ${nomeCliente}    -   Data: ${dataAtual}`, 10, 10);
    
    const produtosAgrupados = agruparProdutos();
    
    const tabela = [];
    for (let item in produtosAgrupados) {
        const p = produtosAgrupados[item];
        tabela.push([item, p.pesoBruto.toFixed(2), p.tara.toFixed(2), p.pesoLiquido.toFixed(2)]);
    }
    
    doc.autoTable({
        head: [['Item', 'Peso Bruto', 'Tara', 'Peso Líquido']],
        body: tabela,
        startY: 20
    });
    
    doc.save(`${nomeCliente.replace(/ /g, "_")}_${dataAtual.replace(/\//g, "-")}.pdf`);
}
