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