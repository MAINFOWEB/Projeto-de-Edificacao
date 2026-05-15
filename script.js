const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURAÇÕES GLOBAIS ---
let escalaPx = 30; 
let zoom = 1.0;
let itens = [];      
let estoque = [];    
let itensSelecionados = []; 
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let vistaLateral = false;
let escalaAtualUsada = 30; 

let selecionandoArea = false;
let areaInicio = { x: 0, y: 0 };
let areaFim = { x: 0, y: 0 };

// --- 1. CARREGAMENTO DE ASSETS (NOMES EXATOS DA IMAGEM) ---
const imagens = {
    logo: new Image(),
    // Assets da Imagem Enviada
    "carro01": new Image(),
    "escada01": new Image(),
    "escada02": new Image(),
    "escada03": new Image(),
    "mesa-de-sinuca": new Image(),
    "moto01": new Image(),
    "piscina01": new Image(),
    "piscina02": new Image(),
    "piscina03": new Image(),
    "piscina04": new Image(),
    "piscina05": new Image(),
    "piscina06": new Image(),
    "Porta direita 90D-13": new Image(),
    "porta": new Image(),
    "Porta-Sanfonada": new Image(),
    "sala01": new Image(),
    "sala02": new Image(),
    "sala03": new Image(),
    "sala04": new Image(),
    "sofa03": new Image(),
    "sofa04": new Image(),
    // Assets Originais
    mesa_4: new Image(), mesa_6: new Image(), mesa_8: new Image(),
    sofa_2: new Image(), sofa_3: new Image(),
    porta_simples: new Image(), porta_dupla: new Image(),
    janela_dupla: new Image(), janela_basculante: new Image()
};

// Caminhos dos arquivos
imagens.logo.src = 'assets/img/1574799294920.png';
imagens["carro01"].src = 'assets/img/carro01.png';
imagens["escada01"].src = 'assets/img/escada01.png';
imagens["escada02"].src = 'assets/img/escada02.png';
imagens["escada03"].src = 'assets/img/escada03.png';
imagens["mesa-de-sinuca"].src = 'assets/img/mesa-de-sinuca.png';
imagens["moto01"].src = 'assets/img/moto01.png';
imagens["piscina01"].src = 'assets/img/piscina01.png';
imagens["piscina02"].src = 'assets/img/piscina02.png';
imagens["piscina03"].src = 'assets/img/piscina03.png';
imagens["piscina04"].src = 'assets/img/piscina04.png';
imagens["piscina05"].src = 'assets/img/piscina05.png';
imagens["piscina06"].src = 'assets/img/piscina06.png';
imagens["Porta direita 90D-13"].src = 'assets/img/Porta direita 90D-13.png';
imagens["porta"].src = 'assets/img/porta.png';
imagens["Porta-Sanfonada"].src = 'assets/img/Porta-Sanfonada.png';
imagens["sala01"].src = 'assets/img/sala01.png';
imagens["sala02"].src = 'assets/img/sala02.png';
imagens["sala03"].src = 'assets/img/sala03.png';
imagens["sala04"].src = 'assets/img/sala04.png';
imagens["sofa03"].src = 'assets/img/sofa03.png';
imagens["sofa04"].src = 'assets/img/sofa04.png';

Object.values(imagens).forEach(img => {
    img.onload = () => desenhar();
});

