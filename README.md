# 🎮 Ragna4th Market Analyzer

**Analisa preços de itens no Ragna4th e sugere preços competitivos**

> 👨‍💻 Criado por: **Dan Marofa** ([@dancarvofc](https://github.com/dancarvofc))

## ✨ Funcionalidades

### 🎯 Análise Inteligente de Preços
- **Sugestões por Resistência**: Identifica preços com maior quantidade de itens e sugere valores competitivos
- **Média Ponderada**: Calcula preço médio considerando a quantidade de cada item
- **Faixa de Preços**: Mostra mínimo, máximo e total de itens disponíveis
- **Top Vendedores**: Lista os principais vendedores e suas quantidades

### 📊 Dados do Item
- **Menor Preço Disponível**: Preço mais baixo atualmente no mercado
- **Menor/Maior Preço de Venda**: Histórico de vendas dos últimos 30 dias
- **Número de Vendas**: Quantidade de vendas realizadas
- **Total Vendido**: Volume total de itens vendidos
- **Ícone do Item**: Exibição do ícone do item baseado no ID

### 🎨 Múltiplos Temas
- **Tema Claro**: Design moderno com tons de cinza
- **Tema Escuro**: Para quem prefere modo escuro
- **Tema Cinza**: Intermediário entre claro e escuro
- **Tema Kawaiidesu**: 🌸 Cores fofas e vibrantes em rosa e roxo
- **Tema Automático**: Detecta automaticamente o tema do site

### 📋 Funcionalidades de Cópia
- **Cópia Limpa**: Copia apenas números (sem formatação)
- **Feedback Visual**: Confirmação visual quando copia
- **Múltiplos Botões**: Copia preços individuais ou sugestões

## 🚀 Instalação

### Método 1: Instalação Manual
1. Baixe ou clone este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo desenvolvedor" (canto superior direito)
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto

### Método 2: Arquivo Compactado
1. Baixe o arquivo `.zip` da extensão
2. Extraia o conteúdo
3. Siga os passos 2-5 do método manual

## 📖 Como Usar

### 1. Acesse o Mercado
- Vá para [https://db.ragna4th.com/market](https://db.ragna4th.com/market)
- A extensão será ativada automaticamente

### 2. Pesquise um Item
- Digite o nome do item na barra de pesquisa
- A análise será atualizada automaticamente

### 3. Analise os Preços
- **Sugestões por Resistência**: Preços recomendados baseados na quantidade
- **Sugestão por Média**: Preço calculado a partir da média ponderada
- **Faixa de Preços**: Mínimo, máximo e total disponível

### 4. Copie Preços
- Clique em "📋 Copiar" para copiar apenas os números
- Use os preços copiados no jogo ou para suas análises

### 5. Configure o Tema
- Clique no ícone da extensão
- Escolha entre: Claro, Escuro, Cinza ou Automático

## 🔧 Configurações

### Temas Disponíveis
- **Claro**: Design limpo com fundo branco e tons de cinza
- **Escuro**: Modo escuro para reduzir fadiga visual
- **Cinza**: Tema intermediário com tons neutros
- **Automático**: Detecta o tema do site automaticamente

### Personalização
- A interface se adapta automaticamente ao tema escolhido
- Posicionamento inteligente na página
- Responsivo para dispositivos móveis

## 🧪 Testes

### Arquivo de Teste
Execute o arquivo `test.html` para verificar se todas as funcionalidades estão funcionando:

```bash
# Abra o arquivo test.html no navegador
open test.html
```

### Testes Automáticos
- ✅ Função de cópia (remove formatação)
- ✅ Detecção de tema
- ✅ Parsing de preços
- ✅ Renderização da interface

### Links de Teste
- [Página do Mercado](https://db.ragna4th.com/market)
- [Item Instance Stone (ID: 8030)](https://db.ragna4th.com/item/8030)
- [Mercado do Item 8030](https://db.ragna4th.com/market?item=8030)

### 🧪 Arquivos de Teste
- **`test-copy.html`**: Teste específico da função de cópia de preços
- **`test-icon.html`**: Teste da exibição de ícones de itens
- **`demo-kawaiidesu.html`**: Demonstração do tema kawaiidesu

## 🐛 Correções Implementadas

### ✅ Problemas Resolvidos
1. **Botão Copiar**: Agora funciona corretamente com event listeners em vez de onclick inline
2. **Cópia Limpa**: Copia apenas números, sem formatação (ƶ, pontos, vírgulas)
3. **Duplicatas**: Evita criação de múltiplas interfaces de análise
4. **Dados do Item**: Busca corretamente os dados da página específica do item
5. **Posicionamento**: Interface posicionada corretamente na página
6. **Feedback Visual**: Confirmação visual quando copia preços
7. **Debug**: Logs detalhados para identificar problemas
8. **Estatísticas**: Extração melhorada de número de vendas e total vendido
9. **Tema Kawaiidesu**: 🌸 Novo tema fofo com cores rosa e roxas

### 🔄 Melhorias Adicionadas
- **Event Listeners**: Uso de event listeners em vez de onclick inline
- **Data Attributes**: Preços armazenados em data attributes para melhor performance
- **Fallback Robusto**: Múltiplos métodos de cópia para compatibilidade
- **Extração de Dados**: Método duplo para extrair dados do item (por título e por índice)
- **Arquivo de Teste**: `test-copy.html` para testar especificamente a função de cópia
- **Logs de Debug**: Console logs para identificar problemas de extração de dados
- **Ícone do Item**: Exibição automática do ícone do item baseado no ID
- **Cabeçalho Melhorado**: Layout flexível com ícone e título

### 🧪 Arquivos de Teste
- **test.html**: Teste geral das funcionalidades
- **test-copy.html**: Teste específico da função de cópia
- **Verificação de Área de Transferência**: Campo para colar e verificar se copiou corretamente

## 📁 Estrutura do Projeto

```
Ragna4thMKT/
├── manifest.json          # Configuração da extensão
├── content.js             # Script principal (análise de preços)
├── styles.css             # Estilos e temas
├── popup.html             # Interface do popup
├── popup.js               # Lógica do popup
├── options.html           # Página de configurações
├── options.js             # Lógica das configurações
├── background.js          # Script em background
├── test.html              # Página de testes
├── README.md              # Este arquivo
├── INSTALACAO.md          # Instruções de instalação
├── EXEMPLO.md             # Exemplos de uso
└── icons/                 # Ícones da extensão
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon.svg
```

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Dan Marofa** ([@dancarvofc](https://github.com/dancarvofc))

- 🌐 GitHub: [https://github.com/dancarvofc](https://github.com/dancarvofc)
- 🎮 Projeto: Ragna4th Market Analyzer

## 🙏 Agradecimentos

- Comunidade Ragna4th pela inspiração
- Contribuidores que testaram e reportaram bugs
- Todos que usam e apoiam a extensão

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!** 