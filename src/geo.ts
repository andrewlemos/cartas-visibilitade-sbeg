const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Gera os vértices de um círculo geodésico (esfera) ao redor de `center`.
 * O primeiro e o último ponto coincidem (anel fechado), começando pelo norte.
 */
export function circlePoints(
    center: [number, number],
    radiusM: number,
    steps = 180,
): [number, number][] {
    const [lat0, lng0] = center;
    const φ1 = toRad(lat0);
    const λ1 = toRad(lng0);
    const δ = radiusM / EARTH_RADIUS_M;
    const points: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
        const θ = toRad((360 / steps) * i);
        const φ2 = Math.asin(
            Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
        );
        const λ2 =
            λ1 +
            Math.atan2(
                Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
                Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
            );
        points.push([toDeg(φ2), toDeg(λ2)]);
    }
    return points;
}

/** "200 m", "1,2 km", "20 km" */
export function formatRadius(radiusM: number): string {
    if (radiusM < 1000) {
        return `${radiusM} m`;
    }
    return `${(radiusM / 1000).toLocaleString('pt-BR')} km`;
}

/** 1759 -> "1.759 m"; valores a partir de 10 km viram "10,6 km". */
export function formatDistance(distanceM: number): string {
    if (distanceM >= 10000) {
        return `${(distanceM / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
    }
    return `${distanceM.toLocaleString('pt-BR')} m`;
}

/** Número com vírgula decimal e 2 casas: -25.55 -> "-25,55". */
export function formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}
