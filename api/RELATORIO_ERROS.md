# Relatório de Erros e Vulnerabilidades - API de Cores

Este documento detalha os problemas encontrados na API após uma bateria de testes automatizados e análise de código.

## 🚨 Erros Críticos (Crash/500)

### 1. Poluição de Parâmetros (Parameter Pollution)
**Endpoint Afetado**: Todos que recebem `?hex=`
**Descrição**: O envio de múltiplos parâmetros `hex` na mesma URL faz com que o servidor trave com Erro 500.
**Reprodução**: `GET /hex_para_rgb?hex=FFF&hex=000`
**Causa Técnica**: O Express converte múltiplos parâmetros em um Array (`['FFF', '000']`). O código espera uma String e tenta chamar `.toUpperCase()`, gerando exceção `TypeError: hex.toUpperCase is not a function`.

### 2. Bypass de Validação via Trailing Slash
**Endpoint Afetado**: Todos
**Descrição**: Adicionar uma barra (`/`) ao final da URL faz com que o middleware de validação seja ignorado.
**Reprodução**: `GET /hex_para_rgb/` (sem parâmetros)
**Causa Técnica**: A lógica de verificação da rota (`req.path.replace('/', '')`) falha para `/hex_para_rgb/` (resulta em `hex_para_rgb/`), que não consta na lista de rotas protegidas. Isso faz com que a variável `req.cleanHex` não seja inicializada, causando erro na execução da rota.

### 3. Bypass de Validação via Case Sensitivity
**Endpoint Afetado**: Todos
**Descrição**: Alterar a capitalização da rota (ex: `/Hex_Para_Rgb`) burla a validação.
**Reprodução**: `GET /Hex_Para_Rgb?hex=F00`
**Causa Técnica**: O Express roteia `/Hex_Para_Rgb` para `/hex_para_rgb` (case-insensitive), mas o middleware compara `req.path` de forma exata (case-sensitive) com a lista de permissões. A validação é pulada e a rota falha ao tentar acessar `req.cleanHex` (undefined).

## ⚠️ Problemas de Configuração e Segurança

### 4. Ausência de CORS (Cross-Origin Resource Sharing)
**Descrição**: A API não envia cabeçalhos CORS (`Access-Control-Allow-Origin`).
**Impacto**: Aplicações web (Front-end) hospedadas em domínios diferentes não conseguirão consumir esta API diretamente via navegador.

### 5. Dependência Não Utilizada
**Descrição**: O pacote `color-convert` está instalado (`package.json`) mas não é utilizado no código.
**Recomendação**: Remover para reduzir o tamanho do projeto e superfície de ataque.

## 📝 Sugestões de Melhoria no Código

- **Validação de Rota**: Em vez de verificar `req.path` manualmente com strings, aplicar o middleware diretamente nas rotas ou usar um roteador que agrupe as rotas que precisam de validação.
- **Tratamento de Erros**: Melhorar o `try/catch` global para não retornar apenas `success: false` genérico, mas sim códigos HTTP adequados (400 para Bad Request, 500 para Internal Error).
- **Sanitização**: Garantir que `req.query.hex` seja tratado como string, pegando apenas o primeiro valor se for um array.

---
**Data do Relatório**: 25/11/2025
**Status**: Pendente de Correção
