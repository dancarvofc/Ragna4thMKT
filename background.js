// Ragna4th Market Analyzer - Background Service Worker

// Instalação da extensão
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Ragna4th Market Analyzer instalado:', details.reason);
    
    if (details.reason === 'install') {
        // Primeira instalação
        chrome.storage.local.set({
            settings: {
                autoAnalyze: true,
                notifications: true,
                theme: 'auto'
            },
            stats: {
                itemsAnalyzed: 0,
                lastAnalysis: null
            }
        });
        
        // Abre a página de boas-vindas
        chrome.tabs.create({
            url: 'https://db.ragna4th.com/market'
        });
    }
});

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensagem recebida:', request);
    
    switch (request.action) {
        case 'analyzeComplete':
            handleAnalysisComplete(request.data, sender.tab);
            break;
            
        case 'getSettings':
            chrome.storage.local.get(['settings'], (result) => {
                sendResponse({ settings: result.settings || {} });
            });
            return true; // Indica que a resposta será assíncrona
            
        case 'updateStats':
            updateStats(request.data);
            break;
            
        case 'showNotification':
            showNotification(request.data);
            break;
    }
});

// Manipula a conclusão de uma análise
function handleAnalysisComplete(data, tab) {
    console.log('Análise concluída:', data);
    
    // Atualiza estatísticas
    updateStats({
        itemsAnalyzed: 1,
        lastAnalysis: new Date().toISOString()
    });
    
    // Mostra notificação se habilitada
    chrome.storage.local.get(['settings'], (result) => {
        if (result.settings?.notifications) {
            showNotification({
                title: 'Análise Concluída!',
                message: `Item ${data.itemId} analisado. Preço sugerido: ${data.suggestedPrice}ƶ`,
                icon: 'icons/icon48.png'
            });
        }
    });
}

// Atualiza estatísticas da extensão
function updateStats(newStats) {
    chrome.storage.local.get(['stats'], (result) => {
        const currentStats = result.stats || {
            itemsAnalyzed: 0,
            lastAnalysis: null
        };
        
        const updatedStats = {
            itemsAnalyzed: currentStats.itemsAnalyzed + (newStats.itemsAnalyzed || 0),
            lastAnalysis: newStats.lastAnalysis || currentStats.lastAnalysis
        };
        
        chrome.storage.local.set({ stats: updatedStats });
    });
}

// Mostra notificação
function showNotification(data) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: data.icon || 'icons/icon48.png',
        title: data.title || 'Ragna4th Market Analyzer',
        message: data.message || 'Análise concluída!'
    });
}

// Listener para cliques em notificações
chrome.notifications.onClicked.addListener((notificationId) => {
    // Abre a página do mercado quando a notificação é clicada
    chrome.tabs.create({
        url: 'https://db.ragna4th.com/market'
    });
});

// Listener para mudanças de aba
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('db.ragna4th.com')) {
        // Verifica se a análise automática está habilitada
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings?.autoAnalyze) {
                // Aguarda um pouco para a página carregar completamente
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, { action: 'autoAnalyze' });
                }, 2000);
            }
        });
    }
});

// Context menu para análise rápida
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'analyzeItem',
        title: 'Analisar Item Ragna4th',
        contexts: ['link'],
        documentUrlPatterns: ['*://db.ragna4th.com/*']
    });
});

// Listener para cliques no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'analyzeItem') {
        // Extrai o ID do item da URL
        const url = info.linkUrl;
        const match = url.match(/\/item\/(\d+)/);
        
        if (match) {
            const itemId = match[1];
            chrome.tabs.create({
                url: `https://db.ragna4th.com/item/${itemId}`
            });
        }
    }
});

// Função para limpar dados antigos (executada periodicamente)
function cleanupOldData() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    chrome.storage.local.get(['analysisHistory'], (result) => {
        if (result.analysisHistory) {
            const filteredHistory = result.analysisHistory.filter(entry => 
                new Date(entry.timestamp) > oneWeekAgo
            );
            
            chrome.storage.local.set({ analysisHistory: filteredHistory });
        }
    });
}

// Executa limpeza uma vez por dia
setInterval(cleanupOldData, 24 * 60 * 60 * 1000); 