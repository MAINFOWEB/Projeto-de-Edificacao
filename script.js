const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; // 1 metro = 35 pixels

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.5;

// Estado dos dados técnicos (Selo e Terreno)
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

// --- FUNÇÕES DE INTERFACE ---

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
    
    desenhar();
}

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    const andar = document.getElementById('sel_andar').value;
    const dim = tamanhosBase[tipo];
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
            itens.push(n); selecionado = n; desenhar(); 
        };
        container.appendChild(div);
    });
}

// --- FUNÇÕES DE DESENHO (O CORAÇÃO DO SISTEMA) ---

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Grade de Fundo
    ctx.strokeStyle = "#f0f0f0"; ctx.setLineDash([]);
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    // 2. Delimitação do Terreno (Campo no Papel)
    if (dadosNoPapel.ativo && dadosNoPapel.largura > 0) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
        ctx.strokeRect(50, 50, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        ctx.fillStyle = "#ff0000"; ctx.font = "bold 12px Arial";
        ctx.fillText(`LIMITE DO TERRENO: ${dadosNoPapel.largura}m x ${dadosNoPapel.comprimento}m`, 55, 45);
    }

    // 3. Desenhar Cômodos (Filtro por Andar Visível)
    const andarAtual = document.getElementById('sel_andar_view').value;
    itens.forEach(o => {
        if (o.andar.toString() !== andarAtual.toString()) return;
        const w = o.w * escalaPx, h = o.h * escalaPx;
        ctx.save();
        ctx.translate(o.x + w/2, o.y + h/2);
        ctx.rotate(o.rot * Math.PI / 180);
        ctx.fillStyle = o.cor;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.strokeRect(-w/2, -h/2, w, h);
        if(o === selecionado) { ctx.strokeStyle = "red"; ctx.setLineDash([5,3]); ctx.strokeRect(-w/2-5, -h/2-5, w+10, h+10); }
        ctx.restore();
    });

    // 4. QUADRO DE ÁREAS (Igual à imagem DBCBDC)
    const qX = canvas.width - 440, qY = 50;
    ctx.fillStyle = "#fff"; ctx.fillRect(qX, qY, 400, 300);
    ctx.strokeStyle = "#333"; ctx.setLineDash([]); ctx.strokeRect(qX, qY, 400, 300);
    ctx.fillStyle = "#000"; ctx.font = "bold 14px Arial";
    ctx.fillText("QUADRO DE ÁREAS - PAVIMENTO " + andarAtual, qX + 20, qY + 30);
    
    let totalPavimento = 0;
    let offsetItem = 60;
    itens.filter(i => i.andar.toString() === andarAtual).forEach(item => {
        let area = item.w * item.h;
        totalPavimento += area;
        ctx.font = "12px Arial";
        ctx.fillText(`${item.tipo.toUpperCase()}:`, qX + 20, qY + offsetItem);
        ctx.fillText(`${area.toFixed(2)} m²`, qX + 300, qY + offsetItem);
        offsetItem += 20;
    });
    ctx.font = "bold 12px Arial";
    ctx.fillText("TOTAL CONSTRUÍDO: " + totalPavimento.toFixed(2) + " m²", qX + 20, qY + 280);

    // 5. SELO TÉCNICO (Final do Papel)
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.strokeRect(sX, sY, 400, 200);
    ctx.fillStyle = "#333"; ctx.font = "13px Arial";
    ctx.fillText("CLIENTE: " + dadosNoPapel.cliente, sX + 20, sY + 40);
    ctx.fillText("RESP. TÉCNICO: " + dadosNoPapel.tecnico, sX + 20, sY + 80);
    ctx.fillText(`TERRENO: ${dadosNoPapel.largura}x${dadosNoPapel.comprimento}m (${dadosNoPapel.area}m²)`, sX + 20, sY + 120);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 160);
}

// --- EVENTOS E CONTROLES ---

canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const ex = r.width / canvas.width, ey = r.height / canvas.height;
    const mx = (e.clientX - r.left) / ex, my = (e.clientY - r.top) / ey;
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(o.andar.toString() === document.getElementById('sel_andar_view').value) {
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
        const ex = r.width / canvas.width, ey = r.height / canvas.height;
        selecionado.x = ((e.clientX - r.left) / ex) - mouseOffset.x;
        selecionado.y = ((e.clientY - r.top) / ey) - mouseOffset.y;
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

desenhar();