// --- 2. BIBLIOTECA (INCLUINDO NOVOS CÔMODOS) ---
const biblioteca = {
    'suite_master':    { nome: 'Suíte Master', w: 6.0, h: 5.0, alt: 2.8 },
    'suite_normal':    { nome: 'Suíte Normal', w: 4.0, h: 3.5, alt: 2.8 },
    'kitnet':          { nome: 'Kitnet', w: 5.0, h: 4.0, alt: 2.8 },
    'quarto':          { nome: 'Quarto', w: 3.5, h: 3.5, alt: 2.8 },
    'sala':            { nome: 'Sala', w: 5.0, h: 4.5, alt: 2.8 },
    'cozinha':         { nome: 'Cozinha', w: 3.0, h: 4.0, alt: 2.8 },
    'banheiro':        { nome: 'Banheiro Social', w: 1.5, h: 2.5, alt: 2.8 },
    'banheiro_duplo':  { nome: 'Banheiro Duplo', w: 3.0, h: 2.5, alt: 2.8 },
    'lavanderia':      { nome: 'Lavanderia', w: 2.0, h: 2.0, alt: 2.8 },
    'area_servico':    { nome: 'Área de Serviço', w: 3.0, h: 2.0, alt: 2.8 },
    'corredor':        { nome: 'Corredor', w: 1.2, h: 4.0, alt: 2.8 },
    'garagem':         { nome: 'Garagem', w: 3.5, h: 5.5, alt: 2.5 },
    'piscina':         { nome: 'Piscina Base', w: 3.0, h: 6.0, alt: 1.5 },
    'escada_reta':     { nome: 'Escada Reta', w: 1.0, h: 3.0, alt: 2.8 },
    'escada_l':        { nome: 'Escada L', w: 2.0, h: 2.0, alt: 2.8 },
    
    // Itens da Imagem (Nomes IDÊNTICOS)
    'carro01': { nome: 'carro01', w: 2.2, h: 4.5, alt: 1.5, usaImg: true },
    'escada01': { nome: 'escada01', w: 1.0, h: 3.0, alt: 2.8, usaImg: true },
    'escada02': { nome: 'escada02', w: 1.0, h: 3.0, alt: 2.8, usaImg: true },
    'escada03': { nome: 'escada03', w: 2.0, h: 2.0, alt: 2.8, usaImg: true },
    'mesa-de-sinuca': { nome: 'mesa-de-sinuca', w: 2.5, h: 1.4, alt: 0.8, usaImg: true },
    'moto01': { nome: 'moto01', w: 0.8, h: 2.0, alt: 1.2, usaImg: true },
    'piscina01': { nome: 'piscina01', w: 4.0, h: 8.0, alt: 1.4, usaImg: true },
    'piscina02': { nome: 'piscina02', w: 5.0, h: 3.0, alt: 1.4, usaImg: true },
    'piscina03': { nome: 'piscina03', w: 6.0, h: 4.0, alt: 1.4, usaImg: true },
    'piscina04': { nome: 'piscina04', w: 4.5, h: 4.5, alt: 1.4, usaImg: true },
    'piscina05': { nome: 'piscina05', w: 3.5, h: 7.0, alt: 1.4, usaImg: true },
    'piscina06': { nome: 'piscina06', w: 5.5, h: 5.5, alt: 1.4, usaImg: true },
    'Porta direita 90D-13': { nome: 'Porta direita 90D-13', w: 0.9, h: 0.1, alt: 2.1, usaImg: true },
    'porta': { nome: 'porta', w: 0.8, h: 0.1, alt: 2.1, usaImg: true },
    'Porta-Sanfonada': { nome: 'Porta-Sanfonada', w: 0.8, h: 0.1, alt: 2.1, usaImg: true },
    'sala01': { nome: 'sala01', w: 4.0, h: 4.0, alt: 1.0, usaImg: true },
    'sala02': { nome: 'sala02', w: 3.5, h: 3.5, alt: 1.0, usaImg: true },
    'sala03': { nome: 'sala03', w: 4.2, h: 4.2, alt: 1.0, usaImg: true },
    'sala04': { nome: 'sala04', w: 3.8, h: 3.8, alt: 1.0, usaImg: true },
    'sofa03': { nome: 'sofa03', w: 2.2, h: 0.9, alt: 0.85, usaImg: true },
    'sofa04': { nome: 'sofa04', w: 2.5, h: 1.0, alt: 0.85, usaImg: true }
};

