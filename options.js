// Ragna4th Market Analyzer - Options Script

class OptionsManager {
    constructor() {
        this.defaultSettings = {
            autoAnalyze: true,
            notifications: true,
            theme: 'auto',
            priceMargin: 1,
            sellerLimit: 5
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSettings();
        await this.loadStats();
    }

    setupEventListeners() {
        // Toggles
        document.getElementById('autoAnalyze').addEventListener('click', () => {
            this.toggleSetting('autoAnalyze');
        });

        document.getElementById('notifications').addEventListener('click', () => {
            this.toggleSetting('notifications');
        });

        // Selects
        document.getElementById('theme').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        // Inputs
        document.getElementById('priceMargin').addEventListener('change', (e) => {
            this.updateSetting('priceMargin', parseInt(e.target.value));
        });

        document.getElementById('sellerLimit').addEventListener('change', (e) => {
            this.updateSetting('sellerLimit', parseInt(e.target.value));
        });

        // Buttons
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

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || this.defaultSettings;
            
            this.updateUI(settings);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.showMessage('Erro ao carregar configurações', 'error');
        }
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['stats']);
            const stats = result.stats || { itemsAnalyzed: 0, lastAnalysis: null };
            
            document.getElementById('itemsAnalyzed').textContent = stats.itemsAnalyzed;
            
            if (stats.lastAnalysis) {
                const date = new Date(stats.lastAnalysis);
                document.getElementById('lastAnalysis').textContent = date.toLocaleDateString('pt-BR');
            } else {
                document.getElementById('lastAnalysis').textContent = 'Nunca';
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    updateUI(settings) {
        // Toggles
        this.updateToggle('autoAnalyze', settings.autoAnalyze);
        this.updateToggle('notifications', settings.notifications);
        
        // Selects
        document.getElementById('theme').value = settings.theme;
        
        // Inputs
        document.getElementById('priceMargin').value = settings.priceMargin;
        document.getElementById('sellerLimit').value = settings.sellerLimit;
    }

    updateToggle(id, value) {
        const toggle = document.getElementById(id);
        if (value) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }

    toggleSetting(setting) {
        const toggle = document.getElementById(setting);
        const isActive = toggle.classList.contains('active');
        
        toggle.classList.toggle('active');
        this.updateSetting(setting, !isActive);
    }

    async updateSetting(key, value) {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || this.defaultSettings;
            
            settings[key] = value;
            
            await chrome.storage.local.set({ settings });
            
            // Notifica o content script sobre a mudança
            chrome.tabs.query({ url: '*://db.ragna4th.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                });
            });
            
        } catch (error) {
            console.error('Erro ao atualizar configuração:', error);
            this.showMessage('Erro ao atualizar configuração', 'error');
        }
    }

    async saveSettings() {
        try {
            // Coleta todas as configurações atuais
            const settings = {
                autoAnalyze: document.getElementById('autoAnalyze').classList.contains('active'),
                notifications: document.getElementById('notifications').classList.contains('active'),
                theme: document.getElementById('theme').value,
                priceMargin: parseInt(document.getElementById('priceMargin').value),
                sellerLimit: parseInt(document.getElementById('sellerLimit').value)
            };
            
            // Valida os valores
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
            
            this.showMessage('Configurações salvas com sucesso!', 'success');
            
            // Notifica o content script
            chrome.tabs.query({ url: '*://db.ragna4th.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                });
            });
            
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.showMessage('Erro ao salvar configurações', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            try {
                await chrome.storage.local.set({ settings: this.defaultSettings });
                this.updateUI(this.defaultSettings);
                this.showMessage('Configurações restauradas!', 'success');
                
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
                console.error('Erro ao restaurar configurações:', error);
                this.showMessage('Erro ao restaurar configurações', 'error');
            }
        }
    }

    async clearData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Isso não pode ser desfeito.')) {
            try {
                await chrome.storage.local.clear();
                
                // Recarrega as configurações padrão
                await chrome.storage.local.set({
                    settings: this.defaultSettings,
                    stats: { itemsAnalyzed: 0, lastAnalysis: null }
                });
                
                this.updateUI(this.defaultSettings);
                await this.loadStats();
                
                this.showMessage('Dados limpos com sucesso!', 'success');
                
            } catch (error) {
                console.error('Erro ao limpar dados:', error);
                this.showMessage('Erro ao limpar dados', 'error');
            }
        }
    }

    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('message');
        
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 3000);
    }

    // Função para formatar números
    formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    // Função para formatar datas
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Inicializa o gerenciador de configurações quando o DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
}); 