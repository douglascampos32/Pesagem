  
        let produtos = localStorage.getItem('produtos') ? JSON.parse(localStorage.getItem('produtos')) : {};

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
                    <td><button  onclick="excluirProduto('${item}')">Excluir</button></td>
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
            document.getElementById("item").value = "";
            document.getElementById("pesoBruto").value = "";
            document.getElementById("tara").value = "";
        }

        function imprimirTabela() {
            window.print();
        }

        function salvarTabela() {
            salvarLocalStorage();
            alert("Tabela salva com sucesso!");
        }

        function salvarLocalStorage() {
            localStorage.setItem('produtos', JSON.stringify(produtos));
        }

        function resetTabela() {
            const confirmarReset = confirm("Tem certeza que deseja resetar a tabela?");
            if (confirmarReset) {
                produtos = {};
                renderizarTabela();
                localStorage.removeItem('produtos');
            }
        }
        
   // Carregar tabela do localStorage ao carregar a página
        window.onload = function() {
            renderizarTabela();
        };