// --- 3. FUNÇÕES DE INTERFACE ---
function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const qtd = parseInt(document.getElementById('qtd_componente').value) || 1;
    const andar = document.getElementById('sel_andar').value;
    const cor = document.getElementById('cor_escolhida').value;
    if (biblioteca[tipo]) {
        for(let i = 0; i < qtd; i++) {
            estoque.push({ id: Date.now() + Math.random(), tipo, andar, cor, x: 200, y: 200, rot: 0, ...biblioteca[tipo] });
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
        div.onclick = () => { itens.push(item); estoque.splice(index, 1); atualizarListaEstoque(); desenhar(); };
        lista.appendChild(div);
    });
}

function ajustarZoom(delta) { 
    zoom = Math.max(0.2, Math.min(3.0, zoom + delta)); 
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${zoom})`;
    desenhar(); 
}

function desenharVistaLateral() { vistaLateral = true; desenhar(); }
function voltarParaPlanta() { vistaLateral = false; desenhar(); }
function enviarDadosParaPapel() { desenhar(); }

// --- 4. FUNÇÕES DE DESENHO ---
function desenhar() {
    const andarVisivel = document.getElementById('sel_andar_view').value;
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imagens.logo.complete) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        const tamLogo = 500;
        ctx.drawImage(imagens.logo, (900 - tamLogo) / 2, (800 - tamLogo) / 2, tamLogo, tamLogo);
        ctx.restore();
    }

    desenharSeloTecnico();
    desenharEscalaTerreno();

    itens.filter(it => it.andar === andarVisivel).forEach(item => {
        const w = item.w * escalaAtualUsada;
        const h = vistaLateral ? (item.alt * escalaAtualUsada) : (item.h * escalaAtualUsada);
        
        ctx.save();
        if (vistaLateral) {
            const m_comp = parseFloat(document.getElementById('terr_comp').value) || 10;
            const soloY = (800 + (m_comp * escalaAtualUsada)) / 2;
            ctx.translate(item.x, soloY - h/2); 
        } else {
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rot * Math.PI / 180);
        }

        if (item.usaImg && imagens[item.tipo]?.complete && !vistaLateral) {
            ctx.drawImage(imagens[item.tipo], -w/2, -h/2, w, h);
        } else {
            ctx.fillStyle = item.cor || "#777";
            ctx.globalAlpha = 0.6;
            ctx.fillRect(-w/2, -h/2, w, h);
            ctx.globalAlpha = 1.0;
        }

        ctx.strokeStyle = (itensSelecionados.includes(item)) ? "#0078d7" : "#333";
        ctx.lineWidth = (itensSelecionados.includes(item)) ? 3 : 1;
        ctx.strokeRect(-w/2, -h/2, w, h);
        
        ctx.fillStyle = "#000";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(vistaLateral ? `${item.nome} (${item.alt}m)` : item.nome, 0, 5);
        ctx.restore();
    });

    if (selecionandoArea) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 120, 215, 0.2)";
        ctx.strokeStyle = "#0078d7";
        ctx.fillRect(areaInicio.x, areaInicio.y, areaFim.x - areaInicio.x, areaFim.y - areaInicio.y);
        ctx.strokeRect(areaInicio.x, areaInicio.y, areaFim.x - areaInicio.x, areaFim.y - areaInicio.y);
        ctx.restore();
    }
}

function desenharEscalaTerreno() {
    const m_larg = parseFloat(document.getElementById('terr_larg').value) || 0;
    const m_comp = parseFloat(document.getElementById('terr_comp').value) || 0;
    escalaAtualUsada = escalaPx;
    if (m_larg > 0 && m_comp > 0) {
        const areaUtilW = 850;
        const areaUtilH = 750;
        if ((m_larg * escalaPx) > areaUtilW || (m_comp * escalaPx) > areaUtilH) {
            escalaAtualUsada = Math.min(areaUtilW/m_larg, areaUtilH/m_comp) * 0.9;
        }
        const px_w = m_larg * escalaAtualUsada;
        const px_h = m_comp * escalaAtualUsada;
        ctx.strokeStyle = "red";
        ctx.setLineDash([5,5]);
        ctx.strokeRect((900-px_w)/2, (800-px_h)/2, px_w, px_h);
        ctx.setLineDash([]);
    }
}

function desenharSeloTecnico() {
    const cliente = document.getElementById('cli_nome')?.value || "---";
    const resp = document.getElementById('resp_tec')?.value || "---";
    const larg = document.getElementById('terr_larg')?.value || "0";
    const comp = document.getElementById('terr_comp')?.value || "0";

    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 1180, 780);
    ctx.beginPath(); ctx.moveTo(900, 10); ctx.lineTo(900, 790); ctx.stroke();
    
    if (imagens.logo.complete) {
        const boxSize = 120;
        ctx.drawImage(imagens.logo, 940, 20, boxSize, boxSize);
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText("PROJETO TÉCNICO", 910, 160);
    ctx.font = "11px Arial";
    ctx.fillText("CLIENTE: " + cliente, 910, 185);
    ctx.fillText("RESPONSÁVEL: " + resp, 910, 205);
    ctx.fillText(`LOTE: ${larg}m x ${comp}m`, 910, 225);

    ctx.font = "bold 12px Arial";
    ctx.fillText("LEGENDA / QUANTIDADES:", 910, 260);
    
    let counts = {};
    itens.forEach(it => {
        if(!counts[it.nome]) counts[it.nome] = { qtd: 0, cor: it.cor };
        counts[it.nome].qtd++;
    });

    Object.keys(counts).forEach((nome, i) => {
        let posY = 285 + (i * 22);
        ctx.fillStyle = counts[nome].cor || "#777";
        ctx.fillRect(915, posY - 10, 12, 12);
        ctx.strokeStyle = "#333";
        ctx.strokeRect(915, posY - 10, 12, 12);
        ctx.fillStyle = "#000";
        ctx.fillText(`${nome}: ${counts[nome].qtd} un.`, 935, posY);
    });
    ctx.restore();
}

// --- 5. EVENTOS ---
canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    const itemClicado = [...itens].reverse().find(it => {
        const w = it.w * escalaAtualUsada;
        const h = vistaLateral ? (it.alt * escalaAtualUsada) : (it.h * escalaAtualUsada);
        return mx > it.x-w/2 && mx < it.x+w/2 && my > it.y-h/2 && my < it.y+h/2;
    });

    if (itemClicado) {
        if (!itensSelecionados.includes(itemClicado)) itensSelecionados = [itemClicado];
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
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
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
        const x1 = Math.min(areaInicio.x, areaFim.x), x2 = Math.max(areaInicio.x, areaFim.x);
        const y1 = Math.min(areaInicio.y, areaFim.y), y2 = Math.max(areaInicio.y, areaFim.y);
        itensSelecionados = itens.filter(it => it.x > x1 && it.x < x2 && it.y > y1 && it.y < y2);
        selecionandoArea = false;
    }
    arrastando = false;
    desenhar();
};

window.addEventListener('keydown', function(e) {
    if (itensSelecionados.length === 0) return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (k === 'r') itensSelecionados.forEach(it => { it.rot = (it.rot + 15) % 360; });
    if (k === 'delete' || k === 'backspace') { itens = itens.filter(it => !itensSelecionados.includes(it)); itensSelecionados = []; }
    if (k === 'arrowup') itensSelecionados.forEach(it => it.h = Number((it.h + 0.1).toFixed(1)));
    if (k === 'arrowdown') itensSelecionados.forEach(it => it.h = Math.max(0.1, Number((it.h - 0.1).toFixed(1))));
    if (k === 'arrowright') itensSelecionados.forEach(it => it.w = Number((it.w + 0.1).toFixed(1)));
    if (k === 'arrowleft') itensSelecionados.forEach(it => it.w = Math.max(0.1, Number((it.w - 0.1).toFixed(1))));
    desenhar();
}, true);

function limparTudo() { itens = []; estoque = []; atualizarListaEstoque(); desenhar(); }
desenhar();
