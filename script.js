const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; // 1 metro = 35px
canvas.width = 1122; canvas.height = 1587; // A4

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let offset = { x: 0, y: 0 };
let zoom = 0.5;

const tamanhos = {
    'piscina': {w: 6, h: 3}, 'kitnet': {w: 5, h: 6}, 'lavanderia': {w: 2, h: 3},
    'corredor': {w: 1.2, h: 6}, 'escada_reta': {w: 1, h: 3.5}, 'escada_l': {w: 2.5, h: 2.5},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'suite_master': {w: 6, h: 5}, 'garagem': {w: 3.5, h: 6},
    'cama_casal': {w: 1.6, h: 2.0}, 'cama_solteiro': {w: 0.9, h: 2.0},
    'mesa_6': {w: 1.8, h: 1.0}, 'sofa_3': {w: 2.2, h: 0.9},
    'porta': {w: 0.8, h: 0.1}, 'janela': {w: 1.5, h: 0.1}
};

function atualizaPreviewCor() {
    document.getElementById('preview-cor').style.backgroundColor = document.getElementById('cor_escolhida').value;
}

function ajustarZoom(delta) {
    zoom = Math.min(Math.max(0.1, zoom + delta), 2.0);
    canvas.style.transform = `scale(${zoom})`;
}

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    const andar = document.getElementById('sel_andar').value;
    const dim = tamanhos[tipo];
    
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
        div.innerHTML = `<b>${i.tipo.toUpperCase()}</b><br>Andar: ${i.andar} | ${i.w}x${i.h}m`;
        div.onclick = () => { itens.push({...i, x: 100, y: 100, rot: 0}); desenhar(); };
        container.appendChild(div);
    });
}

function desenharItem(o) {
    const w = o.w * escalaPx, h = o.h * escalaPx;
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);

    // Renderização por tipo
    ctx.fillStyle = o.cor;
    if(o.tipo.includes('cama') || o.tipo.includes('mesa') || o.tipo.includes('sofa')) ctx.fillStyle = "#fff";
    if(o.tipo === 'piscina') ctx.fillStyle = "#4db8ff";
    
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);

    // Detalhes de Escada
    if(o.tipo.includes('escada')) {
        ctx.beginPath();
        for(let i=1; i<5; i++) { ctx.moveTo(-w/2 + (w/5)*i, -h/2); ctx.lineTo(-w/2 + (w/5)*i, h/2); }
        ctx.stroke();
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${o.tipo.toUpperCase()} (${o.andar}º)`, 0, 5);

    if(o === selecionado) {
        ctx.strokeStyle = "red"; ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]); ctx.strokeRect(-w/2 - 5, -h/2 - 5, w + 10, h + 10);
    }
    ctx.restore();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grade
    ctx.strokeStyle = "#f0f0f0"; ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    itens.forEach(desenharItem);
    
    // Selo Técnico
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(sX, sY, 400, 200);
    ctx.fillStyle = "#000"; ctx.font = "bold 18px Arial";
    ctx.fillText("MAINFOWEB - ENGENHARIA", sX + 200, sY + 40);
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("CLIENTE: " + (document.getElementById('cli_nome').value || "---"), sX + 20, sY + 80);
    ctx.fillText("TÉCNICO: " + (document.getElementById('resp_tec').value || "---"), sX + 20, sY + 115);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 150);
}

// Mouse Events
canvas.onmousedown = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom;
    const my = (e.clientY - r.top) / zoom;
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(mx >= o.x && mx <= o.x + o.w*escalaPx && my >= o.y && my <= o.y + o.h*escalaPx) {
            selecionado = o; arrastando = true;
            offset.x = mx - o.x; offset.y = my - o.y; break;
        }
    }
    desenhar();
};

window.onmousemove = (e) => {
    if(arrastando && selecionado) {
        const r = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - r.left) / zoom) - offset.x;
        selecionado.y = ((e.clientY - r.top) / zoom) - offset.y;
        desenhar();
    }
};

window.onmouseup = () => arrastando = false;

window.onkeydown = (e) => {
    if(!selecionado) return;
    if(e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if(e.key === 'Delete') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    desenhar();
};

function limparTudo() { if(confirm("Deseja apagar tudo?")) { itens = []; estoque = []; atualizarEstoqueUI(); desenhar(); } }

desenhar();
