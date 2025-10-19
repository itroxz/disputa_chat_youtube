# 🎯 Atualização: Título Personalizável

## ✨ Nova Funcionalidade

Agora você pode **personalizar o título da votação**!

### Como Usar

1. Abra o painel: **http://localhost:8080/config.html**

2. No topo do formulário, você verá:
   ```
   📢 Título da Votação:
   [_______________________________]
   ```

3. Digite o título que você quiser, por exemplo:
   - `MELHOR TIME DO BRASIL`
   - `PIZZA VS HAMBÚRGUER`
   - `🏆 QUEM VAI GANHAR? 🏆`
   - `QUAL SEU JOGO FAVORITO?`
   - `🎮 VALORANT VS LOL 🎮`

4. Clique em **"💾 Salvar Configuração"**

5. O overlay no OBS atualiza automaticamente!

### 📊 Exemplo de Resultado

**Antes:**
```
⚡ VOTAÇÃO ⚡
```

**Depois:**
```
🏆 MELHOR TIME DO BRASIL 🏆
```

### 💡 Dicas

- Use emojis para deixar mais visual: 🔥 ⚽ 🎮 🍕 🏆 ⚡
- Máximo de 50 caracteres
- Letras maiúsculas ficam mais legíveis no OBS
- O preview mostra como vai ficar antes de salvar

### 🎨 Preview em Tempo Real

O painel agora mostra um preview completo:
```
┌─────────────────────────────────┐
│    SEU TÍTULO PERSONALIZADO     │
├─────────────────────────────────┤
│  Opção 1 (palavra: time1)       │
│  Opção 2 (palavra: time2)       │
└─────────────────────────────────┘
```

Conforme você digita, o preview atualiza em tempo real!

### 📝 Exemplo Completo

**Configuração:**
```
Título: 🏆 MELHOR CLUBE DO BRASIL 🏆
Opção 1: "flamengo" → Flamengo (vermelho)
Opção 2: "palmeiras" → Palmeiras (verde)
```

**Resultado no OBS:**
```
╔═══════════════════════════════════╗
║  🏆 MELHOR CLUBE DO BRASIL 🏆   ║
╠═══════════════════════════════════╣
║  Flamengo    [████████] 60%  12  ║
║  Palmeiras   [█████] 40%      8  ║
║                                   ║
║      Total de Votos: 20          ║
╚═══════════════════════════════════╝
```

### ✅ Já Implementado

- ✅ Campo de título no painel de config
- ✅ Preview em tempo real
- ✅ Atualização automática no overlay
- ✅ Salva junto com outras configurações
- ✅ Limite de 50 caracteres
- ✅ Suporte a emojis

Agora seu sistema de votação está ainda mais personalizável! 🎉
