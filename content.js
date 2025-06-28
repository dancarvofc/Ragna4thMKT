/* 
 * Ragna4th Market Analyzer - Script de Conteúdo
 * 
 * 🎮 Extensão para análise de preços no Ragna4th
 * 👨‍💻 Criado por: Dan Marofa (@dancarvofc)
 * 🌐 GitHub: https://github.com/dancarvofc
 * 
 * Este script roda nas páginas do Ragna4th e analisa os preços do mercado
 */

// Ragna4th Market Analyzer - Versão Melhorada
(function() {
    'use strict';

    // Só roda na página de mercado - se não for, sai fora
    if (!window.location.pathname.startsWith('/market')) return;

    // Cache para dados do item - pra não ficar fazendo requisição toda hora
    let itemData = null;
    let currentItemId = null;
    let currentSearchTerm = null;

    // Funções utilitárias para trabalhar com preços e números
    
    // Converte texto de preço em número (remove tudo que não é dígito)
    function parsePrice(text) {
        return parseInt((text || '').replace(/[^\d]/g, '')) || 0;
    }
    
    // Formata preço bonitinho com vírgulas e o símbolo ƶ
    function formatPrice(price) {
        return price.toLocaleString('pt-BR') + 'ƶ';
    }

    // Formata números com vírgulas
    function formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    // Busca dados do item na página específica do item
    async function fetchItemData(itemId) {
        // Se já temos os dados desse item, retorna do cache
        if (itemId === currentItemId && itemData) return itemData;
        
        try {
            // Faz requisição para a página do item
            const response = await fetch(`https://db.ragna4th.com/item/${itemId}`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrai os preços dos elementos da página
            const priceElements = doc.querySelectorAll('.nk-iv-wg3-amount .number');
            const prices = Array.from(priceElements).map(el => parsePrice(el.textContent));
            
            // Organiza os dados em um objeto bonito
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
            console.error('Deu ruim ao buscar dados do item:', error);
            return null;
        }
    }

    // Extrai o ID do item da URL ou da tabela
    function getCurrentItemId() {
        // Tenta extrair da URL primeiro (mais fácil)
        const urlMatch = window.location.href.match(/[?&]item=(\d+)/);
        if (urlMatch) return urlMatch[1];
        
        // Se não deu, tenta extrair da tabela
        const firstItem = document.querySelector('#market-table .market-item a[href*="/item/"]');
        if (firstItem) {
            const hrefMatch = firstItem.href.match(/\/item\/(\d+)/);
            if (hrefMatch) return hrefMatch[1];
        }
        
        return null;
    }

    // Aguarda a tabela do mercado carregar (às vezes demora um pouco)
    function waitForMarketTable(cb) {
        const table = document.querySelector('#market-table');
        if (table && table.children.length > 0) return cb(); // Se já carregou, executa direto
        
        // Se não carregou, fica observando até carregar
        const obs = new MutationObserver(() => {
            const table = document.querySelector('#market-table');
            if (table && table.children.length > 0) {
                obs.disconnect(); // Para de observar
                cb(); // Executa o callback
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Analisa a tabela do mercado e extrai todas as informações importantes
    function analyzeMarket() {
        const rows = document.querySelectorAll('#market-table .market-item');
        const priceMap = new Map(); // preço -> quantidade total
        const sellers = {}; // vendedor -> {qtd, preços}
        let totalQtd = 0;
        let totalSum = 0;
        let allPrices = [];

        // Passa por cada linha da tabela
        rows.forEach(row => {
            const price = parsePrice(row.querySelector('.market-price')?.textContent);
            const qtd = parseInt(row.querySelector('.market-amount')?.textContent.replace(/[^\d]/g, '')) || 1;
            const seller = row.querySelector('.market-seller')?.textContent.trim() || 'Desconhecido';
            if (!price) return; // Se não tem preço, pula
            
            // Agrupa resistências (mesmo preço = mais quantidade)
            priceMap.set(price, (priceMap.get(price) || 0) + qtd);
            
            // Agrupa vendedores
            if (!sellers[seller]) sellers[seller] = { qtd: 0, prices: [] };
            sellers[seller].qtd += qtd;
            sellers[seller].prices.push(price);
            
            // Para calcular média ponderada
            totalQtd += qtd;
            totalSum += price * qtd;
            for (let i = 0; i < qtd; i++) allPrices.push(price);
        });

        // Resistências: ordena por quantidade decrescente (mais quantidade = mais resistência)
        const resistencias = Array.from(priceMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([preco, qtd]) => ({ preco, qtd }));
        
        // Sugestões abaixo das resistências (máximo 5)
        const sugestoesResist = resistencias
            .slice(0, 5)
            .map(r => r.preco > 1 ? r.preco - 1 : r.preco) // 1 zeny abaixo da resistência
            .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicatas
        
        // Média ponderada (considera quantidade)
        const media = totalQtd ? Math.round(totalSum / totalQtd) : 0;
        const sugestaoMedia = Math.round(media * 0.95); // 5% abaixo da média
        
        // Principais vendedores (top 5)
        const topSellers = Object.entries(sellers)
            .sort((a, b) => b[1].qtd - a[1].qtd)
            .slice(0, 5)
            .map(([nome, data]) => ({ nome, qtd: data.qtd }));
        
        // Faixa de preços (mínimo e máximo)
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

    // Pega o tema atual das configurações
    function getCurrentTheme() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['settings'], (result) => {
                const theme = result.settings?.theme || 'auto';
                resolve(theme);
            });
        });
    }

    // Aplica o tema correto baseado na configuração
    function applyTheme(theme) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        let finalTheme = theme;
        if (theme === 'auto') {
            finalTheme = isDarkMode ? 'dark' : 'light';
        }

        return finalTheme;
    }

    // Cria a interface bonita na página
    async function renderInterface(analise) {
        // Remove interface anterior se existir
        document.querySelectorAll('.ragna4th-analysis-container').forEach(e => e.remove());
        
        // Busca dados do item (se conseguir)
        const itemId = getCurrentItemId();
        const itemData = itemId ? await fetchItemData(itemId) : null;
        
        // Pega o tema atual
        const theme = await getCurrentTheme();
        const appliedTheme = applyTheme(theme);
        
        const div = document.createElement('div');
        div.className = `ragna4th-analysis-container theme-${appliedTheme}`;

        // Pega o nome do item atual (se estiver pesquisando)
        const searchTitle = document.querySelector('.searching-for h5');
        const currentItemName = searchTitle ? searchTitle.textContent : 'Mercado Geral';

        // HTML da interface com classe de tema
        div.innerHTML = `
            <div class="ragna4th-analysis theme-${appliedTheme}">
                <h3>🎮 Análise de Mercado - ${currentItemName}</h3>
                
                <div class="analysis-grid">
                    <!-- Card de sugestões baseadas em resistências -->
                    <div class="analysis-card">
                        <h4>💡 Sugestões por Resistência</h4>
                        ${analise.sugestoesResist.length > 0 ? 
                            analise.sugestoesResist.map(preco => `
                                <div class="price-item">
                                    <div class="price-suggestion">${formatPrice(preco)}</div>
                                    <button class="btn-copy-individual" onclick="copyToClipboard('${preco}')">
                                        📋 Copiar
                                    </button>
                                </div>
                            `).join('') : 
                            '<p>Nenhuma sugestão disponível</p>'
                        }
                    </div>

                    <!-- Card de sugestão por média -->
                    <div class="analysis-card">
                        <h4>📊 Sugestão por Média</h4>
                        <div class="price-suggestion">${formatPrice(analise.sugestaoMedia)}</div>
                        <p><small>Média ponderada: ${formatPrice(analise.media)}</small></p>
                        <div class="analysis-actions">
                            <button class="btn-copy-price" onclick="copyToClipboard('${analise.sugestaoMedia}')">
                                📋 Copiar Preço
                            </button>
                        </div>
                    </div>

                    <!-- Card de faixa de preços -->
                    <div class="analysis-card">
                        <h4>📈 Faixa de Preços</h4>
                        <p><strong>Mínimo:</strong> ${formatPrice(analise.min)}</p>
                        <p><strong>Máximo:</strong> ${formatPrice(analise.max)}</p>
                        <p><strong>Total:</strong> ${formatNumber(analise.totalQtd)} itens</p>
                        <div class="analysis-actions">
                            <a href="https://db.ragna4th.com/market" class="btn-view-market" target="_blank">
                                🛒 Ver Mercado
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Informações adicionais do item -->
                ${itemData ? `
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h4>📋 Dados do Item</h4>
                        <p><strong>Menor disponível:</strong> ${formatPrice(itemData.menorPrecoDisponivel)}</p>
                        <p><strong>Menor venda:</strong> ${formatPrice(itemData.menorPrecoVenda)}</p>
                        <p><strong>Maior venda:</strong> ${formatPrice(itemData.maiorPrecoVenda)}</p>
                    </div>
                    <div class="analysis-card">
                        <h4>📊 Estatísticas</h4>
                        <p><strong>Número de vendas:</strong> ${formatNumber(itemData.numeroVendas)}</p>
                        <p><strong>Total vendido:</strong> ${formatPrice(itemData.totalVendido)}</p>
                    </div>
                    <div class="analysis-card">
                        <h4>👥 Top Vendedores</h4>
                        ${analise.topSellers.map(seller => 
                            `<p><strong>${seller.nome}:</strong> ${formatNumber(seller.qtd)} itens</p>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Footer com créditos -->
                <div class="ragna4th-footer theme-${appliedTheme}">
                    <p>
                        Criado por <span class="creator-badge">Dan Marofa</span>
                        <br>
                        <a href="https://github.com/dancarvofc" target="_blank">@dancarvofc</a>
                    </p>
                </div>
            </div>
        `;

        // Insere a interface ANTES da tabela (não no final da página)
        const marketCard = document.querySelector('#market-card');
        if (marketCard) {
            marketCard.parentNode.insertBefore(div, marketCard);
        } else {
            // Fallback: insere no body se não encontrar o card
            document.body.appendChild(div);
        }

        // Adiciona função global para copiar preços
        window.copyToClipboard = function(price) {
            navigator.clipboard.writeText(price.toString()).then(() => {
                // Mostra feedback visual
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✅ Copiado!';
                btn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                }, 2000);
            }).catch(err => {
                console.error('Deu ruim ao copiar:', err);
            });
        };
    }

    // Observa mudanças na pesquisa para atualizar a análise
    function observeSearchChanges() {
        // Observa mudanças no título da pesquisa
        const searchObserver = new MutationObserver(async (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const searchTitle = document.querySelector('.searching-for h5');
                    if (searchTitle && searchTitle.textContent !== currentSearchTerm) {
                        currentSearchTerm = searchTitle.textContent;
                        console.log('Pesquisa mudou para:', currentSearchTerm);
                        
                        // Aguarda um pouco para a tabela atualizar
                        setTimeout(() => {
                            const analise = analyzeMarket();
                            renderInterface(analise);
                        }, 1000);
                    }
                }
            }
        });

        // Observa o elemento que contém o título da pesquisa
        const searchContainer = document.querySelector('.card-title');
        if (searchContainer) {
            searchObserver.observe(searchContainer, { childList: true, subtree: true });
        }

        // Observa mudanças no tema do site
        const themeObserver = new MutationObserver(async (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const analise = analyzeMarket();
                    renderInterface(analise);
                }
            }
        });

        // Observa o body para mudanças de tema
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // Função principal que coordena tudo
    function main() {
        // Aguarda a tabela carregar e depois analisa
        waitForMarketTable(() => {
            const analise = analyzeMarket();
            renderInterface(analise);
            observeSearchChanges(); // Observa mudanças na pesquisa
        });
    }

    // Inicia tudo quando a página carrega
    main();

    // Torna a classe disponível globalmente (pra o popup poder usar)
    window.Ragna4thAnalyzer = function() {
        main();
    };

})(); 