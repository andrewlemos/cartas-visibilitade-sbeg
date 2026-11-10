import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-sbeg-visibilidade',
    version: '7.0.0',
    title: 'SBEG - Carta de Visibilidade',
    icon: '🛫',
    description: 'Cartas de visibilidade do aeroporto Eduardo Gomes (SBEG) - Manaus',
    author: 'Andrew Lemos',
    desktopUI: 'rhpane',
    mobileUI: 'small',
    repository: 'https://github.com/andrewlemos/cartas-visibilitade-sbeg',
    routerPath: '/sbeg-visibilidade',
    private: false,
};

export default config;
