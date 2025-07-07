// --- 1. IMPORTAÇÕES ---
// Importa a instância do banco de dados do nosso arquivo de configuração
import { db } from './firebase-config.js';
// Importa as funções do Firestore que vamos usar
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// --- 2. SELEÇÃO DOS ELEMENTOS DO HTML ---
// (Esta parte continua exatamente igual à anterior)
const form = document.getElementById('formVenda');
const tabelaVendas = document.getElementById('tabelaVendas');
const clienteInput = document.getElementById('cliente');
const farinhaSelect = document.getElementById('farinha');
const quantidadeInput = document.getElementById('quantidade');
const precoUnitarioInput = document.getElementById('precoUnitario');
const comissaoInput = document.getElementById('comissao');
const totalInput = document.getElementById('total');
const totalGeralVendasElement = document.getElementById('totalGeralVendas');
const totalGeralComissaoElement = document.getElementById('totalGeralComissao');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');

// --- 3. ESTADO DA APLICAÇÃO ---
// Não precisamos mais do array 'vendas'. O Firestore é nossa fonte da verdade.
let modoEdicao = false;
let idEmEdicao = null;

// --- 4. FUNÇÕES ---
const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const renderizarTabela = (vendas) => {
    tabelaVendas.innerHTML = '';
    let totalGeralVendas = 0;
    let totalGeralComissao = 0;
    let contadorId = 0;

    vendas.forEach((venda) => {
        contadorId++;
        const valorComissao = venda.totalVenda * (venda.comissaoPercentual / 100);
        totalGeralVendas += venda.totalVenda;
        totalGeralComissao += valorComissao;

        const novaLinha = tabelaVendas.insertRow();
        novaLinha.innerHTML = `
            <th scope="row">${contadorId}</th>
            <td>${venda.data}</td>
            <td>${venda.cliente}</td>
            <td>${venda.farinha}</td>
            <td>${venda.quantidade}</td>
            <td>${formatarMoeda(venda.precoUnitario)}</td>
            <td>${formatarMoeda(venda.totalVenda)}</td>
            <td>${formatarMoeda(valorComissao)} (${venda.comissaoPercentual}%)</td>
            <td>
                <button class="btn btn-warning btn-sm btn-editar" data-id="${venda.id}">Editar</button>
                <button class="btn btn-danger btn-sm btn-excluir" data-id="${venda.id}">Excluir</button>
            </td>
        `;
    });

    totalGeralVendasElement.textContent = formatarMoeda(totalGeralVendas);
    totalGeralComissaoElement.textContent = formatarMoeda(totalGeralComissao);
};

const calcularTotalVenda = () => {
    const quantidade = parseInt(quantidadeInput.value) || 0;
    const preco = parseFloat(precoUnitarioInput.value) || 0;
    if (quantidade > 0 && preco > 0) {
        totalInput.value = (quantidade * preco).toFixed(2).replace('.', ',');
    } else {
        totalInput.value = '';
    }
};

const resetarFormulario = () => {
    form.reset();
    totalInput.value = '';
    modoEdicao = false;
    idEmEdicao = null;
    btnSubmit.textContent = 'Adicionar Venda';
    btnSubmit.classList.replace('btn-success', 'btn-primary');
    btnCancel.classList.add('d-none');
    document.querySelector('h1').scrollIntoView({ behavior: 'smooth' });
};

// --- 5. EVENT LISTENERS ---
quantidadeInput.addEventListener('input', calcularTotalVenda);
precoUnitarioInput.addEventListener('input', calcularTotalVenda);

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dadosVenda = {
        data: new Date().toLocaleDateString('pt-BR'),
        cliente: clienteInput.value,
        farinha: farinhaSelect.value,
        quantidade: quantidadeInput.value,
        precoUnitario: parseFloat(precoUnitarioInput.value || 0),
        comissaoPercentual: parseFloat(comissaoInput.value || 0),
        totalVenda: parseFloat(totalInput.value.replace(',', '.')) || 0,
    };

    if (modoEdicao) {
        // ATUALIZA um documento existente no Firestore
        await updateDoc(doc(db, "vendas", idEmEdicao), dadosVenda);
    } else {
        // ADICIONA um novo documento no Firestore
        await addDoc(collection(db, "vendas"), dadosVenda);
    }

    resetarFormulario();
});

tabelaVendas.addEventListener('click', async (event) => {
    const elementoClicado = event.target;
    const id = elementoClicado.dataset.id;

    if (elementoClicado.classList.contains('btn-excluir')) {
        // DELETA um documento do Firestore
        await deleteDoc(doc(db, "vendas", id));

    } else if (elementoClicado.classList.contains('btn-editar')) {
        // Busca o documento no Firestore para editar (poderíamos otimizar, mas assim é mais seguro)
        const docRef = doc(db, "vendas", id);
        const docSnap = await getDoc(docRef); // Supondo que você importe getDoc
        if (docSnap.exists()) {
             const vendaParaEditar = docSnap.data();
             clienteInput.value = vendaParaEditar.cliente;
             farinhaSelect.value = vendaParaEditar.farinha;
             // ... preencher todos os campos
             modoEdicao = true;
             idEmEdicao = id;
             // ... mudar botões e rolar a tela
        }
    }
});

btnCancel.addEventListener('click', resetarFormulario);

// --- 6. INICIALIZAÇÃO E TEMPO REAL ---
// Esta é a mágica do Firebase. 'onSnapshot' é um ouvinte que dispara
// toda vez que há qualquer alteração na coleção 'vendas' no banco de dados.
onSnapshot(collection(db, "vendas"), (querySnapshot) => {
    const vendas = [];
    querySnapshot.forEach((doc) => {
        // Adiciona o ID do documento aos dados da venda
        vendas.push({ id: doc.id, ...doc.data() });
    });
    // Renderiza a tabela com os dados mais recentes do banco de dados
    renderizarTabela(vendas);
});