# Ícones da Extensão

## Como gerar os ícones

1. **Use o arquivo SVG como base**: `icon.svg`
2. **Converta para PNG** nos seguintes tamanhos:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels) 
   - `icon128.png` (128x128 pixels)

## Ferramentas recomendadas

### Online
- **Convertio**: https://convertio.co/svg-png/
- **CloudConvert**: https://cloudconvert.com/svg-to-png

### Desktop
- **Inkscape** (gratuito)
- **Adobe Illustrator**
- **GIMP** (gratuito)

### Comando (se tiver ImageMagick instalado)
```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Design do ícone

O ícone representa:
- **Moeda dourada** (ƶ) no centro
- **Gradiente roxo/azul** de fundo
- **Linha de gráfico** verde representando mercado
- **Tag de preço** verde
- **Moedas pequenas** nos cantos

## Cores utilizadas

- **Fundo**: Gradiente #667eea → #764ba2
- **Moeda**: Gradiente #fbbf24 → #f59e0b  
- **Gráfico**: #4ade80
- **Tag**: #4ade80
- **Bordas**: #ffffff 