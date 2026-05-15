const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURAÇÕES GLOBAIS ---
let escalaPx = 30; 
let zoom = 1.0;
let itens = [];      
let estoque = [];    
let selecionado = null; // Item principal para redimensionar/girar
let itensSelecionados = []; // Lista para seleção múltipla
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let vistaLateral = false;
let escalaAtualUsada = 30; 

// Variáveis para Seleção por Área
let selecionandoArea = false;
let areaInicio = { x: 0, y: 0 };
let areaFim = { x: 0, y: 0 };

// --- 1. CARREGAMENTO DE ASSETS ---
const imagens = {
    logo: new Image(),
    mesa_4: new Image(), mesa_6: new Image(), mesa_8: new Image(),
    sofa_2: new Image(), sofa_3: new Image(),
    porta_simples: new Image(), porta_dupla: new Image(),
    janela_dupla: new Image(), janela_basculante: new Image()
};
// Definição dos caminhos - Certifique-se que os arquivos existem nestas pastas
imagens.logo.src = 'assets/img/1574799294920.png';
imagens.mesa_4.src = 'assets/img/mesa_4c.png';
imagens.mesa_6.src = 'assets/img/mesa_6c.png';
imagens.mesa_8.src = 'assets/img/mesa_8c.png';
imagens.sofa_2.src = 'assets/img/sofa_2l.png';
imagens.sofa_3.src = 'assets/img/sofa_3l.png';
imagens.porta_simples.src = 'assets/img/porta_simples.png';
imagens.porta_dupla.src = 'assets/img/porta_dupla.png';
imagens.janela_dupla.src = 'assets/img/janela_dupla.png';
imagens.janela_basculante.src = 'assets/img/janela_basculante.png';

// Redesenha o canvas assim que cada imagem terminar de carregar
Object.values(imagens).forEach(img => {
    img.onload = () => desenhar();
    img.onerror = (e) => console.warn("Imagem não encontrada: " + e.target.src);
});
// --- 2. BIBLIOTECA DE COMPONENTES ---
const biblioteca = {
    'suite_master': { nome: 'Suíte Master + Closet', w: 6.0, h: 5.0, alt: 2.8 },
    'suite_comum':  { nome: 'Suíte Comum', w: 4.0, h: 3.5, alt: 2.8 },
    'kitnet':       { nome: 'Kitnet', w: 5.0, h: 4.0, alt: 2.8 },
    'quarto':       { nome: 'Quarto', w: 3.5, h: 3.5, alt: 2.8 },
    'sala':         { nome: 'Sala de Estar', w: 5.0, h: 4.5, alt: 2.8 },
    'cozinha':      { nome: 'Cozinha', w: 3.0, h: 4.0, alt: 2.8 },
    'banheiro':     { nome: 'Banheiro Social', w: 1.5, h: 2.5, alt: 2.8 },
    'lavanderia':   { nome: 'Lavanderia', w: 2.0, h: 2.0, alt: 2.8 },
    'corredor':     { nome: 'Corredor', w: 1.0, h: 4.0, alt: 2.8 },
    'garagem':      { nome: 'Garagem', w: 3.5, h: 5.5, alt: 2.5 },
    'piscina':      { nome: 'Piscina', w: 3.0, h: 6.0, alt: 1.5 },
    'escada_reta':  { nome: 'Escada Reta', w: 1.0, h: 3.0, alt: 2.8 },
    'escada_l':     { nome: 'Escada em L', w: 2.0, h: 2.0, alt: 2.8 },
    'mesa_4':       { nome: 'Mesa (4 Lug)', w: 1.2, h: 1.2, alt: 0.75, usaImg: true },
    'mesa_6':       { nome: 'Mesa (6 Lug)', w: 1.8, h: 0.9, alt: 0.75, usaImg: true },
    'mesa_8':       { nome: 'Mesa (8 Lug)', w: 2.4, h: 1.1, alt: 0.75, usaImg: true },
    'sofa_2':       { nome: 'Sofá (2 Lug)', w: 1.6, h: 0.9, alt: 0.85, usaImg: true },
    'sofa_3':       { nome: 'Sofá (3 Lug)', w: 2.2, h: 0.9, alt: 0.85, usaImg: true },
    'porta_simples': { nome: 'Porta Simples', w: 0.8, h: 0.1, alt: 2.1, usaImg: true },
    'porta_dupla':   { nome: 'Porta Dupla', w: 1.6, h: 0.1, alt: 2.1, usaImg: true },
    'janela_dupla':  { nome: 'Janela Dupla', w: 1.5, h: 0.1, alt: 1.2, usaImg: true },
    'janela_basculante': { nome: 'Janela Basc.', w: 0.6, h: 0.1, alt: 0.6, usaImg: true }
};

// --- 3. FUNÇÕES DE INTERFACE ---
function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const qtd = parseInt(document.getElementById('qtd_componente').value) || 1;
    const andar = document.getElementById('sel_andar').value;
    const cor = document.getElementById('cor_escolhida').value;
    
    if (biblioteca[tipo]) {
        for(let i = 0; i < qtd; i++) {
            estoque.push({ 
                id: Date.now() + i + Math.random(), 
                tipo, andar, cor, x: 200, y: 200, rot: 0, ...biblioteca[tipo] 
            });
        }
        atualizarListaEstoque();
    }
}

function atualizarListaEstoque() {
    const lista = document.getElementById('lista-estoque');
    lista.innerHTML = "";
    estoque.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "item-pronto";
        div.innerHTML = `<b>${item.nome}</b> (Andar ${item.andar})`;
        div.onclick = () => {
            itens.push(item);
            estoque.splice(index, 1);
            atualizarListaEstoque();
            desenhar();
        };
        lista.appendChild(div);
    });
}

