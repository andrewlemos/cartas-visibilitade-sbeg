/**
 * Dados da Carta de Visibilidade de SBEG (Eduardo Gomes - Manaus).
 * Embutidos no bundle para que o plugin funcione sem requisições externas.
 * Origem: sbeg.kml (centro com deslocamento de 25 m ao sul e 14 m a leste) e planilha "Pontos de Referência SBEG - Geolocalização".
 */

export interface RefPoint {
    /** Número do ponto na carta (1, 2, 3...). */
    id: number;
    name: string;
    lat: number;
    lng: number;
    /** Altura do ponto, em metros (conforme planilha de referência). */
    heightM: number;
    /** Distância, em metros (conforme planilha de referência). */
    distanceM: number;
    /** Azimute no formato graus/minutos/segundos. */
    azimuth: string;
}

/** Centro dos anéis (torre TWR ajustada) [lat, lng]. */
export const CENTER: [number, number] = [-3.03122458, -60.04187406];

/** Raios dos anéis, em metros. */
export const RING_RADII_M: number[] = [
    200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000,
    4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000,
];

/** Anéis destacados em vermelho. */
export const EMPHASIS_RADII_M: number[] = [8000, 16000];

/** Pontos de referência aeronáutica até 2 km (SBEG-001). */
export const POINTS_2KM: RefPoint[] = [
    { id: 1, name: "GRUPO DE ANTENAS", lat: -3.0271238, lng: -60.0366, heightM: 18.51, distanceM: 784, azimuth: "52° 46' 37\"" },
    { id: 2, name: "GALPÃO APUÍ", lat: -3.0328308, lng: -60.0374277, heightM: -25.55, distanceM: 556, azimuth: "106° 45' 38\"" },
    { id: 3, name: "KT DO LOCALIZER", lat: -3.0380203, lng: -60.0347623, heightM: -33.1, distanceM: 1109, azimuth: "131° 40' 30\"" },
    { id: 4, name: "TANQUE DE COMBUSTÍVEL", lat: -3.0347517, lng: -60.0415187, heightM: -25.44, distanceM: 382, azimuth: "168° 12' 02\"" },
    { id: 5, name: "SEÇÃO CONTRA INCÊNDIO", lat: -3.0414371, lng: -60.0510043, heightM: -17.23, distanceM: 1483, azimuth: "221° 06' 47\"" },
    { id: 6, name: "NDB", lat: -3.0418929, lng: -60.052731, heightM: 19.15, distanceM: 1651, azimuth: "224° 58' 21\"" },
    { id: 7, name: "DVOR", lat: -3.0401263, lng: -60.0554279, heightM: -28.48, distanceM: 1759, azimuth: "236° 28' 20\"" },
    { id: 8, name: "CAIXA D'ÁGUA TPS1", lat: -3.032168, lng: -60.046657, heightM: -9.49, distanceM: 500, azimuth: "260° 01' 18\"" },
    { id: 9, name: "HOLOFOTE", lat: -3.0323875, lng: -60.0481818, heightM: 0.5, distanceM: 671, azimuth: "260° 28' 29\"" },
    { id: 10, name: "GUARITA VERDE", lat: -3.0310563, lng: -60.0491126, heightM: -26.58, distanceM: 766, azimuth: "272° 46' 02\"" },
    { id: 11, name: "GUARITA ESTACIONAMENTO", lat: -3.0304424, lng: -60.0494097, heightM: -26.05, distanceM: 805, azimuth: "277° 30' 44\"" },
    { id: 12, name: "SUPERINTENDÊNCIA", lat: -3.0292827, lng: -60.0477118, heightM: -14.31, distanceM: 653, azimuth: "291° 01' 03\"" },
    { id: 13, name: "CINDACTA IV", lat: -3.0238447, lng: -60.0547979, heightM: -7.3, distanceM: 1629, azimuth: "300° 59' 41\"" },
    { id: 14, name: "FAROL ROTATIVO", lat: -3.0290554, lng: -60.0448323, heightM: -3.18, distanceM: 389, azimuth: "311° 50' 17\"" },
    { id: 15, name: "RADAR TOPO", lat: -3.028153, lng: -60.0439924, heightM: 11.72, distanceM: 410, azimuth: "331° 21' 10\"" }
];

/** Pontos de referência aeronáutica até 20 km (SBEG-002). */
export const POINTS_20KM: RefPoint[] = [
    { id: 1, name: "GALPÃO BRANCO", lat: -3.0130989, lng: -60.038515, heightM: -27.08, distanceM: 2075, azimuth: "11° 26' 34\"" },
    { id: 2, name: "CAIXA D'ÁGUA DUAS FAIXAS", lat: -3.0135201, lng: -60.0294834, heightM: 8.84, distanceM: 2439, azimuth: "35° 26' 53\"" },
    { id: 3, name: "CAIXA VERDE", lat: -3.0038007, lng: -59.9820117, heightM: 7.37, distanceM: 7356, azimuth: "65° 21' 16\"" },
    { id: 4, name: "CAIXA D'ÁGUA 3 FAIXAS", lat: -3.025627, lng: -60.0200313, heightM: 30.18, distanceM: 2546, azimuth: "75° 25' 32\"" },
    { id: 5, name: "ANTENA VERMELHA E BRANCA", lat: -3.0347628, lng: -60.0026595, heightM: 29.34, distanceM: 4409, azimuth: "94° 52' 56\"" },
    { id: 6, name: "GALPÃO CINZA UNIVERSAL ELECTRONICS", lat: -3.0372271, lng: -60.0231314, heightM: -23.24, distanceM: 2217, azimuth: "107° 01' 38\"" },
    { id: 7, name: "CAIXA D'ÁGUA TPV", lat: -3.0522268, lng: -60.024402, heightM: 22.05, distanceM: 3047, azimuth: "139° 30' 14\"" },
    { id: 8, name: "EDIFÍCIOS", lat: -3.0988223, lng: -59.9962957, heightM: 25.16, distanceM: 9068, azimuth: "145° 46' 55\"" },
    { id: 9, name: "CAIXA D'ÁGUA", lat: -3.069838, lng: -60.0515111, heightM: -3.93, distanceM: 4398, azimuth: "193° 33' 47\"" },
    { id: 10, name: "PONTE RIO NEGRO", lat: -3.1189976, lng: -60.079488, heightM: 71.39, distanceM: 10584, azimuth: "203° 00' 45\"" },
    { id: 11, name: "ANTENA", lat: -3.0533506, lng: -60.0808539, heightM: 31.37, distanceM: 4936, azimuth: "240° 20' 47\"" },
    { id: 12, name: "ANTENA", lat: -3.0526529, lng: -60.0807913, heightM: 30.69, distanceM: 4892, azimuth: "241° 05' 45\"" },
    { id: 13, name: "ANTENA", lat: -3.033453, lng: -60.0876456, heightM: 16.02, distanceM: 5049, azimuth: "267° 23' 36\"" },
    { id: 14, name: "ANTENA", lat: -3.0309109, lng: -60.0702622, heightM: 14.04, distanceM: 3114, azimuth: "270° 58' 38\"" }
];
