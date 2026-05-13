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

// Estado dos dados técnicos e do terreno
let dadosNoPapel = {
    cliente: "",
    tecnico: "",
    largura: 0,
    comprimento: 0,
    area: 0,
    ativo: false
};

const tamanhosBase = {
    'suite_master': {w: 6, h: 5}, 'suite_comum': {w: 4, h: 4.5}, 'kitnet': {w: 5, h: 6},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'lavanderia': {w: 2, h: 3}, 'corredor': {w: 1.2, h: 6},
    'garagem': {w: 3.5, h: 6}, 'piscina': {w: 6, h: 3}, 'mesa_4': {w: 1.2, h: 1.2}, 
    'mesa_8': {w: 2.4, h: 1.1}, 'sofa_2': {w: 1.6, h: 0.9}, 'porta_dupla': {w: 1.6, h: 0.15}, 
    'janela_dupla': {w: 2.5, h: 0.15}, 'janela_basculante': {w: 0.6, h: 0.15}
};

function ajustarZoom(delta, btn) {
    zoom = Math.min(Math.max(0.1, zoom + delta), 1.5);
    canvas.style.transform = `scale(${zoom})`;
    if (btn) btn.blur(); 
}

// ESSA FUNÇÃO É O QUE FALTAVA PARA "AVISAR" O PAPEL
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
    
    desenhar(); // Força o redesenho imediato
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
    if (o.andar.toString() !== andarVisivel.toString()) return;

    const w = o.w * escalaPx, h = o.h * escalaPx;
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);
    ctx.fillStyle = o.cor;
    if(o.tipo.includes('mesa') || o.tipo.includes('sofa')) ctx.fillStyle = "#fff";
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);
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
    
    // Grade de Fundo (Papel Milimetrado)
    ctx.strokeStyle = "#f0f0f0"; ctx.lineWidth = 0.5; ctx.setLineDash([]);
    for(let i=0; i<canvas.width; i+=escalaPx) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=escalaPx) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }

    // --- AGORA APARECE O CAMPO DO TERRENO NO PAPEL ---
    if (dadosNoPapel.ativo && dadosNoPapel.largura > 0) {
        ctx.save();
        // Área interna do terreno (um fundo leve para destacar)
        ctx.fillStyle = "rgba(0, 210, 255, 0.05)";
        ctx.fillRect(50, 50, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        
        // Borda do terreno
        ctx.strokeStyle = "#ff0000"; 
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]); 
        ctx.strokeRect(50, 50, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        
        // Etiqueta do Limite
        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 12px Arial";
        ctx.fillText(`LIMITE DO TERRENO: ${dadosNoPapel.largura}m x ${dadosNoPapel.comprimento}m`, 55, 45);
        ctx.restore();
    }

    itens.forEach(desenharItem);
    
    // SELO DE INFORMAÇÕES
    const sX = canvas.width - 440, sY = canvas.height - 240;
    ctx.fillStyle = "#fff"; ctx.fillRect(sX, sY, 400, 200);
    ctx.strokeStyle = "#00d2ff"; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(sX, sY, 400, 200);
    
    ctx.fillStyle = "#333"; ctx.font = "12px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText("CLIENTE: " + (dadosNoPapel.cliente || "---"), sX + 20, sY + 40);
    ctx.fillText("RESP. TÉCNICO: " + (dadosNoPapel.tecnico || "---"), sX + 20, sY + 75);
    
    let andarAtual = document.getElementById('sel_andar_view').value;
    let areaTotal = itens.filter(i => i.andar.toString() === andarAtual.toString()).reduce((sum, i) => sum + (i.w * i.h), 0).toFixed(2);
    ctx.fillText("ÁREA PAVIMENTO: " + areaTotal + " m²", sX + 20, sY + 110);
    ctx.fillText(`TERRENO: ${dadosNoPapel.largura}m x ${dadosNoPapel.comprimento}m (${dadosNoPapel.area} m²)`, sX + 20, sY + 145);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 180);
}

// Eventos de Mouse (Cálculo de Zoom Corrigido)
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const ex = r.width / canvas.width, ey = r.height / canvas.height;
    const mx = (e.clientX - r.left) / ex, my = (e.clientY - r.top) / ey;
    const andar = document.getElementById('sel_andar_view').value.toString();
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        if(o.andar.toString() === andar) {
            const wP = o.w * escalaPx, hP = o.h * escalaPx;
            if(mx >= o.x && mx <= o.x + wP && my >= o.y && my <= o.y + hP) {
                selecionado = o; arrastando = true;
                mouseOffset.x = mx - o.x; mouseOffset.y = my - o.y;
                break; 
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
    const step = 0.1;
    if(e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if(e.key === 'Delete' || e.key === 'Backspace') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    if(e.key === 'ArrowUp') selecionado.h += step;
    if(e.key === 'ArrowDown') selecionado.h = Math.max(0.1, selecionado.h - step);
    if(e.key === 'ArrowRight') selecionado.w += step;
    if(e.key === 'ArrowLeft') selecionado.w = Math.max(0.1, selecionado.w - step);
    desenhar();
});

function limparTudo() { if(confirm("Reiniciar projeto?")) { itens = []; estoque = []; dadosNoPapel.ativo = false; atualizarEstoqueUI(); desenhar(); } }
desenhar();
