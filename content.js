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
    let interfaceRendered = false; // Flag para evitar duplicatas

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

    // Função melhorada para copiar apenas números para a área de transferência
    function copyToClipboard(text, button) {
        // Remove tudo que não é dígito (apenas números)
        const cleanText = text.toString().replace(/[^\d]/g, '');
        
        console.log('Copiando texto limpo:', cleanText); // Debug
        
        // Tenta usar a API moderna primeiro
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(cleanText).then(() => {
                showCopyFeedback(button);
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                fallbackCopyTextToClipboard(cleanText, button);
            });
        } else {
            // Fallback para navegadores antigos
            fallbackCopyTextToClipboard(cleanText, button);
        }
    }

    // Fallback para copiar texto (método antigo mas funcional)
    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopyFeedback(button);
            } else {
                console.error('Falha ao copiar com execCommand');
            }
        } catch (err) {
            console.error('Erro no fallback de cópia:', err);
        }
        
        document.body.removeChild(textArea);
    }

    // Mostra feedback visual quando copia
    function showCopyFeedback(button) {
        if (!button) {
            console.log('Botão não encontrado para feedback');
            return;
        }
        
        const originalText = button.textContent;
        const originalBackground = button.style.background;
        
        button.textContent = '✅ Copiado!';
        button.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBackground;
            button.disabled = false;
        }, 2000);
    }

    // Busca dados do item na página específica do item
    async function fetchItemData(itemId) {
        // Se já temos os dados desse item, retorna do cache
        if (itemId === currentItemId && itemData) return itemData;
        
        try {
            console.log('Buscando dados do item:', itemId); // Debug
            
            // Faz requisição para a página do item
            const response = await fetch(`https://db.ragna4th.com/item/${itemId}`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrai os dados específicos da página do item
            const priceElements = doc.querySelectorAll('.nk-iv-wg3-amount .number');
            const titles = doc.querySelectorAll('.nk-iv-wg3-subtitle');
            
            console.log('Elementos encontrados:', {
                prices: priceElements.length,
                titles: titles.length
            }); // Debug
            
            // Mapeia os dados baseado na estrutura da página
            let menorPrecoDisponivel = 0;
            let menorPrecoVenda = 0;
            let maiorPrecoVenda = 0;
            let numeroVendas = 0;
            let totalVendido = 0;
            
            // Primeiro tenta extrair pelos títulos específicos
            titles.forEach((title, index) => {
                const titleText = title.textContent.trim();
                const priceElement = priceElements[index];
                
                console.log(`Título ${index}:`, titleText); // Debug
                
                if (priceElement) {
                    const price = parsePrice(priceElement.textContent);
                    console.log(`Preço ${index}:`, price); // Debug
                    
                    if (titleText.includes('Menor Preço Disponível')) {
                        menorPrecoDisponivel = price;
                    } else if (titleText.includes('Menor Preço de Venda')) {
                        menorPrecoVenda = price;
                    } else if (titleText.includes('Maior Preço de Venda')) {
                        maiorPrecoVenda = price;
                    } else if (titleText.includes('Número de Vendas')) {
                        numeroVendas = price;
                    } else if (titleText.includes('Total Vendido')) {
                        totalVendido = price;
                    }
                }
            });
            
            // Se não conseguiu extrair pelos títulos, tenta extrair diretamente pelos índices
            if (menorPrecoDisponivel === 0 && priceElements.length >= 5) {
                console.log('Tentando extração por índice...'); // Debug
                menorPrecoDisponivel = parsePrice(priceElements[0]?.textContent) || 0;
                menorPrecoVenda = parsePrice(priceElements[1]?.textContent) || 0;
                maiorPrecoVenda = parsePrice(priceElements[2]?.textContent) || 0;
                numeroVendas = parsePrice(priceElements[3]?.textContent) || 0;
                totalVendido = parsePrice(priceElements[4]?.textContent) || 0;
            }
            
            // Se ainda não conseguiu, tenta uma abordagem mais agressiva
            if (numeroVendas === 0 || totalVendido === 0) {
                console.log('Tentando extração agressiva...'); // Debug
                
                // Procura por qualquer elemento que contenha números
                const allTextElements = doc.querySelectorAll('*');
                const numberPattern = /(\d{1,3}(?:\.\d{3})*)/g;
                
                allTextElements.forEach(element => {
                    const text = element.textContent.trim();
                    if (text.includes('vendas') || text.includes('Vendas')) {
                        const matches = text.match(numberPattern);
                        if (matches && matches.length > 0) {
                            const num = parseInt(matches[0].replace(/\./g, ''));
                            if (num > 0 && num < 1000000) { // Número razoável de vendas
                                numeroVendas = num;
                                console.log('Encontrou número de vendas:', num);
                            }
                        }
                    }
                    if (text.includes('vendido') || text.includes('Vendido')) {
                        const matches = text.match(numberPattern);
                        if (matches && matches.length > 0) {
                            const num = parseInt(matches[0].replace(/\./g, ''));
                            if (num > 0) {
                                totalVendido = num;
                                console.log('Encontrou total vendido:', num);
                            }
                        }
                    }
                });
            }
            
            // Organiza os dados em um objeto bonito
            itemData = {
                menorPrecoDisponivel,
                menorPrecoVenda,
                maiorPrecoVenda,
                numeroVendas,
                totalVendido
            };
            
            console.log('Dados extraídos:', itemData); // Debug
            
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
        // Remove TODAS as interfaces existentes primeiro
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

        // Cria o HTML do ícone do item (se tiver ID)
        const itemIconHtml = itemId ? `
            <div class="item-icon-container">
                <img src="https://www.divine-pride.net/img/items/item/kROS/${itemId}" 
                     alt="Ícone do item ${itemId}" 
                     class="item-icon"
                     onerror="this.style.display='none'">
            </div>
        ` : '';

        // HTML da interface com classe de tema
        div.innerHTML = `
            <div class="ragna4th-analysis theme-${appliedTheme}">
                <div class="analysis-header">
                    ${itemIconHtml}
                    <h3>🎮 Análise de Mercado - ${currentItemName}</h3>
                </div>
                
                <div class="analysis-grid">
                    <!-- Card de sugestões baseadas em resistências -->
                    <div class="analysis-card">
                        <h4>💡 Sugestões por Resistência</h4>
                        ${analise.sugestoesResist.length > 0 ? 
                            analise.sugestoesResist.map(preco => `
                                <div class="price-item">
                                    <div class="price-suggestion">${formatPrice(preco)}</div>
                                    <button class="btn-copy-individual" data-price="${preco}">
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
                            <button class="btn-copy-price" data-price="${analise.sugestaoMedia}">
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

        // Tenta inserir a interface no local correto
        let inserted = false;
        
        // Primeiro tenta inserir antes do card do mercado
        const marketCard = document.querySelector('#market-card');
        if (marketCard && marketCard.parentNode) {
            marketCard.parentNode.insertBefore(div, marketCard);
            inserted = true;
        }
        
        // Se não encontrou o card, tenta inserir antes da tabela
        if (!inserted) {
            const marketTable = document.querySelector('#market-table');
            if (marketTable && marketTable.parentNode) {
                marketTable.parentNode.insertBefore(div, marketTable);
                inserted = true;
            }
        }
        
        // Se ainda não inseriu, tenta inserir no container principal
        if (!inserted) {
            const mainContainer = document.querySelector('.nk-content-body');
            if (mainContainer) {
                mainContainer.insertBefore(div, mainContainer.firstChild);
                inserted = true;
            }
        }
        
        // Último recurso: insere no body
        if (!inserted) {
            document.body.appendChild(div);
        }

        // Marca que a interface foi renderizada
        interfaceRendered = true;

        // Adiciona função global para copiar preços
        window.copyToClipboard = copyToClipboard;
        
        // Adiciona event listeners para os botões de cópia
        setTimeout(() => {
            const copyButtons = div.querySelectorAll('.btn-copy-individual, .btn-copy-price');
            copyButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const price = this.getAttribute('data-price') || this.textContent;
                    copyToClipboard(price, this);
                });
            });
        }, 100);
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