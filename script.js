/**
 * Foco: Sincronização Planta Baixa -> Vista Lateral (Corte)
 */

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 30; // 1 metro = 30 pixels

// Tamanho da Prancha (Padrão Plotter para caber tudo como na image_791b97.jpg)
canvas.width = 1400;
canvas.height = 1000;

let itens = [];      // Itens no papel
let estoque = [];    // Itens na lista de espera (Estoque)
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };

// --- ACRÉSCIMO: CARREGAMENTO DA LOGO ---
const minhaLogo = new Image();
minhaLogo.src = '1574799294920.png'; 
minhaLogo.onload = () => desenhar(); // Redesenha quando a logo carregar

// Configurações base dos blocos (Topo vs Frente)
const biblioteca = {
    'quarto': { w: 4, h: 4, alt: 2.8, cor: '#87CEEB' },
    'banheiro': { w: 2, h: 2.5, alt: 2.8, cor: '#ADD8E6' },
    'sala': { w: 5, h: 5, alt: 2.8, cor: '#B0C4DE' },
    'parede': { w: 5, h: 0.15, alt: 2.8, cor: '#333' }
};

// --- 1. GESTÃO DE ESTOQUE (COMO ERA ANTES - MANUAL) ---

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const config = biblioteca[tipo];
    
    if (config) {
        estoque.push({ tipo, ...config });
        atualizarInterfaceEstoque();
    }
}

function atualizarInterfaceEstoque() {
    const painel = document.getElementById('lista-estoque');
    painel.innerHTML = "<h3>📦 ESTOQUE</h3>";
    
    estoque.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = "card-estoque";
        btn.innerHTML = `Inserir ${item.tipo.toUpperCase()}`;
        btn.onclick = () => carregarNoPapel(index);
        painel.appendChild(btn);
    });
}

function carregarNoPapel(index) {
    const base = estoque[index];
    // Adiciona ao papel com coordenadas iniciais
    itens.push({
        ...base,
        x: 100, 
        y: 600, // Começa na área da Planta Baixa
        rot: 0,
        id: Date.now()
    });
    estoque.splice(index, 1); // Remove do estoque
    atualizarInterfaceEstoque();
    desenhar();
}

// --- 2. NÚCLEO DE DESENHO (PLANTA + CORTE SINCRONIZADO) ---

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- ACRÉSCIMO: MARCA D'ÁGUA DE AUTENTICIDADE ---
    ctx.save();
    ctx.globalAlpha = 0.05; // Bem sutil para o portfólio
    if (minhaLogo.complete) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.drawImage(minhaLogo, -300, -200, 600, 400);
    }
    ctx.restore();

    // Desenha a Moldura da Folha e o Selo à direita (image_791b97.jpg)
    desenharEstruturaPrancha();

    // ÁREA DA PLANTA BAIXA (Visto de Cima)
    ctx.save();
    desenharGrade(50, 550, 800, 400); // Grade de referência
    itens.forEach(item => desenharBlocoTopo(item));
    ctx.restore();

    // ÁREA DO CORTE / VISTA LATERAL (Visto de Frente)
    // Sincroniza o X da planta baixa com o X do corte automaticamente
    ctx.save();
    desenharGrade(50, 100, 800, 300);
    itens.forEach(item => desenharBlocoCorte(item));
    ctx.restore();
}

function desenharBlocoTopo(item) {
    const w = item.w * escalaPx;
    const h = item.h * escalaPx;
    
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot * Math.PI / 180);
    
    ctx.fillStyle = item.cor;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);
    
    // Indica o nome no centro
    ctx.fillStyle = "#000";
    ctx.globalAlpha = 1;
    ctx.font = "10px Arial";
    ctx.fillText(item.tipo, -10, 0);
    
    if (selecionado === item) {
        ctx.strokeStyle = "red";
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-w/2 - 5, -h/2 - 5, w + 10, h + 10);
    }
    ctx.restore();
}

function desenharBlocoCorte(item) {
    const w = item.w * escalaPx;
    const alturaParede = item.alt * escalaPx;
    const ySoloCorte = 350; // Linha do chão na vista superior

    ctx.save();
    // SINCRONIZAÇÃO: Usa o mesmo X da planta baixa!
    ctx.translate(item.x, ySoloCorte);
    
    ctx.fillStyle = item.cor;
    ctx.globalAlpha = 0.6;
    // Desenha de baixo para cima (frente do bloco)
    ctx.fillRect(-w/2, -alturaParede, w, alturaParede);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(-w/2, -alturaParede, w, alturaParede);
    
    ctx.restore();
}

function desenharEstruturaPrancha() {
    // Margem externa
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Linha divisória do Selo
    ctx.beginPath();
    ctx.moveTo(1000, 10);
    ctx.lineTo(1000, 990);
    ctx.stroke();

    // --- ACRÉSCIMO: LOGO NO SELO ---
    if (minhaLogo.complete) {
        ctx.drawImage(minhaLogo, 1080, 50, 240, 160);
    }

    // Textos do Selo (Baseado na sua planta original)
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.fillText("PROJETO TÉCNICO", 1020, 240);
    ctx.font = "14px Arial";
    ctx.fillText("RESPONSÁVEL: MÁRCIO - BTI", 1020, 270);
    ctx.fillText("ESCALA: 1:50", 1020, 290);
    
    // Títulos das Vistas
    ctx.font = "bold 16px Arial";
    ctx.fillText("VISTA LATERAL (CORTE AA)", 50, 80);
    ctx.fillText("PLANTA BAIXA - TÉRREO", 50, 530);
}

function desenharGrade(x, y, w, h) {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    for(let i=0; i<w; i+=escalaPx) {
        ctx.beginPath(); ctx.moveTo(x+i, y); ctx.lineTo(x+i, y+h); ctx.stroke();
    }
    for(let i=0; i<h; i+=escalaPx) {
        ctx.beginPath(); ctx.moveTo(x, y+i); ctx.lineTo(x+w, y+i); ctx.stroke();
    }
}

// --- 3. INTERAÇÃO (ARRASTAR NA PLANTA ATUALIZA TUDO) ---

canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    selecionado = null;
    // Verifica colisão na Planta Baixa
    for (let i = itens.length - 1; i >= 0; i--) {
        const it = itens[i];
        const w = it.w * escalaPx;
        const h = it.h * escalaPx;
        if (mx > it.x - w/2 && mx < it.x + w/2 && my > it.y - h/2 && my < it.y + h/2) {
            selecionado = it;
            arrastando = true;
            mouseOffset.x = mx - it.x;
            mouseOffset.y = my - it.y;
            break;
        }
    }
    desenhar();
};

canvas.onmousemove = (e) => {
    if (arrastando && selecionado) {
        const rect = canvas.getBoundingClientRect();
        selecionado.x = (e.clientX - rect.left) - mouseOffset.x;
        selecionado.y = (e.clientY - rect.top) - mouseOffset.y;
        desenhar(); // Ao redesenhar, o corte já pega o novo X
    }
};

canvas.onmouseup = () => { arrastando = false; };

// Inicialização
desenhar();
