const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; // 1 metro = 35 pixels
canvas.width = 1122; // Largura A4 em pixels
canvas.height = 1587; // Altura A4 em pixels

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let offset = { x: 0, y: 0 };
let zoom = 0.5;

canvas.style.transform = `scale(${zoom})`;

function ajustarZoom(delta) {
    zoom = Math.min(Math.max(0.2, zoom + delta), 2.0);
    canvas.style.transform = `scale(${zoom})`;
}

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    
    const tamanhos = {
        'piscina': {w: 6.0, h: 3.0},
        'quarto': {w: 4.0, h: 4.0},
        'sala': {w: 5.0, h: 4.5},
        'cozinha': {w: 3.0, h: 4.0},
        'banheiro': {w: 1.5, h: 2.5},
        'suite_master': {w: 6.0, h: 5.0},
        'garagem': {w: 3.5, h: 6.0},
        'cama_casal': {w: 1.6, h: 2.0},
        'cama_solteiro': {w: 0.9, h: 2.0},
        'mesa_6': {w: 1.8, h: 1.0},
        'sofa_3': {w: 2.2, h: 0.9},
        'porta': {w: 0.8, h: 0.15},
        'janela': {w: 1.5, h: 0.15}
    };

    const dim = tamanhos[tipo] || {w: 3, h: 3};
    estoque.push({ 
        id: Date.now(), 
        tipo, 
        w: dim.w, 
        h: dim.h, 
        cor 
    });
    atualizarEstoqueUI();
}

function atualizarEstoqueUI() {
    const container = document.getElementById('lista-estoque');
    container.innerHTML = '';
    estoque.forEach(i => {
        const div = document.createElement('div');
        div.className = 'item-pronto';
        div.style.borderLeft = `4px solid ${i.cor}`;
        div.innerHTML = `<strong>${i.tipo.toUpperCase()}</strong><br>${i.w}m x ${i.h}m`;
        div.onclick = () => { 
            itens.push({
                ...i, 
                x: 150, 
                y: 150, 
                rot: 0, 
                id: Date.now() 
            }); 
            desenhar(); 
        };
        container.appendChild(div);
    });
}

function desenharItem(o) {
    const w = o.w * escalaPx;
    const h = o.h * escalaPx;
    
    ctx.save();
    ctx.translate(o.x + w/2, o.y + h/2);
    ctx.rotate(o.rot * Math.PI / 180);

    // Estilo especial para a Piscina
    if (o.tipo === 'piscina') {
        ctx.fillStyle = '#4db8ff';
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = "#005c99";
        ctx.lineWidth = 4;
        ctx.strokeRect(-w/2, -h/2, w, h);
    } 
    // Estilo para Móveis
    else if (['cama_casal','cama_solteiro','mesa_6','sofa_3'].includes(o.tipo)) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.strokeRect(-w/2, -h/2, w, h);
    }
    // Estilo padrão para Cômodos
    else {
        ctx.fillStyle = o.cor;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(-w/2, -h/2, w, h);
    }

    // Identificação do item
    ctx.fillStyle = "#000";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(o.tipo.toUpperCase(), 0, 5);
    
    // Borda vermelha se estiver selecionado
    if(o === selecionado) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-w/2 - 5, -h/2 - 5, w + 10, h + 10);
        ctx.setLineDash([]);
    }
    ctx.restore();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha a grade milimetrada de fundo
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 0.5;
    for(let i=0; i<canvas.width; i+=escalaPx) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let j=0; j<canvas.height; j+=escalaPx) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    itens.forEach(desenharItem);
    
    // SELO TÉCNICO (Rodapé)
    const sX = canvas.width - 450, sY = canvas.height - 250;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(sX, sY, 400, 200);
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("MAINFOWEB - ENGENHARIA", sX + 20, sY + 45);
    ctx.font = "14px Arial";
    ctx.fillText("CLIENTE: " + (document.getElementById('cli_nome').value || "---"), sX + 20, sY + 90);
    ctx.fillText("TÉCNICO: " + (document.getElementById('resp_tec').value || "---"), sX + 20, sY + 125);
    ctx.fillText("DATA: " + new Date().toLocaleDateString(), sX + 20, sY + 160);
}

// LÓGICA DE INTERAÇÃO (Mouse e Teclado)
canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    
    selecionado = null;
    for(let i = itens.length - 1; i >= 0; i--) {
        let o = itens[i];
        let w = o.w * escalaPx, h = o.h * escalaPx;
        if(mx >= o.x && mx <= o.x + w && my >= o.y && my <= o.y + h) {
            selecionado = o;
            arrastando = true;
            offset.x = mx - o.x;
            offset.y = my - o.y;
            break;
        }
    }
    desenhar();
};

window.onmousemove = (e) => {
    if(arrastando && selecionado) {
        const rect = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - rect.left) / zoom) - offset.x;
        selecionado.y = ((e.clientY - rect.top) / zoom) - offset.y;
        desenhar();
    }
};

window.onmouseup = () => { arrastando = false; };

window.onkeydown = (e) => {
    if(!selecionado) return;
    // R para Girar
    if(e.key.toLowerCase() === 'r') {
        selecionado.rot = (selecionado.rot + 90) % 360;
    }
    // Delete para remover
    if(e.key === 'Delete' || e.key === 'Backspace') {
        itens = itens.filter(i => i !== selecionado);
        selecionado = null;
    }
    desenhar();
};

function limparTudo() {
    if(confirm("Deseja apagar toda a planta da MAINFOWEB?")) {
        itens = [];
        desenhar();
    }
}

// Inicialização
desenhar();
