// Estado da aplicação
let produtos = [];
let carrinho = [];
let vendas = [];

// Elementos DOM
const tabs = {
  produtos: document.getElementById('tab-produtos'),
  vendas: document.getElementById('tab-vendas'),
  historico: document.getElementById('tab-historico')
};
const sections = {
  produtos: document.getElementById('section-produtos'),
  vendas: document.getElementById('section-vendas'),
  historico: document.getElementById('section-historico')
};
const formProduto = document.getElementById('form-produto');
const inputNome = document.getElementById('produto-nome');
const inputPreco = document.getElementById('produto-preco');
const inputEstoque = document.getElementById('produto-estoque');
const listaProdutos = document.getElementById('lista-produtos');
const produtosVenda = document.getElementById('produtos-venda');
const carrinhoItens = document.getElementById('carrinho-itens');
const carrinhoTotal = document.getElementById('carrinho-total');
const btnFinalizar = document.getElementById('finalizar-venda');
const historicoVendas = document.getElementById('historico-vendas');

// Navegação entre abas
function ativarTab(nome) {
  Object.keys(tabs).forEach(key => {
    tabs[key].classList.toggle('active', key === nome);
    sections[key].classList.toggle('active', key === nome);
  });
  if (nome === 'vendas') renderizarProdutosVenda();
  if (nome === 'historico') renderizarHistorico();
}

tabs.produtos.addEventListener('click', () => ativarTab('produtos'));
tabs.vendas.addEventListener('click', () => ativarTab('vendas'));
tabs.historico.addEventListener('click', () => ativarTab('historico'));

// Formatação de moeda
function formatarMoeda(valor) {
  return valor.toFixed(2).replace('.', ',');
}

// Cadastro de produto
formProduto.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = inputNome.value.trim();
  const preco = parseFloat(inputPreco.value);
  const estoque = parseInt(inputEstoque.value, 10);

  if (!nome || isNaN(preco) || preco <= 0 || isNaN(estoque) || estoque < 0) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const novoProduto = {
    id: Date.now(),
    nome,
    preco,
    estoque
  };

  produtos.push(novoProduto);
  formProduto.reset();
  renderizarProdutos();
  renderizarProdutosVenda();
});

// Renderizar lista de produtos cadastrados
function renderizarProdutos() {
  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<p class="vazio">Nenhum produto cadastrado.</p>';
    return;
  }

  listaProdutos.innerHTML = produtos.map(p => `
    <div class="produto-item">
      <div class="produto-info">
        <span><strong>${p.nome}</strong></span>
        <span class="preco">R$ ${formatarMoeda(p.preco)}</span>
        <span class="estoque">Estoque: ${p.estoque}</span>
      </div>
      <button class="btn-remover" data-id="${p.id}">Remover</button>
    </div>
  `).join('');

  listaProdutos.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', () => removerProduto(Number(btn.dataset.id)));
  });
}

function removerProduto(id) {
  if (!confirm('Deseja remover este produto?')) return;
  produtos = produtos.filter(p => p.id !== id);
  carrinho = carrinho.filter(item => item.produtoId !== id);
  renderizarProdutos();
  renderizarProdutosVenda();
  renderizarCarrinho();
}

// Renderizar produtos disponíveis para venda
function renderizarProdutosVenda() {
  const disponiveis = produtos.filter(p => p.estoque > 0);
  if (disponiveis.length === 0) {
    produtosVenda.innerHTML = '<p class="vazio">Nenhum produto disponível.</p>';
    return;
  }

  produtosVenda.innerHTML = disponiveis.map(p => `
    <div class="produto-venda">
      <div>
        <strong>${p.nome}</strong><br>
        <small>R$ ${formatarMoeda(p.preco)} | Estoque: ${p.estoque}</small>
      </div>
      <button data-id="${p.id}">Adicionar</button>
    </div>
  `).join('');

  produtosVenda.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => adicionarAoCarrinho(Number(btn.dataset.id)));
  });
}

