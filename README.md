# 🎨 API de Análise e Paletas de Cores (Node.js/Express)

Esta API foi desenvolvida como parte de um trabalho acadêmico (Etapa 1/3) para demonstrar a criação e publicação de uma API REST simples com 4 métodos, focada em manipulação de códigos de cores.

A API está publicada em produção na plataforma **Vercel** e pode ser testada publicamente.

## 🔗 Link de Produção

  * **URL Base da API:** `https://api-cores-node-bu6d.onrender.com/docs`

## 📚 Documentação da API

Todos os endpoints utilizam o método `GET` e esperam o código de cor HEX no parâmetro de consulta `hex`.

### Rota Principal de Documentação

Para visualizar a documentação completa da API em formato JSON (igual aos exemplos abaixo), acesse a rota `/docs`.

| Rota | Método | Descrição |
| :--- | :--- | :--- |
| **`/docs`** | `GET` | Retorna a documentação completa dos endpoints disponíveis. |

-----

### 1\. Conversão HEX para RGB

| Rota | `/hex_para_rgb` |
| :--- | :--- |
| **Método** | `GET` |
| **Parâmetro** | `hex` (código HEX de 3 ou 6 dígitos) |
| **Exemplo de URL** | `https://api-cores-node.vercel.app/hex_para_rgb?hex=1E90FF` |
| **Descrição** | Converte o código HEX fornecido para o formato RGB. |

**Exemplo de Resposta:**

```json
{
  "success": true,
  "message": "Conversão de HEX para RGB realizada.",
  "data": {
    "hex": "#1E90FF",
    "rgb": "30, 144, 255",
    "rgb_array": [30, 144, 255]
  }
}
```

-----

### 2\. Calcular Cor Complementar

| Rota | `/calcular_complementar` |
| :--- | :--- |
| **Método** | `GET` |
| **Parâmetro** | `hex` (código HEX de 3 ou 6 dígitos) |
| **Exemplo de URL** | `https://api-cores-node.vercel.app/calcular_complementar?hex=FF0000` |
| **Descrição** | Calcula a cor complementar (inversa) de um código HEX. |

**Exemplo de Resposta:**

```json
{
  "success": true,
  "message": "Cor complementar calculada (usando RGB inverso).",
  "data": {
    "original_hex": "#FF0000",
    "complementar_hex": "#00FFFF",
    "complementar_rgb": "0, 255, 255"
  }
}
```

-----

### 3\. Gerar Paleta Triádica

| Rota | `/gerar_paleta_triadica` |
| :--- | :--- |
| **Método** | `GET` |
| **Parâmetro** | `hex` (código HEX de 3 ou 6 dígitos) |
| **Exemplo de URL** | `https://api-cores-node.vercel.app/gerar_paleta_triadica?hex=00FF00` |
| **Descrição** | Gera uma paleta de 3 cores (triádica) baseada no código HEX fornecido. |

**Exemplo de Resposta:**

```json
{
  "success": true,
  "message": "Paleta Triádica gerada (usando HSL manual).",
  "data": {
    "base_hex": "#00FF00",
    "paleta": [
      "#00FF00",
      "#0000FF",
      "#FF0000"
    ]
  }
}
```

-----

### 4\. Obter Nome da Cor

| Rota | `/obter_nome_cor` |
| :--- | :--- |
| **Método** | `GET` |
| **Parâmetro** | `hex` (código HEX de 3 ou 6 dígitos) |
| **Exemplo de URL** | `https://api-cores-node.vercel.app/obter_nome_cor?hex=4682B4` |
| **Descrição** | Busca um nome descritivo para o código HEX fornecido em uma lista interna. |

**Exemplo de Resposta:**

```json
{
  "success": true,
  "message": "Nome de cor encontrado na lista.",
  "data": {
    "hex": "#4682B4",
    "name": "Azul Aço (Steel Blue)"
  }
}
```