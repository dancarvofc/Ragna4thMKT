# 🎮 Ragna4th Market Analyzer

Uma extensão do Chrome que analisa preços de itens no Ragna4th e sugere preços competitivos para maximizar suas vendas!

## ✨ Funcionalidades

- **Análise Automática**: Analisa automaticamente preços de itens nas páginas do Ragna4th
- **Preço Sugerido**: Calcula o preço ideal (1 zeny abaixo da concorrência)
- **Identificação de Vendedores**: Mostra os principais vendedores e seus preços
- **Copiar Preços**: Copia preços sugeridos com um clique
- **Modo Escuro**: Suporte completo ao modo escuro do site
- **Notificações**: Notificações quando análises são concluídas
- **Menu de Contexto**: Clique direito em links para análise rápida

## 🚀 Instalação

### Método 1: Instalação Manual (Recomendado)

1. **Baixe os arquivos**
   - Clone ou baixe este repositório
   - Extraia os arquivos em uma pasta

2. **Abra o Chrome**
   - Digite `chrome://extensions/` na barra de endereços
   - Ou vá em Menu → Mais ferramentas → Extensões

3. **Ative o Modo Desenvolvedor**
   - Clique no botão "Modo do desenvolvedor" no canto superior direito

4. **Carregue a Extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta com os arquivos da extensão
   - Clique em "Selecionar pasta"

5. **Pronto!**
   - A extensão será instalada e aparecerá na barra de ferramentas

### Método 2: Instalação via Chrome Web Store (Futuro)

*Em breve disponível na Chrome Web Store*

## 📖 Como Usar

### Análise de Item Individual

1. **Navegue para uma página de item**
   - Ex: `https://db.ragna4th.com/item/8009`

2. **A extensão analisará automaticamente**
   - Aguarde alguns segundos para o carregamento
   - A análise aparecerá no topo da página

3. **Veja os resultados**
   - Preços atuais do item
   - Preço sugerido para venda
   - Principais vendedores
   - Estatísticas de mercado

### Análise do Mercado

1. **Vá para a página do mercado**
   - `https://db.ragna4th.com/market`

2. **A extensão analisará todos os itens**
   - Mostrará preços sugeridos
   - Identificará vendedores ativos
   - Calculará estatísticas gerais

### Usando o Popup

1. **Clique no ícone da extensão**
   - Na barra de ferramentas do Chrome

2. **Use os botões**
   - **Analisar Página Atual**: Força uma nova análise
   - **Abrir Mercado**: Navega para o mercado
   - **Configurações**: Abre as configurações

### Menu de Contexto

1. **Clique direito em links de itens**
   - Selecione "Analisar Item Ragna4th"
   - A extensão abrirá a página do item automaticamente

## 🎯 Como Funciona

### Cálculo do Preço Sugerido

A extensão calcula o preço ideal usando a seguinte lógica:

1. **Identifica o menor preço atual** no mercado
2. **Subtrai 1 zeny** para ficar abaixo da concorrência
3. **Garante que o preço seja pelo menos 1 zeny** (mínimo)

### Análise de Vendedores

- **Conta quantos itens** cada vendedor tem
- **Identifica o menor preço** de cada vendedor
- **Ranking por quantidade** de itens vendidos
- **Mostra os top 5 vendedores** mais ativos

### Dados Analisados

- Preço menor disponível
- Menor preço de venda (30 dias)
- Maior preço de venda (30 dias)
- Número de vendas (30 dias)
- Total vendido (30 dias)
- Vendedores ativos e seus preços

## ⚙️ Configurações

### Análise Automática
- **Ativada por padrão**
- Analisa automaticamente quando você visita páginas do Ragna4th
- Pode ser desativada nas configurações

### Notificações
- **Ativadas por padrão**
- Mostra notificações quando análises são concluídas
- Pode ser desativada nas configurações

### Tema
- **Automático por padrão**
- Segue o tema do site (claro/escuro)
- Pode ser forçado para claro ou escuro

## 🔧 Solução de Problemas

### A extensão não aparece
1. Verifique se está no modo desenvolvedor
2. Recarregue a extensão
3. Verifique se todos os arquivos estão presentes

### Análise não funciona
1. Certifique-se de estar em uma página do Ragna4th
2. Aguarde o carregamento completo da página
3. Tente recarregar a página (F5)

### Preços não aparecem
1. Verifique se a página carregou completamente
2. Aguarde alguns segundos
3. Clique em "Analisar Página Atual" no popup

### Erro de permissões
1. Verifique se a extensão tem permissão para acessar o site
2. Recarregue a extensão
3. Verifique o console do navegador para erros

## 📁 Estrutura dos Arquivos

```
4thMarket/
├── manifest.json          # Configuração da extensão
├── content.js             # Script principal (análise)
├── popup.html             # Interface do popup
├── popup.js               # Funcionalidade do popup
├── background.js          # Service worker
├── styles.css             # Estilos da interface
├── icons/                 # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # Este arquivo
```

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas
- **JavaScript ES6+**: Lógica principal
- **Chrome Extensions API**: Integração com o navegador
- **CSS3**: Estilização moderna e responsiva
- **HTML5**: Interface do popup

### Como Contribuir
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Teste extensivamente
5. Envie um pull request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Suporte

Se você encontrar problemas ou tiver sugestões:

1. **Abra uma issue** no GitHub
2. **Descreva o problema** detalhadamente
3. **Inclua screenshots** se possível
4. **Mencione sua versão** do Chrome

## 🎉 Agradecimentos

- **Ragna4th**: Pela plataforma incrível
- **Comunidade**: Por feedback e sugestões
- **Chrome Extensions**: Pela documentação excelente

---

**Desenvolvido com ❤️ para a comunidade Ragna4th** 