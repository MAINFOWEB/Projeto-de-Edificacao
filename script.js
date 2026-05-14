const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 

canvas.width = 1200;
canvas.height = 800;

let itens = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.6; 
let modoVistaLateral = false;

let dadosNoPapel = { cliente: "", tecnico: "", largura: 0, comprimento: 0, area: 0, ativo: false };

const imagensCache = {};

// --- CONFIGURAÇÃO DE ITENS ---
const tamanhosBase = {
    'suite_master': {w: 6, h: 5, temBanheiro: true},
    'suite_comum': {w: 4, h: 4.5, temBanheiro: true},
    'kitnet': {w: 4, h: 7, temBanheiro: true},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'corredor': {w: 1.2, h: 4},
    'garagem': {w: 5, h: 6}, 'piscina': {w: 6, h: 3},
    'escada_reta': { w: 1, h: 3, isEscada: true, tipoEscada: 'reta' },
    'escada_l': { w: 2, h: 2, isEscada: true, tipoEscada: 'L' },
    'telhado_2_aguas': { w: 10, h: 8, isTelhado: true },
    'mesa_4': {w: 1.2, h: 1.2, isMobilia: true},
    'mesa_6': {w: 1.8, h: 1, isMobilia: true},
    'mesa_8': {w: 2.4, h: 1.1, isMobilia: true},
    'sofa_2': {w: 1.6, h: 0.9, isMobilia: true},
    'sofa_3': {w: 2.1, h: 0.9, isMobilia: true},
    'porta_simples': {w: 0.8, h: 0.1, isPorta: true},
    'porta_dupla': {w: 1.6, h: 0.1, isPorta: true},
    'janela_dupla': {w: 1.5, h: 0.15, isPorta: true},
    'janela_basculante': {w: 0.6, h: 0.1, isPorta: true}
};

