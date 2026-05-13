const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 
canvas.width = 1122; canvas.height = 1587; // A4 em 96 DPI

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mousePos = { x: 0, y: 0 };
let zoom = 0.5;

const tamanhos = {
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'suite_master': {w: 6, h: 5}, 'kitnet': {w: 5, h: 6},
    'lavanderia': {w: 2, h: 3}, 'corredor': {w: 1.2, h: 6}, 'garagem': {w: 3.5, h: 6},
    'piscina': {w: 6, h: 3}, 'escada_reta': {w: 1, h: 3.5}, 'escada_l': {w: 2.5, h: 2.5},
    'cama_casal': {w: 1.6, h: 2}, 'cama_solteiro': {w: 0.9, h: 2},
    'mesa_4': {w: 1.2, h: 1.2}, 'mesa_6': {w: 1.8, h: 1}, 'mesa_8': {w: 2.4, h: 1.1},
    'sofa_2': {w: 1.6, h: 0.9}, 'sofa_3': {w: 2.2, h: 0.9},
    'porta': {w: 0.8, h: 0.15}, 'porta_dupla': {w: 1.6, h: 0.15},
    'janela': {w: 1.5, h: 0.15}, 'janela_dupla': {w: 2.5, h: 0.15}, 'janela_basculante': {w: 0.6, h: 0.15}
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
        div.innerHTML = `<b>${i.tipo.replace('_',' ').toUpperCase()}</b><br>Andar: ${i.andar} | ${i.w}x${i.h}m`;
        div.onclick = () => { 
            const novoItem = {...i, x: 200, y: 200, rot: 0, id: Date.now()};
            itens.push(novoItem);
            selecionado = novoItem;
            desenhar(); 
        };
        container.appendChild(div);
    });
}

function desenharItem(o) {
    const w = o.w * escalaPx, h = o.h * escalaPx;
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);

    // Lógica de Cores
    ctx.fillStyle = o.cor;
    if(['cama_casal','cama_solteiro','mesa_4','mesa_6','mesa_8','sofa_2','sofa_3'].includes(o.tipo)) ctx.fillStyle = "#fff";
    if(o.tipo === 'piscina') ctx.fillStyle = "#4db8ff";
    if(o.tipo.includes('janela')) ctx.fillStyle = "#e0f7fa";
    if(o.tipo.includes('porta')) ctx.fillStyle = "#8d6e63";

    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);

    // Desenho de Escada
    if(o.tipo.includes('escada')) {
        ctx.beginPath();
        for(let i=1; i<7; i++) { ctx.moveTo(-w/2 + (w/7)*i, -h/2); ctx.lineTo(-w/2 + (w/7)*i, h/2); }
        ctx.stroke();
    }

    ctx.fillStyle = "#000"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText(o.tipo.toUpperCase(), 0, 4);

    if(o === selecionado) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
        ctx.strokeRect(-w/2 - 4, -h/2 - 4, w + 8, h + 8);
    }
    ctx.restore();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grade
    ctx.strokeStyle = "#e8e8e8"; ctx.lineWidth = 0.5; ctx.setLineDash([]);
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    itens.forEach(desenharItem);
    
    // SELO TÉCNICO PROFISSIONAL (Branco e Azul)
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.lineWidth = 3; ctx.strokeRect(sX, sY, 400, 200);
    
    ctx.fillStyle = "#00d2ff"; ctx.font = "bold 22px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText("MAINFOWEB - ENGENHARIA", sX + 20, sY + 50);
    
    ctx.fillStyle = "#333"; ctx.font = "14px Segoe UI";
    ctx.fillText("CLIENTE: " + (document.getElementById('cli_nome').value || "---"), sX + 20, sY + 100);
    ctx.fillText("RESP. TÉCNICO: " + (document.getElementById('resp_tec').value || "---"), sX + 20, sY + 135);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 170);
}

// Eventos de Mouse Corrigidos
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / zoom;
    const my = (e.clientY - r.top) / zoom;
    
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        let w = o.w * escalaPx, h = o.h * escalaPx;
        if(mx >= o.x && mx <= o.x + w && my >= o.y && my <= o.y + h) {
            selecionado = o;
            arrastando = true;
            mousePos = { x: mx - o.x, y: my - o.y };
            break;
        }
    }
    desenhar();
});

window.addEventListener('mousemove', (e) => {
    if(arrastando && selecionado) {
        const r = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - r.left) / zoom) - mousePos.x;
        selecionado.y = ((e.clientY - r.top) / zoom) - mousePos.y;
        desenhar();
    }
});

window.addEventListener('mouseup', () => { arrastando = false; });

window.addEventListener('keydown', (e) => {
    if(!selecionado) return;
    if(e.key.toLowerCase() === 'r') { selecionado.rot = (selecionado.rot + 90) % 360; }
    if(e.key === 'Delete' || e.key === 'Backspace') {
        itens = itens.filter(i => i !== selecionado);
        selecionado = null;
    }
    desenhar();
});

function limparTudo() { if(confirm("Deseja apagar tudo?")) { itens = []; estoque = []; atualizarEstoqueUI(); desenhar(); } }

desenhar();
