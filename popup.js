/* 
 * Ragna4th Market Analyzer - Script do Popup
 * 
 * 🎮 Extensão para análise de preços no Ragna4th
 * 👨‍💻 Criado por: Dan Marofa (@dancarvofc)
 * 🌐 GitHub: https://github.com/dancarvofc
 * 
 * Este script controla a interface do popup da extensão
 */

// Classe principal que gerencia o popup da extensão
class PopupManager {
    constructor() {
        this.init(); // Inicia tudo quando a classe é criada
    }

    // Método de inicialização - configura tudo que precisa
    async init() {
        this.setupEventListeners(); // Configura os eventos dos botões
        await this.checkCurrentTab(); // Verifica qual aba está ativa
        this.updateStatus(); // Atualiza o status na interface
    }

    // Configura todos os eventos de clique dos botões
    setupEventListeners() {
        // Botão de analisar página atual
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeCurrentPage();
        });

        // Botão de abrir mercado
        document.getElementById('openMarketBtn').addEventListener('click', () => {
            this.openMarket();
        });

        // Botão de configurações
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
    }

    // Verifica qual aba está ativa e se é do Ragna4th
    async checkCurrentTab() {
        try {
            // Pega a aba ativa no momento
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
            
            // Verifica se a URL é do Ragna4th
            this.isRagna4thPage = tab.url && tab.url.includes('db.ragna4th.com');
        } catch (error) {
            console.error('Deu ruim ao verificar a aba atual:', error);
            this.isRagna4thPage = false;
        }
    }

    // Atualiza o status na interface baseado na página atual
    updateStatus() {
        const statusElement = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (this.isRagna4thPage) {
            // Se está na página do Ragna4th, mostra status ativo
            statusElement.className = 'status active';
            statusText.textContent = 'Página do Ragna4th detectada! 🎉';
            analyzeBtn.disabled = false; // Habilita o botão de análise
        } else {
            // Se não está, mostra status inativo
            statusElement.className = 'status inactive';
            statusText.textContent = 'Navegue para uma página do Ragna4th primeiro!';
            analyzeBtn.disabled = true; // Desabilita o botão
        }
    }

    // Executa a análise na página atual
    async analyzeCurrentPage() {
        if (!this.isRagna4thPage) {
            this.showMessage('Navegue para uma página do Ragna4th primeiro!', 'error');
            return;
        }

        this.showLoading(true); // Mostra o loading

        try {
            // Executa o script de análise na página atual
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: this.triggerAnalysis
            });

            this.showMessage('Análise iniciada! Verifique a página. 🚀', 'success');
        } catch (error) {
            console.error('Deu ruim ao executar a análise:', error);
            this.showMessage('Erro ao executar análise. Tente novamente.', 'error');
        } finally {
            this.showLoading(false); // Esconde o loading
        }
    }

    // Função que será executada na página do Ragna4th
    triggerAnalysis() {
        // Se o analisador já existe, reinicia ele
        if (window.Ragna4thAnalyzer) {
            new window.Ragna4thAnalyzer();
        } else {
            // Se não existe, recarrega a página para carregar o script
            window.location.reload();
        }
    }

    // Abre o mercado do Ragna4th em uma nova aba
    openMarket() {
        chrome.tabs.create({
            url: 'https://db.ragna4th.com/market'
        });
    }

    // Abre as configurações da extensão
    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    // Controla a exibição do loading
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (show) {
            loadingElement.classList.add('show'); // Mostra o loading
            analyzeBtn.disabled = true; // Desabilita o botão
        } else {
            loadingElement.classList.remove('show'); // Esconde o loading
            analyzeBtn.disabled = false; // Habilita o botão
        }
    }

    // Mostra mensagens de feedback para o usuário
    showMessage(message, type = 'info') {
        // Remove mensagens anteriores se existirem
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Cria uma nova mensagem
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        // Insere na página
        const content = document.querySelector('.content');
        content.insertBefore(messageElement, content.firstChild);

        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }

    // Formata preços para exibição (adiciona vírgulas e o símbolo ƶ)
    formatPrice(price) {
        return price.toLocaleString('pt-BR') + 'ƶ';
    }

    // Calcula preço sugerido baseado nos preços existentes
    calculateSuggestedPrice(prices) {
        if (!prices || prices.length === 0) return 0;
        const lowestPrice = Math.min(...prices);
        return Math.max(1, lowestPrice - 1); // 1 zeny abaixo do menor preço
    }
}

// Inicializa o popup quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Adiciona estilos CSS para as mensagens de feedback
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
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #dc2626;
    }
    
    .message.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #059669;
    }
    
    .message.info {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #2563eb;
    }
`;
document.head.appendChild(style); 