const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; // 1 metro = 35 pixels

// Tamanho fixo do papel (pode ajustar se o seu CSS for diferente)
canvas.width = 1200;
canvas.height = 800;

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.5; // Ajuste inicial conforme image_daeaa1.png
let modoVistaLateral = false;

let dadosNoPapel = {
    cliente: "",
    tecnico: "",
    largura: 0,
    comprimento: 0,
    area: 0,
    ativo: false
};

const tamanhosBase = {
    'suite_master': {w: 6, h: 5}, 'suite_comum': {w: 4, h: 4.5},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'porta_simples': {w: 0.8, h: 0.15},
    'janela_quarto': {w: 1.5, h: 0.15}, 'piscina': {w: 6, h: 3}
};

// --- CONTROLE DE INTERFACE ---

function ajustarZoom(delta, btn) {
    zoom = Math.min(Math.max(0.2, zoom + delta), 2);
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${zoom})`;
    if (btn) btn.blur(); 
}

function enviarDadosParaPapel() {
    const nome = document.getElementById('cli_nome').value;
    const tec = document.getElementById('resp_tec').value;
    const l = parseFloat(document.getElementById('terr_larg').value) || 0;
    const c = parseFloat(document.getElementById('terr_comp').value) || 0;

    dadosNoPapel.cliente = nome ? nome.toUpperCase() : "---";
    dadosNoPapel.tecnico = tec ? tec.toUpperCase() : "---";
    dadosNoPapel.largura = l;
    dadosNoPapel.comprimento = c;
    dadosNoPapel.area = (l * c).toFixed(2);
    dadosNoPapel.ativo = true;
    
    voltarParaPlanta(); // Garante que saia da vista lateral ao atualizar
}

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    const andar = document.getElementById('sel_andar').value;
    const dim = tamanhosBase[tipo] || {w: 3, h: 3};
    estoque.push({ id: Date.now(), tipo, w: dim.w, h: dim.h, cor, andar });
    atualizarEstoqueUI();
}

function atualizarEstoqueUI() {
    const container = document.getElementById('lista-estoque');
    container.innerHTML = '';
    estoque.forEach(i => {
        const div = document.createElement('div');
        div.className = 'item-pronto';
        div.style.borderLeft = `5px solid ${i.cor}`;
        div.innerHTML = `<b>${i.tipo.toUpperCase()}</b> (Andar ${i.andar})`;
        div.onclick = () => { 
            const n = {...i, x: 100, y: 100, rot: 0, id: Date.now()};
            itens.push(n); selecionado = n; 
            if(modoVistaLateral) voltarParaPlanta();
            desenhar(); 
        };
        container.appendChild(div);
    });
}

// --- FUNÇÕES DE DESENHO ---

function voltarParaPlanta() {
    modoVistaLateral = false;
    desenhar();
}

function desenharVistaLateral() {
    modoVistaLateral = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let xBase = 150;
    let yChao = 600; 
    const peDireito = 2.8 * escalaPx;

    // Linha do solo
    ctx.strokeStyle = "#333"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(50, yChao); ctx.lineTo(1000, yChao); ctx.stroke();

    ["1", "2"].forEach(andar => {
        const hAcumulada = (andar === "1") ? peDireito : peDireito * 2;
        itens.filter(i => i.andar === andar).forEach((o, idx) => {
            ctx.fillStyle = o.cor;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(xBase + (idx * 30), yChao - hAcumulada, o.w * escalaPx, peDireito);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
            ctx.strokeRect(xBase + (idx * 30), yChao - hAcumulada, o.w * escalaPx, peDireito);
        });
    });
    
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#000"; ctx.font = "bold 20px Arial";
    ctx.fillText("VISTA LATERAL / CORTE TÉCNICO", 50, 50);
}

function desenhar() {
    if (modoVistaLateral) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Grade
    ctx.strokeStyle = "#f0f0f0"; ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    // 2. Terreno
    if (dadosNoPapel.ativo && dadosNoPapel.largura > 0) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
        ctx.strokeRect(50, 50, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        ctx.setLineDash([]);
    }

    // 3. Cômodos
    const andarAtual = document.getElementById('sel_andar_view').value;
    itens.forEach(o => {
        if (o.andar.toString() !== andarAtual.toString()) return;
        const w = o.w * escalaPx, h = o.h * escalaPx;
        ctx.save();
        ctx.translate(o.x + w/2, o.y + h/2);
        ctx.rotate(o.rot * Math.PI / 180);
        ctx.fillStyle = o.cor;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
        ctx.strokeRect(-w/2, -h/2, w, h);
        if(o === selecionado) { 
            ctx.strokeStyle = "red"; ctx.setLineDash([5,3]); 
            ctx.strokeRect(-w/2-5, -h/2-5, w+10, h+10); 
            ctx.setLineDash([]);
        }
        ctx.restore();
    });

    // 4. QUADRO DE ÁREAS (Posição fixa à direita)
    const qX = canvas.width - 440, qY = 50;
    ctx.fillStyle = "#fff"; ctx.fillRect(qX, qY, 400, 300);
    ctx.strokeStyle = "#333"; ctx.strokeRect(qX, qY, 400, 300);
    ctx.fillStyle = "#000"; ctx.font = "bold 14px Arial";
    ctx.fillText("QUADRO DE ÁREAS - PAVIMENTO " + andarAtual, qX + 20, qY + 30);
    
    let totalPav = 0;
    itens.filter(i => i.andar === andarAtual).forEach((item, idx) => {
        let area = item.w * item.h;
        totalPav += area;
        ctx.font = "12px Arial";
        ctx.fillText(`${item.tipo.toUpperCase()}: ${area.toFixed(2)} m²`, qX + 20, qY + 60 + (idx * 20));
    });
    ctx.fillText("TOTAL: " + totalPav.toFixed(2) + " m²", qX + 20, qY + 280);

    // 5. SELO TÉCNICO
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.strokeRect(sX, sY, 400, 200);
    ctx.fillStyle = "#333"; ctx.font = "12px Arial";
    ctx.fillText("CLIENTE: " + dadosNoPapel.cliente, sX + 20, sY + 40);
    ctx.fillText("RESP. TÉCNICO: " + dadosNoPapel.tecnico, sX + 20, sY + 80);
    ctx.fillText(`TERRENO: ${dadosNoPapel.largura}x${dadosNoPapel.comprimento}m`, sX + 20, sY + 120);
}

// --- EVENTOS ---

canvas.addEventListener('mousedown', (e) => {
    if(modoVistaLateral) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom;
    const my = (e.clientY - r.top) / zoom;
    
    selecionado = null;
    const andarAtual = document.getElementById('sel_andar_view').value;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(o.andar.toString() === andarAtual) {
            const wP = o.w * escalaPx, hP = o.h * escalaPx;
            if(mx >= o.x && mx <= o.x + wP && my >= o.y && my <= o.y + hP) {
                selecionado = o; arrastando = true;
                mouseOffset.x = mx - o.x; mouseOffset.y = my - o.y; break; 
            }
        }
    }
    desenhar();
});

window.addEventListener('mousemove', (e) => {
    if(arrastando && selecionado) {
        const r = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - r.left) / zoom) - mouseOffset.x;
        selecionado.y = ((e.clientY - r.top) / zoom) - mouseOffset.y;
        desenhar();
    }
});

window.addEventListener('mouseup', () => arrastando = false);

window.addEventListener('keydown', (e) => {
    if(!selecionado) return;
    if(e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if(e.key === 'Delete') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    desenhar();
});

// Inicialização com zoom de 0.5 para caber na tela como na imagem
ajustarZoom(0, null);
desenhar();