function ajustarZoom(delta) { 
    zoom = Math.max(0.2, Math.min(3.0, zoom + delta)); 
    canvas.style.width = (1200 * zoom) + "px";
    canvas.style.height = (800 * zoom) + "px";
    desenhar(); 
}

// --- 4. FUNÇÕES DE DESENHO ---
function desenhar() {
    const andarVisivel = document.getElementById('sel_andar_view').value;
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
    ctx.clearRect(0, 0, canvas.width / zoom, canvas.height / zoom);

    if (imagens.logo.complete) {
        ctx.save(); ctx.globalAlpha = 0.05;
        ctx.drawImage(imagens.logo, 150, 150, 600, 500); ctx.restore();
    }

    desenharSeloTecnico();

    // Desenhar Itens do Andar Ativo
    itens.filter(it => it.andar === andarVisivel).forEach(item => {
        const w = item.w * escalaAtualUsada;
        const h = item.h * escalaAtualUsada;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot * Math.PI / 180);

        const imgObj = imagens[item.tipo];
        if (item.usaImg && imgObj && imgObj.complete && imgObj.naturalWidth !== 0) {
            ctx.drawImage(imgObj, -w/2, -h/2, w, h);
        } else {
            ctx.fillStyle = item.cor || "#777";
            ctx.globalAlpha = 0.6;
            ctx.fillRect(-w/2, -h/2, w, h);
            ctx.globalAlpha = 1.0;
        }

        // Borda de Destaque para Selecionados
        if (itensSelecionados.includes(item)) {
            ctx.strokeStyle = "#0078d7";
            ctx.lineWidth = 3;
            ctx.strokeRect(-w/2 - 2, -h/2 - 2, w + 4, h + 4);
        } else {
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1;
            ctx.strokeRect(-w/2, -h/2, w, h);
        }

        ctx.fillStyle = "#000"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
        ctx.fillText(item.nome, 0, 5);
        ctx.restore();
    });

    // Desenha o Retângulo de Seleção (Marquee)
    if (selecionandoArea) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Desenha por cima de tudo sem zoom interno
        ctx.fillStyle = "rgba(0, 120, 215, 0.2)";
        ctx.strokeStyle = "#0078d7";
        const rx = areaInicio.x * zoom;
        const ry = areaInicio.y * zoom;
        const rw = (areaFim.x - areaInicio.x) * zoom;
        const rh = (areaFim.y - areaInicio.y) * zoom;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.restore();
    }
}

function desenharSeloTecnico() {
    ctx.save(); ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 1180, 780);
    ctx.beginPath(); ctx.moveTo(900, 10); ctx.lineTo(900, 790); ctx.stroke();
    ctx.fillStyle = "#000"; ctx.font = "bold 16px Arial";
    ctx.fillText("PROJETO TÉCNICO", 920, 50);
    ctx.restore();
}

// --- 5. EVENTOS DE INTERAÇÃO (COM SELEÇÃO MÚLTIPLA) ---
canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (1200 / rect.width);
    const my = (e.clientY - rect.top) * (800 / rect.height);
    
    const itemClicado = [...itens].reverse().find(it => {
        const w = it.w * escalaAtualUsada;
        const h = it.h * escalaAtualUsada;
        return mx > it.x - w/2 && mx < it.x + w/2 && my > it.y - h/2 && my < it.y + h/2;
    });

    if (itemClicado) {
        if (!itensSelecionados.includes(itemClicado)) {
            itensSelecionados = [itemClicado];
        }
        selecionado = itemClicado;
        arrastando = true;
        mouseOffset.x = mx;
        mouseOffset.y = my;
    } else {
        selecionandoArea = true;
        itensSelecionados = [];
        areaInicio = { x: mx, y: my };
        areaFim = { x: mx, y: my };
    }
    desenhar();
};

canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (1200 / rect.width);
    const my = (e.clientY - rect.top) * (800 / rect.height);

    if (arrastando) {
        const dx = mx - mouseOffset.x;
        const dy = my - mouseOffset.y;
        itensSelecionados.forEach(it => { it.x += dx; it.y += dy; });
        mouseOffset.x = mx;
        mouseOffset.y = my;
        desenhar();
    } else if (selecionandoArea) {
        areaFim = { x: mx, y: my };
        desenhar();
    }
};

window.onmouseup = () => {
    if (selecionandoArea) {
        const xMin = Math.min(areaInicio.x, areaFim.x);
        const xMax = Math.max(areaInicio.x, areaFim.x);
        const yMin = Math.min(areaInicio.y, areaFim.y);
        const yMax = Math.max(areaInicio.y, areaFim.y);
        itensSelecionados = itens.filter(it => it.x > xMin && it.x < xMax && it.y > yMin && it.y < yMax);
        selecionandoArea = false;
    }
    arrastando = false;
    desenhar();
};

window.onkeydown = (e) => {
    if (itensSelecionados.length === 0) return;
    const k = e.key.toLowerCase();
    if (k === 'r') itensSelecionados.forEach(it => it.rot += 15);
    if (k === 'delete' || k === 'backspace') {
        itens = itens.filter(it => !itensSelecionados.includes(it));
        itensSelecionados = [];
    }
    desenhar();
};

// --- FUNÇÕES EXTRAS ---
function limparTudo() { itens = []; estoque = []; atualizarListaEstoque(); desenhar(); }
function enviarDadosParaPapel() { desenhar(); }

desenhar();
