const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 
canvas.width = 1122; canvas.height = 1587; 

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.5;

const tamanhosBase = {
    'suite_master': {w: 6, h: 5}, 'suite_comum': {w: 4, h: 4.5}, 'kitnet': {w: 5, h: 6},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'lavanderia': {w: 2, h: 3}, 'corredor': {w: 1.2, h: 6},
    'garagem': {w: 3.5, h: 6}, 'piscina': {w: 6, h: 3}, 'mesa_4': {w: 1.2, h: 1.2}, 
    'mesa_8': {w: 2.4, h: 1.1}, 'sofa_2': {w: 1.6, h: 0.9}, 'porta_dupla': {w: 1.6, h: 0.15}, 
    'janela_dupla': {w: 2.5, h: 0.15}, 'janela_basculante': {w: 0.6, h: 0.15}
};

// CORREÇÃO: blur() remove o foco do botão para não interferir no teclado
function ajustarZoom(delta, btn) {
    zoom = Math.min(Math.max(0.1, zoom + delta), 1.5);
    canvas.style.transform = `scale(${zoom})`;
    if (btn) btn.blur(); 
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

function desenharItem(o) {
    const andarVisivel = document.getElementById('sel_andar_view').value;
    if (o.andar !== andarVisivel) return;

    const w = o.w * escalaPx, h = o.h * escalaPx;
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);

    ctx.fillStyle = o.cor;
    if(o.tipo.includes('mesa') || o.tipo.includes('sofa')) ctx.fillStyle = "#fff";
    
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);

    if(o.tipo === 'suite_master') {
        ctx.strokeStyle = "#333"; ctx.setLineDash([4, 4]);
        ctx.strokeRect(-w/2 + 5, -h/2 + 5, w/3, h/2.5); 
        ctx.setLineDash([]); ctx.strokeRect(w/2 - w/3, -h/2, w/3, h/3); 
    }

    ctx.fillStyle = "#000"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
    ctx.fillText(`${o.tipo.toUpperCase()} (${o.w.toFixed(1)}x${o.h.toFixed(1)}m)`, 0, 5);

    if(o === selecionado) {
        ctx.strokeStyle = "red"; ctx.lineWidth = 3; ctx.setLineDash([5, 3]);
        ctx.strokeRect(-w/2 - 5, -h/2 - 5, w + 10, h + 10);
    }
    ctx.restore();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#eee"; ctx.lineWidth = 0.5; ctx.setLineDash([]);
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    itens.forEach(desenharItem);
    
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.lineWidth = 2;
    ctx.strokeRect(sX, sY, 400, 200);
    
    ctx.fillStyle = "#333"; ctx.font = "12px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText("CLIENTE: " + (document.getElementById('cli_nome').value || "---"), sX + 20, sY + 40);
    ctx.fillText("RESP. TÉCNICO: " + (document.getElementById('resp_tec').value || "---"), sX + 20, sY + 75);
    
    let andarAtual = document.getElementById('sel_andar_view').value;
    let areaTotal = itens.filter(i => i.andar === andarAtual).reduce((sum, i) => sum + (i.w * i.h), 0).toFixed(2);
    ctx.fillText("ÁREA PAVIMENTO: " + areaTotal + " m²", sX + 20, sY + 110);
    ctx.fillText("ÁREA TERRENO: " + (document.getElementById('area_terreno').value || "0") + " m²", sX + 20, sY + 145);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 180);
}

canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom;
    const my = (e.clientY - r.top) / zoom;
    const andarAtual = document.getElementById('sel_andar_view').value;
    
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(o.andar !== andarAtual) continue;
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
    
    const step = 0.1;
    if(e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if(e.key === 'Delete' || e.key === 'Backspace') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    
    // CORREÇÃO: Lógica invertida conforme pedido (Cima aumenta, Baixo diminui)
    if(e.key === 'ArrowUp') selecionado.h += step;
    if(e.key === 'ArrowDown') selecionado.h = Math.max(0.1, selecionado.h - step);
    if(e.key === 'ArrowRight') selecionado.w += step;
    if(e.key === 'ArrowLeft') selecionado.w = Math.max(0.1, selecionado.w - step);

    desenhar();
});

function limparTudo() { if(confirm("Reiniciar projeto?")) { itens = []; estoque = []; atualizarEstoqueUI(); desenhar(); } }
desenhar();
