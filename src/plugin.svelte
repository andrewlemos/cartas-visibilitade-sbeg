<section class="plugin__content">
    <div class="size-s mb-10">
        <b>Aeroporto Eduardo Gomes (SBEG)</b>
    </div>

    <label class="layer-toggle size-s mb-5">
        <input type="checkbox" bind:checked={show.blue} />
        <span class="swatch" style="background:{COLOR_BLUE}"></span>
        Anéis de 200 m a 2 km
    </label>
    <label class="layer-toggle size-s mb-5">
        <input type="checkbox" bind:checked={show.orange} />
        <span class="swatch" style="background:{COLOR_ORANGE}"></span>
        Anéis de 4 km a 20 km
    </label>
    <label class="layer-toggle size-s mb-5">
        <input type="checkbox" bind:checked={show.points2km} />
        <span class="swatch dot" style="background:{COLOR_BLUE}"></span>
        Referências até 2 km (SBEG-001)
    </label>
    <label class="layer-toggle size-s mb-10">
        <input type="checkbox" bind:checked={show.points20km} />
        <span class="swatch dot" style="background:{COLOR_RED}"></span>
        Referências até 20 km (SBEG-002)
    </label>

    <div class="button size-s mb-10" on:click={centerMap}>Centralizar em SBEG</div>

    <details class="mb-5">
        <summary class="size-s clickable">Lista até 2 km (SBEG-001)</summary>
        {#each POINTS_2KM as p}
            <div class="ref-item size-xs clickable" on:click={() => focusPoint('2km', p)}>
                <b>{p.id}</b> - {p.name}
                <span class="ref-meta">{formatDistance(p.distanceM)} / {p.azimuth}</span>
            </div>
        {/each}
    </details>

    <details class="mb-10">
        <summary class="size-s clickable">Lista até 20 km (SBEG-002)</summary>
        {#each POINTS_20KM as p}
            <div class="ref-item size-xs clickable" on:click={() => focusPoint('20km', p)}>
                <b>{p.id}</b> - {p.name}
                <span class="ref-meta">{formatDistance(p.distanceM)} / {p.azimuth}</span>
            </div>
        {/each}
    </details>

    <small class="size-xxs info">
        Centro: 3,03122458°S / 60,04187406°W<br />
        Anéis de 8 km e 16 km destacados em vermelho.<br />
        Clique em um ponto no mapa para ver seus detalhes.
    </small>
</section>

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { map } from '@windy/map';

    import { CENTER, RING_RADII_M, EMPHASIS_RADII_M, POINTS_2KM, POINTS_20KM } from './data';
    import type { RefPoint } from './data';
    import { circlePoints, formatRadius, formatDistance, formatNumber, escapeHtml } from './geo';

    const COLOR_BLUE = '#00aaff';
    const COLOR_ORANGE = '#ff9900';
    const COLOR_RED = '#ff0000';
    const DEFAULT_ZOOM = 12;
    const FOCUS_ZOOM = 15;

    type PointGroup = '2km' | '20km';

    let show = { blue: true, orange: true, points2km: true, points20km: true };

    const layers = {
        blue: new L.LayerGroup(),
        orange: new L.LayerGroup(),
        points2km: new L.LayerGroup(),
        points20km: new L.LayerGroup(),
    };

    const markers = new Map<string, L.Marker>();

    function buildRings() {
        for (const radius of RING_RADII_M) {
            const emphasis = EMPHASIS_RADII_M.includes(radius);
            const isBlue = radius <= 2000;
            const label = `Raio de ${formatRadius(radius)}`;

            const ring = new L.Polyline(circlePoints(CENTER, radius), {
                color: emphasis ? COLOR_RED : isBlue ? COLOR_BLUE : COLOR_ORANGE,
                weight: emphasis ? 4 : 1.5,
                opacity: 1,
                interactive: true,
            }).bindPopup(`<strong>${label}</strong>`);

            (isBlue ? layers.blue : layers.orange).addLayer(ring);
        }
    }

    function pointIcon(id: number, color: string) {
        return L.divIcon({
            className: '',
            html:
                `<div style="width:22px;height:22px;border-radius:50%;background:${color};` +
                `border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,.6);color:#fff;` +
                `font:bold 11px/18px system-ui,sans-serif;text-align:center;">${id}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
        });
    }

    function popupHtml(p: RefPoint, charta: string) {
        return (
            `<strong>${p.id} - ${escapeHtml(p.name)}</strong><br>` +
            `Carta: ${charta}<br>` +
            `Altura: ${formatNumber(p.heightM)} m<br>` +
            `Distância: ${formatDistance(p.distanceM)}<br>` +
            `Azimute: ${escapeHtml(p.azimuth)}`
        );
    }

    function buildPoints(points: RefPoint[], group: PointGroup) {
        const color = group === '2km' ? COLOR_BLUE : COLOR_RED;
        const charta = group === '2km' ? 'Até 2 km (SBEG-001)' : 'Até 20 km (SBEG-002)';
        const layer = group === '2km' ? layers.points2km : layers.points20km;

        for (const p of points) {
            const marker = new L.Marker([p.lat, p.lng], { icon: pointIcon(p.id, color) })
                .bindTooltip(`${p.id} - ${escapeHtml(p.name)}`)
                .bindPopup(popupHtml(p, charta));

            markers.set(`${group}-${p.id}`, marker);
            layer.addLayer(marker);
        }
    }

    function buildTower() {
        const tower = new L.CircleMarker(CENTER, {
            radius: 8,
            color: '#000000',
            weight: 2,
            fillColor: '#ffffff',
            fillOpacity: 1,
        }).bindPopup('<strong>TORRE TWR (SBEG)</strong>');

        layers.blue.addLayer(tower);
    }

    function focusPoint(group: PointGroup, p: RefPoint) {
        // Garante que o grupo esteja visível antes de abrir o ponto.
        if (group === '2km') show.points2km = true;
        else show.points20km = true;
        syncLayer(group === '2km' ? layers.points2km : layers.points20km, true);

        map.setView([p.lat, p.lng], group === '2km' ? FOCUS_ZOOM : DEFAULT_ZOOM);
        markers.get(`${group}-${p.id}`)?.openPopup();
    }

    function syncLayer(layer: L.LayerGroup, visible: boolean) {
        if (visible && !map.hasLayer(layer)) {
            map.addLayer(layer);
        } else if (!visible && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }

    $: syncLayer(layers.blue, show.blue);
    $: syncLayer(layers.orange, show.orange);
    $: syncLayer(layers.points2km, show.points2km);
    $: syncLayer(layers.points20km, show.points20km);

    function centerMap() {
        map.setView(CENTER, DEFAULT_ZOOM);
    }

    onMount(() => {
        buildRings();
        buildTower();
        buildPoints(POINTS_2KM, '2km');
        buildPoints(POINTS_20KM, '20km');
        centerMap();
    });

    onDestroy(() => {
        Object.values(layers).forEach(layer => layer.remove());
        markers.clear();
    });
</script>

<style lang="less">
    .layer-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .swatch {
        display: inline-block;
        width: 18px;
        height: 4px;
        border-radius: 2px;

        &.dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
    }

    details {
        max-height: 220px;
        overflow-y: auto;
    }

    .ref-item {
        padding: 4px 0 4px 8px;
        line-height: 1.4;
    }

    .ref-meta {
        display: block;
        opacity: 0.6;
    }

    .info {
        display: block;
        line-height: 1.5;
        opacity: 0.7;
    }
</style>
