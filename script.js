const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const escalaPx = 35; 

canvas.width = 1200;
canvas.height = 800;

let itens = [];      // Itens que estão NO PAPEL
let estoque = [];    // Itens que estão NA LISTA DE ESPERA
let selecionado = null;
let arrastando = false;
let mouseOffset = { x: 0, y: 0 };
let zoom = 0.6; 
let modoVistaLateral = false;

let dadosNoPapel = { cliente: "", tecnico: "", largura: 0, comprimento: 0, area: 0, ativo: false };
const imagensCache = {};

const tamanhosBase = {
    'suite_master': {w: 6, h: 5, temBanheiro: true},
    'suite_comum': {w: 4, h: 4.5, temBanheiro: true},
    'quarto': {w: 4, h: 4}, 'sala': {w: 5, h: 5}, 'cozinha': {w: 3.5, h: 4},
    'banheiro': {w: 1.5, h: 2.5},
    'escada_reta': { w: 1, h: 3, isEscada: true, tipoEscada: 'reta' },
    'escada_l': { w: 2, h: 2, isEscada: true, tipoEscada: 'L' },
    'mesa_4': {w: 1.2, h: 1.2, isMobilia: true},
    'sofa_3': {w: 2.1, h: 0.9, isMobilia: true},
    'porta_simples': {w: 0.8, h: 0.1, isPorta: true}
};

// --- LOGICA DE ESTOQUE (COMO ERA ANTES) ---

function adicionarAoEstoque() {
    const tipo = document.getElementById('sel_tipo').value;
    const cor = document.getElementById('cor_escolhida').value;
    const andar = document.getElementById('sel_andar').value;
    const config = tamanhosBase[tipo];

    if (config) {
        // Agora ele vai para a lista 'estoque', não para 'itens'
        estoque.push({
            tipo: tipo,
            cor: cor,
            andar: andar,
            ...config
        });
        atualizarListaEstoque();
    }
}

function atualizarListaEstoque() {
    const lista = document.getElementById('lista-estoque');
    lista.innerHTML = "";
    estoque.forEach((o, index) => {
        const div = document.createElement('div');
        div.style.cssText = "padding:8px; margin:5px; background:#444; color:white; cursor:pointer; border-radius:4px; font-size:12px;";
        div.innerHTML = `📦 INSERIR: ${o.tipo.toUpperCase()} (Andar ${o.andar})`;
        
        // AO CLICAR NO ESTOQUE, ELE VAI PARA O PAPEL
        div.onclick = () => {
            const novoNoPapel = { ...o, x: 100, y: 100, rot: 0, id: Date.now() };
            itens.push(novoNoPapel);
            estoque.splice(index, 1); // Remove do estoque após inserir
            atualizarListaEstoque();
            desenhar();
        };
        lista.appendChild(div);
    });
}

// --- DESENHO E LIMITES ---

function desenharSeloEQuadro(andar) {
    ctx.setLineDash([]);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 1160, 760); // Moldura do papel

    const seloX = 850, seloY = 600, seloW = 330, seloH = 180;
    ctx.fillStyle = "#fff"; ctx.fillRect(seloX, seloY, seloW, seloH);
    ctx.strokeRect(seloX, seloY, seloW, seloH);

    ctx.fillStyle = "#000"; ctx.font = "bold 14px Arial";
    ctx.fillText("PROJETO DE EDIFICAÇÃO", seloX + 10, seloY + 30);
    ctx.font = "12px Arial";
    ctx.fillText(`CLIENTE: ${dadosNoPapel.cliente}`, seloX + 10, seloY + 60);
    ctx.fillText(`ÁREA: ${dadosNoPapel.area} m²`, seloX + 10, seloY + 110);
    ctx.fillText(`PAVIMENTO: ${andar}º ANDAR`, seloX + 10, seloY + 135);
}

function desenhar() {
    if (modoVistaLateral) return; // Não desenha planta se estiver em corte
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const andarAtual = document.getElementById('sel_andar_view').value;
    desenharSeloEQuadro(andarAtual);

    // TRACEJADO VERMELHO (LIMITE DA AREA) - Corrigido para não passar da margem
    if (dadosNoPapel.ativo) {
        ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]);
        // O limite agora começa em 60,60 para ficar centralizado e seguro
        ctx.strokeRect(60, 60, dadosNoPapel.largura * escalaPx, dadosNoPapel.comprimento * escalaPx);
        ctx.setLineDash([]);
    }

    itens.forEach(o => {
        if (o.andar.toString() !== andarAtual.toString()) return;
        const w = o.w * escalaPx, h = o.h * escalaPx;
        ctx.save();
        ctx.translate(o.x + w/2, o.y + h/2);
        ctx.rotate(o.rot * Math.PI / 180);

        if (o.isMobilia) {
            if (!imagensCache[o.tipo]) {
                imagensCache[o.tipo] = new Image();
                imagensCache[o.tipo].src = `img/${o.tipo}.png`;
                imagensCache[o.tipo].onload = () => desenhar();
            }
            if (imagensCache[o.tipo].complete) ctx.drawImage(imagensCache[o.tipo], -w/2, -h/2, w, h);
            else ctx.strokeRect(-w/2, -h/2, w, h);
        } else {
            ctx.fillStyle = o.cor; ctx.fillRect(-w/2, -h/2, w, h);
            ctx.strokeStyle = "#000"; ctx.strokeRect(-w/2, -h/2, w, h);
        }

        if (o === selecionado) { ctx.strokeStyle = "red"; ctx.setLineDash([5,3]); ctx.strokeRect(-w/2-5, -h/2-5, w+10, h+10); }
        ctx.restore();
    });
}

function desenharVistaLateral() {
    modoVistaLateral = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharSeloEQuadro("CORTE"); // Mantém o selo no corte

    let yChao = 600;
    const peDireito = 2.8 * escalaPx;
    ctx.strokeStyle = "#333"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(50, yChao); ctx.lineTo(1100, yChao); ctx.stroke();

    itens.filter(i => !i.isMobilia).forEach((o) => {
        const hAndar = (o.andar === "1") ? peDireito : peDireito * 2;
        ctx.fillStyle = o.cor; ctx.globalAlpha = 0.7;
        ctx.fillRect(o.x, yChao - hAndar, o.w * escalaPx, peDireito);
        ctx.strokeRect(o.x, yChao - hAndar, o.w * escalaPx, peDireito);
    });
    ctx.globalAlpha = 1.0;
}

function voltarParaPlanta() {
    modoVistaLateral = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa resíduos do corte
    desenhar();
}

// --- EVENTOS DE INTERAÇÃO ---

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

// Ajuste de zoom inicial para ver o papel todo
ajustarZoom(0);
desenhar();
