const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Configurações Globais
let escalaPx = 30; 
let zoom = 1.0;
let itens = [];      
let estoque = [];    
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let vistaLateral = false;
let escalaAtualUsada = 30; 

// --- 1. CARREGAMENTO DE ASSETS ---
const imagens = {
    logo: new Image(),
    mesa_4: new Image(), mesa_6: new Image(), mesa_8: new Image(),
    sofa_2: new Image(), sofa_3: new Image(),
    porta_simples: new Image(), porta_dupla: new Image(),
    janela_dupla: new Image(), janela_basculante: new Image()
};

imagens.logo.src = 'assets/img/1574799294920.png';
imagens.mesa_4.src = 'assets/img/mesa_4c.png';
imagens.mesa_6.src = 'assets/img/mesa_6c.png';
imagens.mesa_8.src = 'assets/img/mesa_8c.png';
imagens.sofa_2.src = 'assets/img/sofa_2l.png';
imagens.sofa_3.src = 'assets/img/sofa_3l.png';

Object.values(imagens).forEach(img => img.onload = () => desenhar());

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

// --- 2. FUNÇÕES DE INTERFACE ---
function enviarDadosParaPapel() { desenhar(); }

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const qtd = parseInt(document.getElementById('qtd_componente').value) || 1;
    const andar = document.getElementById('sel_andar').value;
    const cor = document.getElementById('cor_escolhida').value;
    
    if (biblioteca[tipo]) {
        for(let i = 0; i < qtd; i++) {
            estoque.push({ 
                id: Date.now() + i, tipo, andar, cor, 
                x: 300 + (i*15), y: 300 + (i*15), rot: 0, 
                ...biblioteca[tipo] 
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

function desenharVistaLateral() { vistaLateral = true; desenhar(); }
function voltarParaPlanta() { vistaLateral = false; desenhar(); }
function limparTudo() { itens = []; estoque = []; atualizarListaEstoque(); desenhar(); }

// FUNÇÃO DE ZOOM CORRIGIDA PARA ROLAGEM
function ajustarZoom(delta) { 
    zoom = Math.max(0.2, Math.min(3.0, zoom + delta)); 
    // Redimensiona o Canvas fisicamente para a div criar as barras
    canvas.style.width = (1200 * zoom) + "px";
    canvas.style.height = (800 * zoom) + "px";
    desenhar(); 
}

// --- 3. FUNÇÃO PRINCIPAL DE DESENHO ---
function desenhar() {
    const andarVisivel = document.getElementById('sel_andar_view').value;
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
    ctx.clearRect(0, 0, canvas.width / zoom, canvas.height / zoom);

    if (imagens.logo.complete) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.drawImage(imagens.logo, 150, 150, 600, 500);
        ctx.restore();
    }

    desenharSeloTecnico();
    desenharLegendaAutomatica();

    const m_larg = parseFloat(document.getElementById('terr_larg').value) || 0;
    const m_comp = parseFloat(document.getElementById('terr_comp').value) || 0;

    escalaAtualUsada = escalaPx;

    if (m_larg > 0 && m_comp > 0 && !vistaLateral) {
        const areaUtilW = 860;
        const areaUtilH = 740;

        if ((m_larg * escalaAtualUsada) > areaUtilW || (m_comp * escalaAtualUsada) > areaUtilH) {
            const ratioW = areaUtilW / m_larg;
            const ratioH = areaUtilH / m_comp;
            escalaAtualUsada = Math.min(ratioW, ratioH) * 0.95;
        }

        const px_w = m_larg * escalaAtualUsada;
        const px_h = m_comp * escalaAtualUsada;
        const ox = (900 - px_w) / 2;
        const oy = (800 - px_h) / 2;

        ctx.save();
        ctx.setLineDash([10, 5]);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, px_w, px_h);
        ctx.setLineDash([]);
        ctx.fillStyle = "red";
        ctx.font = "bold 14px Arial";
        ctx.fillText(`LOTE: ${m_larg}m x ${m_comp}m (Escala: 1:${Math.round(100 * (30/escalaAtualUsada))})`, ox, oy - 10);
        ctx.restore();
    }

    if (vistaLateral) {
        const yBase = 600;
        ctx.save();
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(50, yBase); ctx.lineTo(850, yBase); ctx.stroke();
        ctx.fillStyle = "#8B4513";
        ctx.font = "bold 12px Arial";
        ctx.fillText("⬅ FRENTE (RUA)", 50, yBase + 20);
        ctx.fillText("FUNDO ➡", 780, yBase + 20);
        ctx.restore();
    }

    itens.filter(it => it.andar === andarVisivel).forEach(item => {
        vistaLateral ? renderizarItemCorte(item) : renderizarItemPlanta(item);
    });
}

function renderizarItemPlanta(item) {
    const w = item.w * escalaAtualUsada;
    const h = item.h * escalaAtualUsada;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot * Math.PI / 180);
    if (item.usaImg && imagens[item.tipo].complete) {
        ctx.drawImage(imagens[item.tipo], -w/2, -h/2, w, h);
    } else {
        ctx.fillStyle = item.cor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.globalAlpha = 1.0;
    }
    ctx.strokeStyle = (selecionado === item) ? "blue" : "#333";
    ctx.lineWidth = (selecionado === item) ? 3 : 1;
    ctx.strokeRect(-w/2, -h/2, w, h);
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.nome, 0, 5);
    ctx.restore();
}

