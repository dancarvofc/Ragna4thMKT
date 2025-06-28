// Ragna4th Market Analyzer - Popup Script

class PopupManager {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkCurrentTab();
        this.updateStatus();
    }

    setupEventListeners() {
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeCurrentPage();
        });

        document.getElementById('openMarketBtn').addEventListener('click', () => {
            this.openMarket();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
    }

    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
            this.isRagna4thPage = tab.url && tab.url.includes('db.ragna4th.com');
        } catch (error) {
            console.error('Erro ao verificar aba atual:', error);
            this.isRagna4thPage = false;
        }
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (this.isRagna4thPage) {
            statusElement.className = 'status active';
            statusText.textContent = 'Página do Ragna4th detectada!';
            analyzeBtn.disabled = false;
        } else {
            statusElement.className = 'status inactive';
            statusText.textContent = 'Navegue para uma página do Ragna4th';
            analyzeBtn.disabled = true;
        }
    }

    async analyzeCurrentPage() {
        if (!this.isRagna4thPage) {
            this.showMessage('Navegue para uma página do Ragna4th primeiro!', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // Executa o script de análise na página atual
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: this.triggerAnalysis
            });

            this.showMessage('Análise iniciada! Verifique a página.', 'success');
        } catch (error) {
            console.error('Erro ao executar análise:', error);
            this.showMessage('Erro ao executar análise. Tente novamente.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    triggerAnalysis() {
        // Função que será executada na página do Ragna4th
        if (window.Ragna4thAnalyzer) {
            // Se o analisador já existe, reinicia
            new window.Ragna4thAnalyzer();
        } else {
            // Se não existe, recarrega a página para carregar o script
            window.location.reload();
        }
    }

    openMarket() {
        chrome.tabs.create({
            url: 'https://db.ragna4th.com/market'
        });
    }

    openSettings() {
        // Abre as configurações da extensão
        chrome.runtime.openOptionsPage();
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (show) {
            loadingElement.classList.add('show');
            analyzeBtn.disabled = true;
        } else {
            loadingElement.classList.remove('show');
            analyzeBtn.disabled = false;
        }
    }

    showMessage(message, type = 'info') {
        // Remove mensagens anteriores
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Cria nova mensagem
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        // Insere na página
        const content = document.querySelector('.content');
        content.insertBefore(messageElement, content.firstChild);

        // Remove após 3 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }

    // Função para formatar preços
    formatPrice(price) {
        return price.toLocaleString('pt-BR') + 'ƶ';
    }

    // Função para calcular preço sugerido
    calculateSuggestedPrice(prices) {
        if (!prices || prices.length === 0) return 0;
        const lowestPrice = Math.min(...prices);
        return Math.max(1, lowestPrice - 1); // 1 zeny abaixo do menor preço
    }
}

// Inicializa o popup quando o DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Adiciona estilos para mensagens
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 10px;
        font-size: 0.9rem;
        text-align: center;
    }
    
    .message.error {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #fecaca;
    }
    
    .message.success {
        background: rgba(74, 222, 128, 0.2);
        border: 1px solid rgba(74, 222, 128, 0.5);
        color: #dcfce7;
    }
    
    .message.info {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.5);
        color: #dbeafe;
    }
`;
document.head.appendChild(style); 