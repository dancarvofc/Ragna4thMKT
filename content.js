// Ragna4th Market Analyzer - Versão Melhorada
(function() {
    'use strict';

    // Só roda na página de mercado
    if (!window.location.pathname.startsWith('/market')) return;

    // Cache para dados do item
    let itemData = null;
    let currentItemId = null;

    // Utilidades
    function parsePrice(text) {
        return parseInt((text || '').replace(/[^\d]/g, '')) || 0;
    }
    
    function formatPrice(price) {
        return price.toLocaleString('pt-BR') + 'ƶ';
    }

    function formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    // Busca dados do item na página específica
    async function fetchItemData(itemId) {
        if (itemId === currentItemId && itemData) return itemData;
        
        try {
            const response = await fetch(`https://db.ragna4th.com/item/${itemId}`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const priceElements = doc.querySelectorAll('.nk-iv-wg3-amount .number');
            const prices = Array.from(priceElements).map(el => parsePrice(el.textContent));
            
            itemData = {
                menorPrecoDisponivel: prices[0] || 0,
                menorPrecoVenda: prices[1] || 0,
                maiorPrecoVenda: prices[2] || 0,
                numeroVendas: parsePrice(priceElements[3]?.textContent) || 0,
                totalVendido: parsePrice(priceElements[4]?.textContent) || 0
            };
            
            currentItemId = itemId;
            return itemData;
        } catch (error) {
            console.error('Erro ao buscar dados do item:', error);
            return null;
        }
    }

    // Extrai ID do item da URL ou da tabela
    function getCurrentItemId() {
        // Tenta extrair da URL primeiro
        const urlMatch = window.location.href.match(/[?&]item=(\d+)/);
        if (urlMatch) return urlMatch[1];
        
        // Tenta extrair da tabela
        const firstItem = document.querySelector('#market-table .market-item a[href*="/item/"]');
        if (firstItem) {
            const hrefMatch = firstItem.href.match(/\/item\/(\d+)/);
            if (hrefMatch) return hrefMatch[1];
        }
        
        return null;
    }

    // Aguarda a tabela do mercado
    function waitForMarketTable(cb) {
        const table = document.querySelector('#market-table');
        if (table && table.children.length > 0) return cb();
        const obs = new MutationObserver(() => {
            const table = document.querySelector('#market-table');
            if (table && table.children.length > 0) {
                obs.disconnect();
                cb();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Analisa a tabela do mercado
    function analyzeMarket() {
        const rows = document.querySelectorAll('#market-table .market-item');
        const priceMap = new Map(); // preço -> quantidade total
        const sellers = {}; // vendedor -> {qtd, preços}
        let totalQtd = 0;
        let totalSum = 0;
        let allPrices = [];

        rows.forEach(row => {
            const price = parsePrice(row.querySelector('.market-price')?.textContent);
            const qtd = parseInt(row.querySelector('.market-amount')?.textContent.replace(/[^\d]/g, '')) || 1;
            const seller = row.querySelector('.market-seller')?.textContent.trim() || 'Desconhecido';
            if (!price) return;
            
            // Agrupa resistências
            priceMap.set(price, (priceMap.get(price) || 0) + qtd);
            // Agrupa vendedores
            if (!sellers[seller]) sellers[seller] = { qtd: 0, prices: [] };
            sellers[seller].qtd += qtd;
            sellers[seller].prices.push(price);
            // Para média
            totalQtd += qtd;
            totalSum += price * qtd;
            for (let i = 0; i < qtd; i++) allPrices.push(price);
        });

        // Resistências: ordena por quantidade decrescente
        const resistencias = Array.from(priceMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([preco, qtd]) => ({ preco, qtd }));
        
        // Sugestões abaixo das resistências (máximo 5)
        const sugestoesResist = resistencias
            .slice(0, 5)
            .map(r => r.preco > 1 ? r.preco - 1 : r.preco)
            .filter((v, i, arr) => arr.indexOf(v) === i);
        
        // Média ponderada
        const media = totalQtd ? Math.round(totalSum / totalQtd) : 0;
        const sugestaoMedia = Math.round(media * 0.95);
        
        // Principais vendedores
        const topSellers = Object.entries(sellers)
            .sort((a, b) => b[1].qtd - a[1].qtd)
            .slice(0, 5)
            .map(([nome, data]) => ({ nome, qtd: data.qtd }));
        
        // Faixa de preços
        const min = allPrices.length ? Math.min(...allPrices) : 0;
        const max = allPrices.length ? Math.max(...allPrices) : 0;

        return {
            sugestoesResist,
            resistencias,
            sugestaoMedia,
            media,
            min,
            max,
            totalQtd,
            topSellers
        };
    }

    // Cria interface melhorada
    async function renderInterface(analise) {
        // Remove anterior
        document.querySelectorAll('.ragna4th-analysis-container').forEach(e => e.remove());
        
        // Busca dados do item
        const itemId = getCurrentItemId();
        const itemData = itemId ? await fetchItemData(itemId) : null;
        
        const div = document.createElement('div');
        div.className = 'ragna4th-analysis-container';
        
        // CSS inline para interface moderna
        const styles = `
            <style>
                .ragna4th-analysis {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 1px solid #e7a436;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    padding: 24px;
                    color: #fff;
                    max-width: 1200px;
                    box-shadow: 0 8px 32px rgba(231, 164, 54, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .ragna4th-analysis h3 {
                    margin: 0 0 20px 0;
                    color: #e7a436;
                    font-size: 1.5em;
                    text-align: center;
                    border-bottom: 2px solid #e7a436;
                    padding-bottom: 10px;
                }
                .analysis-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .analysis-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 16px;
                    border: 1px solid rgba(231, 164, 54, 0.2);
                }
                .analysis-card h4 {
                    margin: 0 0 12px 0;
                    color: #e7a436;
                    font-size: 1.1em;
                }
                .price-suggestion {
                    font-size: 1.4em;
                    font-weight: bold;
                    color: #4ade80;
                    margin: 8px 0;
                }
                .price-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .price-list li {
                    background: rgba(231, 164, 54, 0.1);
                    margin: 4px 0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    border-left: 3px solid #e7a436;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .price-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .price-info {
                    display: flex;
                    flex-direction: column;
                }
                .price-label {
                    font-size: 0.9em;
                    color: #ccc;
                }
                .price-value {
                    font-size: 1.1em;
                    font-weight: bold;
                    color: #4ade80;
                }
                .btn-copy-inline {
                    padding: 4px 8px;
                    border: none;
                    border-radius: 4px;
                    background: linear-gradient(135deg, #e7a436 0%, #f39c12 100%);
                    color: #222;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.8em;
                    margin-left: 8px;
                }
                .btn-copy-inline:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(231, 164, 54, 0.3);
                }
                .btn-copy-inline.success {
                    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                }
                .seller-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .seller-list li {
                    padding: 6px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 12px;
                    margin: 16px 0;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }
                .stat-item {
                    text-align: center;
                }
                .stat-value {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #e7a436;
                }
                .stat-label {
                    font-size: 0.9em;
                    color: #ccc;
                }
                .small-text {
                    font-size: 0.85em;
                    color: #aaa;
                    margin-top: 8px;
                }
                @media (max-width: 768px) {
                    .analysis-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
        
        div.innerHTML = styles + `
            <div class="ragna4th-analysis">
                <h3>📊 Análise Inteligente do Mercado</h3>
                
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h4>💸 Sugestões por Resistência</h4>
                        <ul class="price-list">
                            ${analise.sugestoesResist.map((price, index) => `
                                <li>
                                    <div class="price-item">
                                        <div class="price-info">
                                            <div class="price-label">${index + 1}º Preço Sugerido</div>
                                            <div class="price-value">${formatPrice(price)}</div>
                                        </div>
                                        <button class="btn-copy-inline" data-price="${price}" data-type="resistencia" data-index="${index + 1}">
                                            📋
                                        </button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                        <div class="small-text">Baseado nas maiores quantidades postadas</div>
                    </div>
                    
                    <div class="analysis-card">
                        <h4>📈 Preço pela Média Ponderada</h4>
                        <div class="price-suggestion">${formatPrice(analise.sugestaoMedia)}</div>
                        <div class="small-text">5% abaixo da média ponderada</div>
                        <div class="small-text">Média atual: ${formatPrice(analise.media)}</div>
                    </div>
                    
                    <div class="analysis-card">
                        <h4>🏪 Principais Vendedores</h4>
                        <ul class="seller-list">
                            ${analise.topSellers.map(seller => `
                                <li>
                                    <span>${seller.nome}</span>
                                    <span style="color: #e7a436;">${seller.qtd} itens</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                ${itemData ? `
                <div class="analysis-card">
                    <h4>📊 Dados Históricos do Item</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${formatPrice(itemData.menorPrecoDisponivel)}</div>
                            <div class="stat-label">Menor Preço Disponível</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${formatPrice(itemData.menorPrecoVenda)}</div>
                            <div class="stat-label">Menor Venda (30d)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${formatPrice(itemData.maiorPrecoVenda)}</div>
                            <div class="stat-label">Maior Venda (30d)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${formatNumber(itemData.numeroVendas)}</div>
                            <div class="stat-label">Vendas (30d)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${formatNumber(itemData.totalVendido)}</div>
                            <div class="stat-label">Total Vendido (30d)</div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${analise.totalQtd}</div>
                        <div class="stat-label">Total de Itens</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatPrice(analise.min)} - ${formatPrice(analise.max)}</div>
                        <div class="stat-label">Faixa de Preços</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatPrice(analise.media)}</div>
                        <div class="stat-label">Preço Médio</div>
                    </div>
                </div>
            </div>
        `;
        
        // Insere antes da tabela
        const contentBody = document.querySelector('.nk-content-body');
        if (contentBody) contentBody.insertBefore(div, contentBody.firstChild);
        
        // Eventos para todos os botões de copiar inline
        div.querySelectorAll('.btn-copy-inline').forEach(btn => {
            btn.onclick = function() {
                const price = this.getAttribute('data-price');
                const type = this.getAttribute('data-type');
                const index = this.getAttribute('data-index');
                
                navigator.clipboard.writeText(price).then(() => {
                    // Feedback visual
                    this.classList.add('success');
                    this.textContent = '✅';
                    
                    setTimeout(() => {
                        this.classList.remove('success');
                        this.textContent = '📋';
                    }, 2000);
                });
            };
        });
    }

    // Atualiza sempre que a tabela mudar
    function main() {
        const analise = analyzeMarket();
        renderInterface(analise);
    }

    waitForMarketTable(() => {
        main();
        // Observa mudanças na tabela
        const table = document.querySelector('#market-table');
        const obs = new MutationObserver(() => setTimeout(main, 500));
        obs.observe(table, { childList: true, subtree: true });
    });

})(); 