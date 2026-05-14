const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 

canvas.width = 1200;
canvas.height = 800;

let itens = [];
let estoque = [];
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.6; 
let modoVistaLateral = false;

let dadosNoPapel = { cliente: "", tecnico: "", largura: 0, comprimento: 0, area: 0, ativo: false };

// --- CONFIGURAÇÃO DE ITENS ---
const tamanhosBase = {
    'suite_master': {w: 6, h: 5, temBanheiro: true},
    'suite_comum': {w: 4, h: 4.5, temBanheiro: true},
    'kitnet': {w: 4, h: 7, temBanheiro: true},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5}, 'corredor': {w: 1.2, h: 4},
    'piscina': {w: 6, h: 3},
    // Mobília (vão carregar imagens)
    'mesa_4': {w: 1.2, h: 1.2, isMobilia: true},
    'mesa_6': {w: 1.8, h: 1, isMobilia: true},
    'mesa_8': {w: 2.4, h: 1.1, isMobilia: true},
    'sofa_2': {w: 1.6, h: 0.9, isMobilia: true},
    'sofa_3': {w: 2.1, h: 0.9, isMobilia: true},
    // Acessos
    'porta_simples': {w: 0.8, h: 0.1, isPorta: true},
    'porta_dupla': {w: 1.6, h: 0.1, isPorta: true}
};

// Cache de imagens para não sobrecarregar o processamento
const imagensCache = {};

function ajustarZoom(delta) {
    zoom = Math.min(Math.max(0.2, zoom + delta), 2);
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${zoom})`;
}

// --- DESENHO TÉCNICO ---

function desenharBanheiroInterno(ctx, w, h) {
    ctx.setLineDash([]);
    ctx.strokeStyle = "#000";
    const largB = 1.5 * escalaPx;
    const compB = 2.0 * escalaPx;
    ctx.strokeRect(w/2 - largB, h/2 - compB, largB, compB);
    ctx.font = "bold 9px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("WC", w/2 - (largB/1.3), h/2 - (compB/2.5));
}

function desenhar() {
    if (modoVistaLateral) { desenharVistaLateral(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (dadosNoPapel.ativo) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
        ctx.strokeRect(60, 60, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        ctx.setLineDash([]);
    }

    const andarAtual = document.getElementById('sel_andar_view').value;

    itens.forEach(o => {
        if (o.andar.toString() !== andarAtual.toString()) return;
        const w = o.w * escalaPx, h = o.h * escalaPx;
        ctx.save();
        ctx.translate(o.x + w/2, o.y + h/2);
        ctx.rotate(o.rot * Math.PI / 180);

        if (o.isPorta) {
            ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
            if(o.tipo === 'porta_dupla') {
                ctx.beginPath();
                ctx.arc(-w/2, h/2, w/2, 1.5 * Math.PI, 2 * Math.PI); 
                ctx.arc(w/2, h/2, w/2, Math.PI, 1.5 * Math.PI);
                ctx.stroke();
            } else {
                ctx.beginPath(); ctx.arc(-w/2, h/2, w, 1.5 * Math.PI, 2 * Math.PI);
                ctx.lineTo(-w/2, h/2); ctx.stroke();
            }
        } else if (o.isMobilia) {
            // Lógica de Imagem integrada aqui
            if (!imagensCache[o.tipo]) {
                imagensCache[o.tipo] = new Image();
                imagensCache[o.tipo].src = `img/${o.tipo}.png`; // Pasta img/
                imagensCache[o.tipo].onload = () => desenhar(); 
            }
            if (imagensCache[o.tipo].complete) {
                ctx.drawImage(imagensCache[o.tipo], -w/2, -h/2, w, h);
            } else {
                // Enquanto a imagem não carrega, mostra um box pontilhado
                ctx.setLineDash([2, 2]);
                ctx.strokeRect(-w/2, -h/2, w, h);
            }
        } else {
            ctx.fillStyle = o.cor;
            ctx.fillRect(-w/2, -h/2, w, h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(-w/2, -h/2, w, h);

            if (o.temBanheiro) desenharBanheiroInterno(ctx, w, h);
        }

        if(o === selecionado) {
            ctx.strokeStyle = "red"; ctx.setLineDash([5,3]);
            ctx.strokeRect(-w/2-5, -h/2-5, w+10, h+10);
        }
        ctx.restore();
    });
    
    // Supondo que você tenha essa função externa ou no mesmo arquivo
    if(typeof desenharSeloEQuadro === "function") desenharSeloEQuadro(andarAtual); 
}

function desenharVistaLateral() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let yChao = 600;
    const peDireito = 2.8 * escalaPx; // Altura do andar

    // Linha do Piso
    ctx.strokeStyle = "#333"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(50, yChao); ctx.lineTo(1100, yChao); ctx.stroke();

    itens.filter(i => !i.isMobilia).forEach((o) => {
        const hAndar = (o.andar === "1") ? peDireito : peDireito * 2;
        const baseCalculo = yChao - hAndar;

        if (o.isEscada) {
            // Desenha a escada de lado como um triângulo/rampa (Representação técnica de corte)
            ctx.fillStyle = "#ccc";
            ctx.beginPath();
            ctx.moveTo(o.x, yChao - (o.andar === "2" ? peDireito : 0)); // Base da escada
            ctx.lineTo(o.x + (o.w * escalaPx), yChao - hAndar); // Topo da escada
            ctx.lineTo(o.x, yChao - hAndar); // Fecha o bloco
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            // Desenho normal de paredes e portas
            ctx.fillStyle = o.cor;
            ctx.globalAlpha = 0.6;
            const alturaBloco = o.isPorta ? peDireito * 0.7 : peDireito;
            ctx.fillRect(o.x, baseCalculo, o.w * escalaPx, alturaBloco);
            ctx.strokeRect(o.x, baseCalculo, o.w * escalaPx, alturaBloco);
        }
    });
    ctx.globalAlpha = 1.0;
}

// --- EVENTOS DE TECLADO ---
window.addEventListener('keydown', (e) => {
    if(!selecionado) return;
    const passo = 0.1; 
    if(e.key === 'ArrowUp') { selecionado.h += passo; e.preventDefault(); }
    if(e.key === 'ArrowDown') { selecionado.h -= passo; e.preventDefault(); }
    if(e.key === 'ArrowRight') { selecionado.w += passo; e.preventDefault(); }
    if(e.key === 'ArrowLeft') { selecionado.w -= passo; e.preventDefault(); }
    
    if(e.key.toLowerCase() === 'r') selecionado.rot = (selecionado.rot + 90) % 360;
    if(e.key === 'Delete') { itens = itens.filter(i => i !== selecionado); selecionado = null; }
    desenhar();
});

canvas.addEventListener('mousemove', (e) => {
    if(arrastando && selecionado) {
        const r = canvas.getBoundingClientRect();
        selecionado.x = ((e.clientX - r.left) / zoom) - mouseOffset.x;
        selecionado.y = ((e.clientY - r.top) / zoom) - mouseOffset.y;
        desenhar(); 
    }
});

ajustarZoom(0);
desenhar();