function renderizarItemCorte(item) {
    const w = item.w * escalaAtualUsada;
    const alt = item.alt * escalaAtualUsada;
    const yBase = 600;
    ctx.fillStyle = item.cor;
    ctx.fillRect(item.x - w/2, yBase - alt, w, alt);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(item.x - w/2, yBase - alt, w, alt);
    ctx.fillStyle = "#000";
    ctx.font = "9px Arial";
    ctx.fillText(`${item.alt}m`, item.x - 5, yBase - alt - 5);
}

function desenharSeloTecnico() {
    const cli = document.getElementById('cli_nome').value || "---";
    const resp = document.getElementById('resp_tec').value || "MÁRCIO - BTI";
    const larg = document.getElementById('terr_larg').value || "0";
    const comp = document.getElementById('terr_comp').value || "0";
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 1180, 780);
    ctx.beginPath(); ctx.moveTo(900, 10); ctx.lineTo(900, 790); ctx.stroke();
    if (imagens.logo.complete) ctx.drawImage(imagens.logo, 950, 30, 180, 120);
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.fillText("PROJETO TÉCNICO", 920, 180);
    ctx.font = "12px Arial";
    ctx.fillText(`CLIENTE: ${cli.toUpperCase()}`, 920, 210);
    ctx.fillText(`RESP.: ${resp.toUpperCase()}`, 920, 230);
    ctx.fillText(`TERRENO: ${larg}m x ${comp}m`, 920, 250);
    ctx.restore();
}

function desenharLegendaAutomatica() {
    let y = 300;
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText("LEGENDA E QUANTIDADES:", 920, y);
    y += 25;
    const contagem = {};
    itens.forEach(it => { contagem[it.nome] = (contagem[it.nome] || 0) + 1; });
    Object.keys(contagem).forEach(nome => {
        const it = itens.find(i => i.nome === nome);
        ctx.fillStyle = it.cor;
        ctx.fillRect(920, y - 12, 15, 15);
        ctx.strokeStyle = "#000"; ctx.strokeRect(920, y - 12, 15, 15);
        ctx.fillStyle = "#000"; ctx.font = "12px Arial";
        ctx.fillText(`${nome}: ${contagem[nome]} un.`, 945, y);
        y += 22;
    });
    ctx.restore();
}

// EVENTOS COM HITBOX MELHORADA (SELEÇÃO FÁCIL)
canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    
    selecionado = [...itens].reverse().find(it => {
        const w = it.w * escalaAtualUsada; 
        const h = it.h * escalaAtualUsada;
        // Hitbox: Mínimo de 20px de área de clique para itens finos (portas/janelas)
        const clickW = Math.max(w, 20);
        const clickH = Math.max(h, 20);
        return mx > it.x - clickW/2 && mx < it.x + clickW/2 && my > it.y - clickH/2 && my < it.y + clickH/2;
    });
    
    if (selecionado) {
        arrastando = true;
        mouseOffset.x = mx - selecionado.x;
        mouseOffset.y = my - selecionado.y;
    }
    desenhar();
};

canvas.onmousemove = (e) => {
    if (arrastando && selecionado) {
        const rect = canvas.getBoundingClientRect();
        selecionado.x = (e.clientX - rect.left) / zoom - mouseOffset.x;
        selecionado.y = (e.clientY - rect.top) / zoom - mouseOffset.y;
        desenhar();
    }
};

window.onmouseup = () => arrastando = false;

window.onkeydown = (e) => {
    if (!selecionado) return;
    const k = e.key.toLowerCase();
    if (k === 'r') selecionado.rot += 15;
    if (k === 'delete') { itens = itens.filter(it => it !== selecionado); selecionado = null; }
    if (e.key === 'ArrowUp') selecionado.h += 0.1;
    if (e.key === 'ArrowDown') selecionado.h -= 0.1;
    if (e.key === 'ArrowRight') selecionado.w += 0.1;
    if (e.key === 'ArrowLeft') selecionado.w -= 0.1;
    desenhar();
};

desenhar();
