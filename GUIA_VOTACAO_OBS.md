# 🎮 Sistema de Votação para OBS - Guia Rápido

## 🚀 Instalação

```powershell
npm install
```

## 📺 Como Usar

### Passo 1: Iniciar o Servidor
```powershell
npm run server
```

Você verá:
```
╔═══════════════════════════════════════════════════════╗
║       🎮 SERVIDOR DE VOTAÇÃO EM TEMPO REAL          ║
╠═══════════════════════════════════════════════════════╣
║  📊 Painel Config: http://localhost:3000/config.html  ║
║  🎨 Overlay OBS:   http://localhost:3000/overlay.html ║
╚═══════════════════════════════════════════════════════╝
```

### Passo 2: Configurar Palavras-Chave

Abra no navegador: **http://localhost:3000/config.html**

Configure:
- **Opção 1**: Ex: `flamengo` → Nome: `Flamengo` → Cor: Vermelho
- **Opção 2**: Ex: `vasco` → Nome: `Vasco` → Cor: Branco
- Clique em **"💾 Salvar Configuração"**

### Passo 3: Adicionar no OBS

1. No OBS, clique com botão direito na lista de fontes
2. **Adicionar → Browser Source** (ou "Navegador")
3. Configure:
   - **URL**: `http://localhost:3000/overlay.html`
   - **Largura**: `600`
   - **Altura**: `400`
   - ✅ Marque: "Atualizar navegador quando a cena ficar ativa"
4. Clique em **OK**

### Passo 4: Iniciar o Scraper do YouTube

Em outro terminal:

```powershell
npm start
```

Ou modo headless (invisível):
```powershell
npm run test-headless
```

### Passo 5: Veja a Mágica Acontecer! ✨

Quando alguém escrever no chat do YouTube:
- `"Vai Flamengo!"` → +1 voto para Flamengo
- `"Vasco da Gama!"` → +1 voto para Vasco

O overlay no OBS atualiza **automaticamente em tempo real**!

## 📊 O que aparece no OBS?

```
╔═══════════════════════════════════════╗
║          ⚡ VOTAÇÃO ⚡               ║
╠═══════════════════════════════════════╣
║  Flamengo           [████████] 45    ║
║  Vasco              [████] 23        ║
║                                       ║
║        Total de Votos: 68            ║
╚═══════════════════════════════════════╝
```

Com:
- ✅ Barras de progresso animadas
- ✅ Porcentagens
- ✅ Cores personalizadas
- ✅ Efeito de brilho
- ✅ Animação quando aumenta

## 🎨 Visual do Overlay

- Fundo transparente (perfeito para OBS)
- Design moderno com sombras
- Barras coloridas com gradiente
- Animações suaves
- Números grandes e legíveis
- Indicador de conexão (bolinha verde)

## ⚙️ Customizar

### Mudar Tamanho no OBS
Ajuste Width/Height ao adicionar o Browser Source:
- Pequeno: 400x300
- Médio: 600x400 (padrão)
- Grande: 800x500

### Mudar Cores
Use o painel de configuração para escolher as cores de cada opção.

### Resetar Votos
No painel de config, clique em **"🔄 Resetar Votos"**

## 🔄 Fluxo Completo

```
YouTube Chat → Scraper → WebSocket → Servidor → Overlay OBS
     ↓           ↓           ↓          ↓           ↓
  mensagem    captura     envia     processa   atualiza
```

## 💡 Dicas

1. **Teste antes da live**: Deixe rodando alguns minutos para garantir
2. **Use palavras simples**: Fácil de detectar no chat
3. **Monitor duplo**: Deixe o painel de config em uma tela
4. **Reinicie entre votações**: Use "Resetar Votos"

## 🐛 Problemas Comuns

### Overlay não aparece no OBS
- Certifique-se que o servidor está rodando (`npm run server`)
- Verifique a URL: `http://localhost:3000/overlay.html`
- Teste a URL no navegador primeiro

### Votos não contam
- Verifique se o scraper está conectado (veja terminal do servidor)
- Confirme que as palavras-chave estão corretas
- Teste escrevendo você mesmo no chat do YouTube

### Overlay fica preto no OBS
- Espere alguns segundos para carregar
- Recarregue a fonte (botão direito → Atualizar)
- Verifique se o servidor não deu erro

## 📝 Comandos Úteis

```powershell
# Iniciar servidor de votação
npm run server

# Iniciar scraper (browser visível)
npm start

# Iniciar scraper (headless)
npm run test-headless

# Abrir painel de configuração
start http://localhost:3000/config.html

# Abrir overlay (testar)
start http://localhost:3000/overlay.html
```

## 🎯 Exemplos de Votação

### Times de Futebol
```
Opção 1: "brasil" → Brasil 🇧🇷
Opção 2: "argentina" → Argentina 🇦🇷
```

### Jogos
```
Opção 1: "lol" → League of Legends
Opção 2: "valorant" → Valorant
```

### Comida
```
Opção 1: "pizza" → Pizza 🍕
Opção 2: "hamburguer" → Hambúrguer 🍔
```

### Música
```
Opção 1: "rock" → Rock 🎸
Opção 2: "pop" → Pop 🎵
```

---

## ✨ Está Tudo Pronto!

Agora você tem um sistema profissional de votação em tempo real para suas transmissões! 🎉

**Bora testar?**

```powershell
npm run server
```

Depois abra: http://localhost:3000/config.html
