/* 
 * Ragna4th Market Analyzer - Script de Configurações
 * 
 * 🎮 Extensão para análise de preços no Ragna4th
 * 👨‍💻 Criado por: Dan Marofa (@dancarvofc)
 * 🌐 GitHub: https://github.com/dancarvofc
 * 
 * Este script controla a página de configurações da extensão
 */

// Classe principal que gerencia as configurações
class OptionsManager {
    constructor() {
        // Configurações padrão da extensão
        this.defaultSettings = {
            autoAnalyze: true, // Análise automática ligada
            notifications: true, // Notificações ligadas
            theme: 'auto', // Tema automático (claro/escuro/cinza)
            priceMargin: 1, // Margem de preço (1 zeny)
            sellerLimit: 5 // Limite de vendedores mostrados
        };
        
        this.init(); // Inicia tudo
    }

    // Método de inicialização
    async init() {
        this.setupEventListeners(); // Configura os eventos dos botões
        await this.loadSettings(); // Carrega as configurações salvas
        await this.loadStats(); // Carrega as estatísticas
    }

    // Configura todos os eventos de clique e mudança
    setupEventListeners() {
        // Toggles (botões que ligam/desligam)
        document.getElementById('autoAnalyze').addEventListener('click', () => {
            this.toggleSetting('autoAnalyze');
        });

        document.getElementById('notifications').addEventListener('click', () => {
            this.toggleSetting('notifications');
        });

        // Selects (menus dropdown)
        document.getElementById('theme').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        // Inputs numéricos
        document.getElementById('priceMargin').addEventListener('change', (e) => {
            this.updateSetting('priceMargin', parseInt(e.target.value));
        });

        document.getElementById('sellerLimit').addEventListener('change', (e) => {
            this.updateSetting('sellerLimit', parseInt(e.target.value));
        });

        // Botões de ação
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearData();
        });
    }

    // Carrega as configurações salvas do storage
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || this.defaultSettings;
            
            this.updateUI(settings); // Atualiza a interface com as configurações
        } catch (error) {
            console.error('Deu ruim ao carregar configurações:', error);
            this.showMessage('Erro ao carregar configurações', 'error');
        }
    }

    // Carrega as estatísticas da extensão
    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['stats']);
            const stats = result.stats || { itemsAnalyzed: 0, lastAnalysis: null };
            
            // Mostra quantos itens foram analisados
            document.getElementById('itemsAnalyzed').textContent = stats.itemsAnalyzed;
            
            // Mostra quando foi a última análise
            if (stats.lastAnalysis) {
                const date = new Date(stats.lastAnalysis);
                document.getElementById('lastAnalysis').textContent = date.toLocaleDateString('pt-BR');
            } else {
                document.getElementById('lastAnalysis').textContent = 'Nunca';
            }
        } catch (error) {
            console.error('Deu ruim ao carregar estatísticas:', error);
        }
    }

    // Atualiza a interface com as configurações
    updateUI(settings) {
        // Atualiza os toggles
        this.updateToggle('autoAnalyze', settings.autoAnalyze);
        this.updateToggle('notifications', settings.notifications);
        
        // Atualiza os selects
        document.getElementById('theme').value = settings.theme;
        
        // Atualiza os inputs
        document.getElementById('priceMargin').value = settings.priceMargin;
        document.getElementById('sellerLimit').value = settings.sellerLimit;
    }

    // Atualiza o visual de um toggle (ativo/inativo)
    updateToggle(id, value) {
        const toggle = document.getElementById(id);
        if (value) {
            toggle.classList.add('active'); // Liga
        } else {
            toggle.classList.remove('active'); // Desliga
        }
    }

    // Alterna uma configuração (liga/desliga)
    toggleSetting(setting) {
        const toggle = document.getElementById(setting);
        const isActive = toggle.classList.contains('active');
        
        toggle.classList.toggle('active'); // Muda o visual
        this.updateSetting(setting, !isActive); // Salva a mudança
    }

    // Atualiza uma configuração específica
    async updateSetting(key, value) {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || this.defaultSettings;
            
            settings[key] = value; // Atualiza o valor
            
            await chrome.storage.local.set({ settings }); // Salva
            
            // Notifica o content script sobre a mudança (pra aplicar em tempo real)
            chrome.tabs.query({ url: '*://db.ragna4th.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                });
            });
            
        } catch (error) {
            console.error('Deu ruim ao atualizar configuração:', error);
            this.showMessage('Erro ao atualizar configuração', 'error');
        }
    }

    // Salva todas as configurações de uma vez
    async saveSettings() {
        try {
            // Coleta todas as configurações atuais da interface
            const settings = {
                autoAnalyze: document.getElementById('autoAnalyze').classList.contains('active'),
                notifications: document.getElementById('notifications').classList.contains('active'),
                theme: document.getElementById('theme').value,
                priceMargin: parseInt(document.getElementById('priceMargin').value),
                sellerLimit: parseInt(document.getElementById('sellerLimit').value)
            };
            
            // Valida os valores (não pode ser muito absurdo)
            if (settings.priceMargin < 1 || settings.priceMargin > 100) {
                this.showMessage('Margem de preço deve estar entre 1 e 100', 'error');
                return;
            }
            
            if (settings.sellerLimit < 1 || settings.sellerLimit > 20) {
                this.showMessage('Limite de vendedores deve estar entre 1 e 20', 'error');
                return;
            }
            
            // Salva as configurações
            await chrome.storage.local.set({ settings });
            
            this.showMessage('Configurações salvas com sucesso! ✅', 'success');
            
            // Notifica o content script pra aplicar as mudanças
            chrome.tabs.query({ url: '*://db.ragna4th.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                });
            });
            
        } catch (error) {
            console.error('Deu ruim ao salvar configurações:', error);
            this.showMessage('Erro ao salvar configurações', 'error');
        }
    }

    // Restaura as configurações padrão
    async resetSettings() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            try {
                await chrome.storage.local.set({ settings: this.defaultSettings });
                this.updateUI(this.defaultSettings);
                this.showMessage('Configurações restauradas! 🔄', 'success');
                
                // Notifica o content script
                chrome.tabs.query({ url: '*://db.ragna4th.com/*' }, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'settingsUpdated',
                            settings: this.defaultSettings
                        });
                    });
                });
                
            } catch (error) {
                console.error('Deu ruim ao restaurar configurações:', error);
                this.showMessage('Erro ao restaurar configurações', 'error');
            }
        }
    }

    // Limpa todos os dados salvos (estatísticas, histórico, etc.)
    async clearData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Isso não pode ser desfeito!')) {
            try {
                await chrome.storage.local.clear();
                this.updateUI(this.defaultSettings);
                await this.loadStats(); // Recarrega as estatísticas (vai ficar zerado)
                this.showMessage('Dados limpos com sucesso! 🗑️', 'success');
                
            } catch (error) {
                console.error('Deu ruim ao limpar dados:', error);
                this.showMessage('Erro ao limpar dados', 'error');
            }
        }
    }

    // Mostra mensagens de feedback para o usuário
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
        const container = document.querySelector('.container');
        container.insertBefore(messageElement, container.firstChild);

        // Remove após 3 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }

    // Formata números com vírgulas
    formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    // Formata datas bonitinho
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }
}

// Inicializa as configurações quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
}); 