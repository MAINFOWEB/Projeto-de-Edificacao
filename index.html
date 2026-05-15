<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Projeto de Edificação</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="sidebar">
    <h3 class="titulo-topo">Projeto de <span class="azul">Edificação</span></h3>
    
    <div class="bloco-config">
        <label>🎨 COR DO CÔMODO</label>
        <div style="display: flex; align-items: center; gap: 10px;">
            <input type="color" id="cor_escolhida" value="#00d2ff" oninput="document.getElementById('cor_preview').style.backgroundColor = this.value">
            <div id="cor_preview" style="width: 30px; height: 30px; border-radius: 50%; background: #00d2ff; border: 2px solid #555;"></div>
        </div>
    </div>

    <div class="bloco-config">
        <label>📋 DADOS TÉCNICOS</label>
        <input type="text" id="cli_nome" placeholder="Nome do Cliente">
        <input type="text" id="resp_tec" placeholder="Responsável Técnico">
        <div style="display: flex; gap: 5px; margin-top: 5px;">
            <input type="number" id="terr_larg" placeholder="Larg. (m)">
            <span style="color: #eee; align-self: center;">x</span>
            <input type="number" id="terr_comp" placeholder="Comp. (m)">
        </div>
        <button onclick="enviarDadosParaPapel()" style="background-color: #00d2ff; color: #000; font-weight: bold; margin-top: 10px; width: 100%; padding: 8px; border: none; border-radius: 5px; cursor: pointer;">
            ENVIAR PARA O PAPEL
        </button>
    </div>

    <div class="section">
        <label>🏢 PAVIMENTO (CRIAR)</label>
        <select id="sel_andar">
            <option value="1">1º Andar (Térreo)</option>
            <option value="2">2º Andar (Superior)</option>
        </select>
    </div>

    <div class="section">
        <label>👁️ EXIBIR NO PAPEL</label>
        <select id="sel_andar_view" onchange="desenhar()">
            <option value="1">Ver 1º Andar</option>
            <option value="2">Ver 2º Andar</option>
        </select>
    </div>

    <div class="section">
        <button onclick="desenharVistaLateral()" style="background-color: #ff9800; color: white; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer; font-weight: bold;">
            📐 VER VISTA LATERAL (2D)
        </button>
        <button onclick="voltarParaPlanta()" style="margin-top: 5px; width: 100%; padding: 5px; cursor: pointer;">
            ⬅️ VOLTAR PARA PLANTA
        </button>
    </div>

    <div class="section">
        <label>📐 COMPONENTE</label>
        <select id="sel_tipo">
            <optgroup label="Suítes e Kitnet (Com Banheiro)">
                <option value="suite_master">Suíte Master + Closet</option>
                <option value="suite_comum">Suíte Comum</option>
                <option value="kitnet">Kitnet</option>
            </optgroup>
            <optgroup label="Cômodos Padrão">
                <option value="quarto">Quarto</option>
                <option value="sala">Sala de Estar</option>
                <option value="cozinha">Cozinha</option>
                <option value="banheiro">Banheiro Social</option>
                <option value="lavanderia">Lavanderia</option>
                <option value="corredor">Corredor</option>
                <option value="garagem">Garagem</option>
                <option value="piscina">Piscina</option>
                <option value="escada_reta">Escada Reta</option>
                <option value="escada_l">Escada em L</option>
            </optgroup>
            <optgroup label="Mobília">
                <option value="mesa_4">Mesa (4 Lugares)</option>
                <option value="mesa_6">Mesa (6 Lugares)</option>
                <option value="mesa_8">Mesa (8 Lugares)</option>
                <option value="sofa_2">Sofá (2 Lugares)</option>
                <option value="sofa_3">Sofá (3 Lugares)</option>
            </optgroup>
            <optgroup label="Acessos">
                <option value="porta_simples">Porta Simples</option>
                <option value="porta_dupla">Porta Dupla</option>
                <option value="janela_dupla">Janela Dupla</option>
                <option value="janela_basculante">Janela Basculante</option>
            </optgroup>
        </select>
        <div style="display: flex; gap: 5px; margin-top: 5px;">
            <input type="number" id="qtd_componente" value="1" min="1" style="width: 60px; padding: 5px;">
            <button class="btn-add" onclick="adicionarAoEstoque()" style="flex: 1;">MANDAR PARA ESTOQUE</button>
        </div>
    </div>

    <div class="section" style="font-size: 11px; line-height: 1.4; color: #ccc;">
        <label>📖 MANUAL DE COMANDOS</label>
        • <b>Mouse:</b> Arraste para mover<br>
        • <b>R:</b> Girar item selecionado<br>
        • <b>DEL:</b> Apagar item<br>
        • <b>SETAS:</b> Redimensionar (+/- 0.1m)
    </div>

    <div class="section" style="margin-top: 20px;">
        <button class="btn-print" onclick="window.print()" style="width: 100%; margin-bottom: 10px;">🖨️ GERAR PDF / IMPRIMIR</button>
        <button class="btn-reset" onclick="limparTudo()" style="width: 100%;">REINICIAR TUDO</button>
    </div>
</div>

<div class="zoom-controls">
    <button class="zoom-btn" onclick="ajustarZoom(0.1)">+</button>
    <button class="zoom-btn" onclick="ajustarZoom(-0.1)">-</button>
</div>

<div id="canvas-container" style="width: calc(100% - 300px); height: 100vh; overflow: auto; position: fixed; right: 0; top: 0; background: #333; display: flex; align-items: flex-start; justify-content: flex-start;">
    <div id="canvas-wrapper" style="padding: 20px;">
        <canvas id="mainCanvas" width="1200" height="800" style="background: white; box-shadow: 0 0 20px rgba(0,0,0,0.5);"></canvas>
    </div>
</div>

<div id="inventory">
    <h4>📦 ESTOQUE</h4>
    <div id="lista-estoque"></div>
</div>

<script src="script.js"></script>
</body>
</html>