// --- FUNÇÕES DE INTERFACE ---
function ajustarZoom(delta) {
    zoom = Math.min(Math.max(0.2, zoom + delta), 2);
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${zoom})`;
}

function voltarParaPlanta() {
    modoVistaLateral = false;
    desenhar();
}

function enviarDadosParaPapel() {
    dadosNoPapel.cliente = document.getElementById('cli_nome').value;
    dadosNoPapel.tecnico = document.getElementById('resp_tec').value;
    dadosNoPapel.largura = parseFloat(document.getElementById('terr_larg').value) || 0;
    dadosNoPapel.comprimento = parseFloat(document.getElementById('terr_comp').value) || 0;
    dadosNoPapel.area = (dadosNoPapel.largura * dadosNoPapel.comprimento).toFixed(2);
    dadosNoPapel.ativo = true;
    desenhar();
}

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    const andar = document.getElementById('sel_andar').value;
    const config = tamanhosBase[tipo];

    if (config) {
        itens.push({
            id: Date.now(),
            tipo: tipo,
            x: 100, y: 100,
            w: config.w, h: config.h,
            rot: 0, cor: cor, andar: andar,
            ...config
        });
        atualizarListaEstoque();
        desenhar();
    }
}

function atualizarListaEstoque() {
    const lista = document.getElementById('lista-estoque');
    lista.innerHTML = "";
    itens.forEach((o) => {
        const div = document.createElement('div');
        div.className = "item-estoque";
        div.innerHTML = `📍 ${o.tipo} (Andar ${o.andar})`;
        div.onclick = () => { selecionado = o; desenhar(); };
        lista.appendChild(div);
    });
}

// --- FUNÇÕES DE DESENHO TÉCNICO ---

function desenharSeloEQuadro(andar) {
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(20, 20, 1160, 760); // Moldura externa

    // Selo (Canto inferior direito)
    const seloX = 850, seloY = 600, seloW = 330, seloH = 180;
    ctx.fillStyle = "#fff"; ctx.fillRect(seloX, seloY, seloW, seloH);
    ctx.strokeRect(seloX, seloY, seloW, seloH);

    ctx.fillStyle = "#000"; ctx.font = "bold 14px Arial";
    ctx.fillText("PROJETO DE EDIFICAÇÃO", seloX + 10, seloY + 30);
    ctx.font = "12px Arial";
    ctx.fillText(`CLIENTE: ${dadosNoPapel.cliente || "---"}`, seloX + 10, seloY + 60);
    ctx.fillText(`RESP. TÉCNICO: ${dadosNoPapel.tecnico || "---"}`, seloX + 10, seloY + 85);
    ctx.fillText(`ÁREA TOTAL: ${dadosNoPapel.area || "0"} m²`, seloX + 10, seloY + 110);
    ctx.fillText(`PAVIMENTO: ${andar}º ANDAR`, seloX + 10, seloY + 135);
}

function desenharEscadaPlanta(ctx, w, h, tipo) {
    ctx.strokeStyle = "#000";
    if (tipo === 'reta') {
        const degraus = 10;
        for (let i = 0; i <= degraus; i++) {
            let y = -h/2 + (i * (h/degraus));
            ctx.beginPath(); ctx.moveTo(-w/2, y); ctx.lineTo(w/2, y); ctx.stroke();
        }
    } else {
        ctx.strokeRect(-w/2, -h/2, w, h);
        ctx.beginPath(); ctx.moveTo(0, -h/2); ctx.lineTo(0, h/2); ctx.stroke();
    }
}

function desenhar() {
    if (modoVistaLateral) { desenharVistaLateral(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const andarAtual = document.getElementById('sel_andar_view').value;
    desenharSeloEQuadro(andarAtual);

    if (dadosNoPapel.ativo) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 1; ctx.setLineDash([10, 5]);
        ctx.strokeRect(60, 60, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        ctx.setLineDash([]);
    }

    itens.forEach(o => {
        if (o.andar.toString() !== andarAtual.toString()) return;
        const w = o.w * escalaPx, h = o.h * escalaPx;
        ctx.save();
        ctx.translate(o.x + w/2, o.y + h/2);
        ctx.rotate(o.rot * Math.PI / 180);

        if (o.isPorta) {
            ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(-w/2, h/2, w, 1.5 * Math.PI, 2 * Math.PI);
            ctx.lineTo(-w/2, h/2); ctx.stroke();
        } else if (o.isMobilia) {
            if (!imagensCache[o.tipo]) {
                imagensCache[o.tipo] = new Image();
                imagensCache[o.tipo].src = `img/${o.tipo}.png`;
                imagensCache[o.tipo].onload = () => desenhar();
            }
            if (imagensCache[o.tipo].complete) ctx.drawImage(imagensCache[o.tipo], -w/2, -h/2, w, h);
            else ctx.strokeRect(-w/2, -h/2, w, h);
        } else if (o.isEscada) {
            desenharEscadaPlanta(ctx, w, h, o.tipoEscada);
        } else {
            ctx.fillStyle = o.cor; ctx.fillRect(-w/2, -h/2, w, h);
            ctx.strokeStyle = "#000"; ctx.strokeRect(-w/2, -h/2, w, h);
        }

        if (o === selecionado) {
            ctx.strokeStyle = "red"; ctx.setLineDash([5,3]);
            ctx.strokeRect(-w/2-5, -h/2-5, w+10, h+10);
        }
        ctx.restore();
    });
}

function desenharVistaLateral() {
    modoVistaLateral = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let yChao = 600;
    const peDireito = 2.8 * escalaPx;

    ctx.strokeStyle = "#333"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(50, yChao); ctx.lineTo(1100, yChao); ctx.stroke();

    itens.filter(i => !i.isMobilia).forEach((o) => {
        const hAndar = (o.andar === "1") ? peDireito : peDireito * 2;
        const baseCalculo = yChao - hAndar;

        if (o.isTelhado) {
            ctx.fillStyle = "#8b4513"; ctx.beginPath();
            ctx.moveTo(o.x, baseCalculo);
            ctx.lineTo(o.x + (o.w * escalaPx)/2, baseCalculo - (1.5 * escalaPx));
            ctx.lineTo(o.x + (o.w * escalaPx), baseCalculo);
            ctx.fill(); ctx.stroke();
        } else {
            ctx.fillStyle = o.cor; ctx.globalAlpha = 0.7;
            const alt = o.isPorta ? peDireito * 0.7 : peDireito;
            ctx.fillRect(o.x, yChao - hAndar, o.w * escalaPx, alt);
            ctx.strokeRect(o.x, yChao - hAndar, o.w * escalaPx, alt);
        }
    });
    ctx.globalAlpha = 1.0;
}

// --- EVENTOS ---
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom, my = (e.clientY - r.top) / zoom;
    selecionado = null;
    for (let i = itens.length - 1; i >= 0; i--) {
        const o = itens[i];
        if (mx >= o.x && mx <= o.x + o.w * escalaPx && my >= o.y && my <= o.y + o.h * escalaPx) {
            selecionado = o; arrastando = true;
            mouseOffset.x = mx - o.x; mouseOffset.y = my - o.y;
            break;
        }
    }
    desenhar();
});

window.addEventListener('mousemove', (e) => {
    if (arrastando && selecionado) {
        const r = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - r.left) / zoom) - mouseOffset.x;
        selecionado.y = ((e.clientY - r.top) / zoom) - mouseOffset.y;
        desenhar();
    }
});

window.addEventListener('mouseup', () => arrastando = false);

window.addEventListener('keydown', (e) => {
    if (!selecionado) return;
    if (e.key === 'ArrowUp') selecionado.h += 0.1;
    if (e.key === 'ArrowDown') selecionado.h -= 0.1;
    if (e.key === 'ArrowRight') selecionado.w += 0.1;
    if (e.key === 'ArrowLeft') selecionado.w -= 0.1;
    if (e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if (e.key === 'Delete') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    desenhar();
});

function limparTudo() { if(confirm("Limpar?")) { itens = []; desenhar(); } }

ajustarZoom(0);
desenhar();
ajustarZoom(0);
desenhar();