// Adicionar item ao carrinho
function adicionarAoCarrinho(produtoId) {
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) return;

  const itemExistente = carrinho.find(item => item.produtoId === produtoId);
  const quantidadeAtual = itemExistente ? itemExistente.quantidade : 0;

  if (quantidadeAtual >= produto.estoque) {
    alert('Estoque insuficiente para este produto.');
    return;
  }

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({
      produtoId,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    });
  }

  renderizarCarrinho();
}

// Renderizar carrinho
function renderizarCarrinho() {
  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p class="vazio">Carrinho vazio.</p>';
    carrinhoTotal.textContent = '0,00';
    btnFinalizar.disabled = true;
    return;
  }

  carrinhoItens.innerHTML = carrinho.map(item => `
    <div class="carrinho-item">
      <div class="info">
        <strong>${item.nome}</strong>
        <span>R$ ${formatarMoeda(item.preco)}</span>
      </div>
      <div class="quantidade">
        <button data-action="diminuir" data-id="${item.produtoId}">−</button>
        <span>${item.quantidade}</span>
        <button data-action="aumentar" data-id="${item.produtoId}">+</button>
      </div>
      <div class="subtotal">R$ ${formatarMoeda(item.preco * item.quantidade)}</div>
    </div>
  `).join('');

  carrinhoItens.querySelectorAll('button').forEach(btn => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    btn.addEventListener('click', () => {
      if (action === 'aumentar') aumentarQuantidade(id);
      else diminuirQuantidade(id);
    });
  });

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  carrinhoTotal.textContent = formatarMoeda(total);
  btnFinalizar.disabled = false;
}

function aumentarQuantidade(produtoId) {
  const item = carrinho.find(i => i.produtoId === produtoId);
  const produto = produtos.find(p => p.id === produtoId);
  if (!item || !produto) return;

  if (item.quantidade >= produto.estoque) {
    alert('Estoque insuficiente.');
    return;
  }
  item.quantidade++;
  renderizarCarrinho();
}

function diminuirQuantidade(produtoId) {
  const item = carrinho.find(i => i.produtoId === produtoId);
  if (!item) return;

  item.quantidade--;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(i => i.produtoId !== produtoId);
  }
  renderizarCarrinho();
}

// Finalizar venda
btnFinalizar.addEventListener('click', () => {
  if (carrinho.length === 0) return;

  // Verificar estoque
  for (const item of carrinho) {
    const produto = produtos.find(p => p.id === item.produtoId);
    if (!produto || produto.estoque < item.quantidade) {
      alert(`Estoque insuficiente para ${item.nome}.`);
      return;
    }
  }

  // Baixar estoque
  carrinho.forEach(item => {
    const produto = produtos.find(p => p.id === item.produtoId);
    produto.estoque -= item.quantidade;
  });

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const venda = {
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    itens: carrinho.map(item => ({ ...item })),
    total
  };

  vendas.push(venda);
  carrinho = [];

  renderizarProdutos();
  renderizarProdutosVenda();
  renderizarCarrinho();
  renderizarHistorico();

  alert(`Venda finalizada! Total: R$ ${formatarMoeda(total)}`);
});

// Renderizar histórico de vendas
function renderizarHistorico() {
  if (vendas.length === 0) {
    historicoVendas.innerHTML = '<p class="vazio">Nenhuma venda realizada.</p>';
    return;
  }

  historicoVendas.innerHTML = vendas.slice().reverse().map(venda => `
    <div class="venda-card">
      <h4>Venda #${venda.id} — ${venda.data}</h4>
      <ul>
        ${venda.itens.map(item => `
          <li>${item.nome} — ${item.quantidade}x R$ ${formatarMoeda(item.preco)} = R$ ${formatarMoeda(item.preco * item.quantidade)}</li>
        `).join('')}
      </ul>
      <div class="total-venda">Total: R$ ${formatarMoeda(venda.total)}</div>
    </div>
  `).join('');
}

// Inicialização
renderizarProdutos();
renderizarProdutosVenda();
renderizarCarrinho();
renderizarHistorico();