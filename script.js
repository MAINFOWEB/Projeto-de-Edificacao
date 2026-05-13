const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 
canvas.width = 1122; canvas.height = 1587; // A4

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.5;

const tamanhos = {
    'suite_master': {w: 6, h: 5}, 'suite_comum': {w: 4, h: 4.5}, 'kitnet': {w: 5, h: 6},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'lavanderia': {w: 2, h: 3}, 'corredor': {w: 1.2, h: 6},
    'garagem': {w: 3.5, h: 6}, 'piscina': {w: 6, h: 3}, 'escada_reta': {w: 1, h: 3.5}, 
    'escada_l': {w: 2.5, h: 2.5}, 'mesa_4': {w: 1.2, h: 1.2}, 'mesa_8': {w: 2.4, h: 1.1}, 
    'sofa_2': {w: 1.6, h: 0.9}, 'porta_dupla': {w: 1.6, h: 0.15}, 'janela_dupla': {w: 2.5, h: 0.15}, 
    'janela_basculante': {w: 0.6, h: 0.15}
};

function atualizaPreviewCor() {
    document.getElementById('preview-cor').style.backgroundColor = document.getElementById('cor_escolhida').value;
}

function ajustarZoom(delta) {
    zoom = Math.min(Math.max(0.1, zoom + delta), 1.5);
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
        div.innerHTML = `<b>${i.tipo.toUpperCase()}</b> (Andar ${i.andar})`;
        div.onclick = () => { 
            const n = {...i, x: 200, y: 200, rot: 0, id: Date.now()};
            itens.push(n); selecionado = n; desenhar(); 
        };
        container.appendChild(div);
    });
}

function desenharItem(o) {
    const w = o.w * escalaPx, h = o.h * escalaPx;
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);

    ctx.fillStyle = o.cor;
    if(o.tipo.includes('mesa') || o.tipo.includes('sofa')) ctx.fillStyle = "#fff";
    
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);

    // Desenho Interno (Banheiros e Closets)
    ctx.setLineDash([]);
    if(o.tipo === 'suite_master') {
        // Closet Pontilhado
        ctx.strokeStyle = "#333"; ctx.setLineDash([4, 4]);
        ctx.strokeRect(-w/2 + 5, -h/2 + 5, w/3, h/2.5);
        // Banheiro
        ctx.setLineDash([]); ctx.strokeRect(w/2 - w/3, -h/2, w/3, h/3);
    }
    if(o.tipo === 'suite_comum' || o.tipo === 'kitnet') {
        ctx.strokeRect(w/2 - w/3, -h/2, w/3, h/3); // Banheiro simples
    }

    ctx.fillStyle = "#000"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText(o.tipo.toUpperCase(), 0, 5);

    if(o === selecionado) {
        ctx.strokeStyle = "red"; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
        ctx.strokeRect(-w/2 - 5, -h/2 - 5, w + 10, h + 10);
    }
    ctx.restore();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grade milimetrada
    ctx.strokeStyle = "#eee"; ctx.lineWidth = 0.5; ctx.setLineDash([]);
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    itens.forEach(desenharItem);
    
    // SELO TÉCNICO NORMAS ABNT
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(sX, sY, 400, 200);
    
    ctx.fillStyle = "#333"; ctx.font = "12px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText("CLIENTE: " + (document.getElementById('cli_nome').value || "---"), sX + 20, sY + 30);
    ctx.fillText("RESP. TÉCNICO: " + (document.getElementById('resp_tec').value || "---"), sX + 20, sY + 60);
    
    let totalArea = itens.reduce((sum, i) => sum + (i.w * i.h), 0).toFixed(2);
    ctx.fillText("ÁREA CONSTRUÍDA: " + totalArea + " m²", sX + 20, sY + 90);
    ctx.fillText("ÁREA DO TERRENO: " + (document.getElementById('area_terreno').value || "0") + " m²", sX + 20, sY + 120);
    ctx.fillText("NORMAS: ABNT NBR 6492 / 15575", sX + 20, sY + 150);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 180);
}

// Interatividade Total e Recorrente
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom;
    const my = (e.clientY - r.top) / zoom;
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(mx >= o.x && mx <= o.x + o.w*escalaPx && my >= o.y && my <= o.y + o.h*escalaPx) {
            selecionado = o; arrastando = true;
            mouseOffset.x = mx - o.x; mouseOffset.y = my - o.y;
            break;
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
    if(e.key === 'Delete' || e.key === 'Backspace') {
        itens = itens.filter(i => i !== selecionado); selecionado = null;
    }
    desenhar();
});

function limparTudo() { if(confirm("Reiniciar projeto?")) { itens = []; estoque = []; atualizarEstoqueUI(); desenhar(); } }
desenhar();
