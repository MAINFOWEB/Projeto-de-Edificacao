/**
 * SISTEMA DE PRANCHA ÚNICA - MÁRCIO TECH
 * Foco: Sincronização e Biblioteca Completa de Móveis em assets/img
 */

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 30; // 1 metro = 30 pixels

canvas.width = 1400;
canvas.height = 1000;

let itens = [];      
let estoque = [];    
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };

// --- 1. CENTRAL DE IMAGENS (MÓVEIS + LOGO + ALVENARIA) ---
const imagens = {
    logo: new Image(),
    parede: new Image(),
    mesa4: new Image(),
    mesa6: new Image(),
    mesa8: new Image(),
    sofa2: new Image(),
    sofa3: new Image()
};

// Configurando os caminhos na sua pasta organizada assets/img/
imagens.logo.src  = 'assets/img/1574799294920.png'; 
imagens.parede.src = 'assets/img/alvenaria.png';
imagens.mesa4.src  = 'assets/img/mesa_4c.png';
imagens.mesa6.src  = 'assets/img/mesa_6c.png';
imagens.mesa8.src  = 'assets/img/mesa_8c.png';
imagens.sofa2.src  = 'assets/img/sofa_2l.png';
imagens.sofa3.src  = 'assets/img/sofa_3l.png';

// Redesenha sempre que uma imagem carregar
Object.values(imagens).forEach(img => {
    img.onload = () => desenhar();
});

// --- 2. BIBLIOTECA DE BLOCOS (RESTAURADA E AMPLIADA) ---
const biblioteca = {
    'parede':  { w: 5,    h: 0.15, alt: 2.8, cor: '#333' },
    'quarto':  { w: 4,    h: 4,    alt: 2.8, cor: '#87CEEB' },
    'sala':    { w: 5,    h: 5,    alt: 2.8, cor: '#B0C4DE' },
    'banheiro':{ w: 2,    h: 2.5,  alt: 2.8, cor: '#ADD8E6' },
    'mesa4':   { w: 1.2,  h: 1.2,  alt: 0.75, cor: '#8B4513' },
    'mesa6':   { w: 1.8,  h: 0.9,  alt: 0.75, cor: '#8B4513' },
    'mesa8':   { w: 2.4,  h: 1.1,  alt: 0.75, cor: '#8B4513' },
    'sofa2':   { w: 1.6,  h: 0.9,  alt: 0.85, cor: '#555' },
    'sofa3':   { w: 2.2,  h: 0.9,  alt: 0.85, cor: '#555' }
};

// --- 3. LÓGICA DE DESENHO (PLANTA + CORTE + LOGO) ---

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Marca d'água (Autenticidade)
    ctx.save();
    ctx.globalAlpha = 0.05;
    if (imagens.logo.complete) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.drawImage(imagens.logo, -300, -200, 600, 400);
    }
    ctx.restore();

    desenharEstruturaPrancha();

    // Planta Baixa e Corte Lateral Sincronizados
    itens.forEach(item => {
        desenharBlocoTopo(item);
        desenharBlocoCorte(item);
    });
}

function desenharBlocoTopo(item) {
    const w = item.w * escalaPx;
    const h = item.h * escalaPx;
    const imgItem = imagens[item.tipo]; // Tenta pegar a imagem da biblioteca

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot * Math.PI / 180);
    
    if (imgItem && imgItem.complete && item.tipo !== 'quarto' && item.tipo !== 'sala') {
        // Se houver imagem (móveis ou parede), desenha a imagem
        ctx.drawImage(imgItem, -w/2, -h/2, w, h);
    } else {
        // Senão, desenha o bloco colorido (fallback)
        ctx.fillStyle = item.cor;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-w/2, -h/2, w, h);
    }

    ctx.strokeStyle = (selecionado === item) ? "red" : "#000";
    ctx.setLineDash((selecionado === item) ? [5, 5] : []);
    ctx.strokeRect(-w/2, -h/2, w, h);
    ctx.restore();
}

function desenharBlocoCorte(item) {
    const w = item.w * escalaPx;
    const alturaMovel = item.alt * escalaPx;
    const ySoloCorte = 350; 

    ctx.save();
    ctx.translate(item.x, ySoloCorte);
    
    // Na vista lateral, desenhamos apenas o contorno preenchido para o corte técnico
    ctx.fillStyle = item.cor;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-w/2, -alturaMovel, w, alturaMovel);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(-w/2, -alturaMovel, w, alturaMovel);
    ctx.restore();
}

function desenharEstruturaPrancha() {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.beginPath(); ctx.moveTo(1000, 10); ctx.lineTo(1000, 990); ctx.stroke();

    if (imagens.logo.complete) {
        ctx.drawImage(imagens.logo, 1080, 50, 240, 160);
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.fillText("PROJETO TÉCNICO", 1020, 240);
    ctx.font = "14px Arial";
    ctx.fillText("AUTOR: MÁRCIO - BTI", 1020, 270);
    ctx.fillText("SISTEMA DE GESTÃO E AUTOMAÇÃO", 1020, 290);
}

// --- 4. GESTÃO DE ESTOQUE E MOUSE ---

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    if (biblioteca[tipo]) {
        estoque.push({ tipo, ...biblioteca[tipo] });
        atualizarInterfaceEstoque();
    }
}

function atualizarInterfaceEstoque() {
    const painel = document.getElementById('lista-estoque');
    painel.innerHTML = "<h3>📦 ESTOQUE</h3>";
    estoque.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "card-estoque";
        div.innerHTML = `Inserir ${item.tipo.toUpperCase()}`;
        div.onclick = () => {
            itens.push({ ...item, x: 200, y: 700, rot: 0, id: Date.now() });
            estoque.splice(index, 1);
            atualizarInterfaceEstoque();
            desenhar();
        };
        painel.appendChild(div);
    });
}

canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    selecionado = [...itens].reverse().find(it => {
        const w = it.w * escalaPx; const h = it.h * escalaPx;
        return mx > it.x - w/2 && mx < it.x + w/2 && my > it.y - h/2 && my < it.y + h/2;
    });
    if (selecionado) { arrastando = true; mouseOffset.x = mx - selecionado.x; mouseOffset.y = my - selecionado.y; }
    desenhar();
};

canvas.onmousemove = (e) => {
    if (arrastando && selecionado) {
        const rect = canvas.getBoundingClientRect();
        selecionado.x = (e.clientX - rect.left) - mouseOffset.x;
        selecionado.y = (e.clientY - rect.top) - mouseOffset.y;
        desenhar();
    }
};

canvas.onmouseup = () => arrastando = false;

desenhar();
