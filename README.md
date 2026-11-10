# SBEG - Carta de Visibilidade (plugin Windy)

Plugin do [Windy](https://www.windy.com) que desenha sobre o mapa a carta de visibilidade do
aeroporto Eduardo Gomes (SBEG) - Manaus:

- anéis concêntricos de 200 m a 2 km (azul) e de 4 km a 20 km (laranja; 8 km e 16 km em vermelho);
- torre TWR no centro dos anéis;
- pontos de referência aeronáutica até 2 km (SBEG-001) e até 20 km (SBEG-002);
- pontos numerados no mapa; ao clicar, mostram nome, carta, altura, distância e azimute;
- lista dos pontos no painel (clique para ir até o ponto), liga/desliga de cada grupo e botão para centralizar o mapa.

Todos os dados ficam embutidos no plugin (`src/data.ts`); não há requisições externas.

## Desenvolvimento

1. `npm install`
2. `npm start`
3. Abra <https://www.windy.com/developer-mode> e carregue <https://localhost:9999/plugin.js>

## Publicação

1. Crie o repositório no GitHub e envie estes arquivos.
2. Em *Settings → Secrets and variables → Actions*, crie o secret `WINDY_API_KEY`.
3. Em *Actions → publish-plugin*, clique em *Run workflow*.

## Estrutura

| Arquivo | Função |
| --- | --- |
| `src/plugin.svelte` | Interface e camadas do mapa |
| `src/pluginConfig.ts` | Configuração exigida pelo Windy |
| `src/data.ts` | Centro, raios e pontos de referência |
| `src/geo.ts` | Geração dos círculos geodésicos e utilitários |

Documentação: <https://docs.windy-plugins.com/>
