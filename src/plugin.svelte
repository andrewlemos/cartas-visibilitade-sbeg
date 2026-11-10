<div class="plugin__mobile-header">
    {title}
</div>
<section class="plugin__content sbeg">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={() => bcast.emit('rqstOpen', 'menu')}
    >
        {title}
    </div>

    <header class="hero">
        <div class="hero__icon">🛫</div>
        <div class="hero__text">
            <div class="hero__title">Aeroporto Eduardo Gomes</div>
            <div class="hero__subtitle">SBEG · Manaus (AM)</div>
        </div>
    </header>

    <p class="intro">
        Anéis de distância de 200 m a 20 km a partir da torre e {POINTS_2KM.length + POINTS_20KM.length}
        pontos de referência aeronáutica. Toque em um ponto para ver altura, distância e azimute.
    </p>

    <div class="section-label">Camadas</div>
    <div class="card">
        <label class="row">
            <span class="row__mark" style="background:{COLOR_BLUE}"></span>
            <span class="row__text">
                <span class="row__title">Anéis de 200 m a 2 km</span>
                <span class="row__sub">Visibilidade próxima</span>
            </span>
            <input class="switch" type="checkbox" bind:checked={show.blue} />
        </label>
        <label class="row">
            <span class="row__mark" style="background:{COLOR_ORANGE}"></span>
            <span class="row__text">
                <span class="row__title">Anéis de 4 km a 20 km</span>
                <span class="row__sub">8 km e 16 km em vermelho</span>
            </span>
            <input class="switch" type="checkbox" bind:checked={show.orange} />
        </label>
        <label class="row">
            <span class="row__mark row__mark--dot" style="background:{COLOR_BLUE}"></span>
            <span class="row__text">
                <span class="row__title">Referências até 2 km</span>
                <span class="row__sub">SBEG-001 · {POINTS_2KM.length} pontos</span>
            </span>
            <input class="switch" type="checkbox" bind:checked={show.points2km} />
        </label>
        <label class="row">
            <span class="row__mark row__mark--dot" style="background:{COLOR_RED}"></span>
            <span class="row__text">
                <span class="row__title">Referências até 20 km</span>
                <span class="row__sub">SBEG-002 · {POINTS_20KM.length} pontos</span>
            </span>
            <input class="switch" type="checkbox" bind:checked={show.points20km} />
        </label>
    </div>

    <button type="button" class="btn" on:click={centerMap}>◎ Centralizar em SBEG</button>

    <div class="section-label">Pontos de referência</div>
    <div class="tabs">
        <button
            type="button"
            class="tab"
            class:tab--active={activeTab === '2km'}
            on:click={() => (activeTab = '2km')}
        >
            Até 2 km <span class="tab__count">{POINTS_2KM.length}</span>
        </button>
        <button
            type="button"
            class="tab"
            class:tab--active={activeTab === '20km'}
            on:click={() => (activeTab = '20km')}
        >
            Até 20 km <span class="tab__count">{POINTS_20KM.length}</span>
        </button>
    </div>

    <div class="list">
        {#each activePoints as p (activeTab + p.id)}
            <button type="button" class="item" on:click={() => focusPoint(activeTab, p)}>
                <span
                    class="item__badge"
                    style="background:{activeTab === '2km' ? COLOR_BLUE : COLOR_RED}">{p.id}</span
                >
                <span class="item__text">
                    <span class="item__name">{p.name}</span>
                    <span class="item__meta">{formatDistance(p.distanceM)} · {p.azimuth}</span>
                </span>
            </button>
        {/each}
    </div>

    <footer class="footer">Centro dos anéis: 3,03122458°S / 60,04187406°W</footer>
</section>

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import bcast from '@windy/broadcast';
    import { map } from '@windy/map';
    import config from './pluginConfig';

    import { CENTER, RING_RADII_M, EMPHASIS_RADII_M, POINTS_2KM, POINTS_20KM } from './data';
    import type { RefPoint } from './data';
    import { circlePoints, formatRadius, formatDistance, formatNumber, escapeHtml } from './geo';

    const { title } = config;

    const COLOR_BLUE = '#00aaff';
    const COLOR_ORANGE = '#ff9900';
    const COLOR_RED = '#ff0000';
    const DEFAULT_ZOOM = 12;
    const FOCUS_ZOOM = 15;

    type PointGroup = '2km' | '20km';

    let show = { blue: true, orange: true, points2km: true, points20km: true };
    let activeTab: PointGroup = '2km';

    $: activePoints = activeTab === '2km' ? POINTS_2KM : POINTS_20KM;

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
    .sbeg {
        --line: rgba(128, 128, 128, 0.28);
        --fill: rgba(128, 128, 128, 0.12);
        --fill-hover: rgba(128, 128, 128, 0.22);
        --accent: #2f8cff;

        font-size: 13px;
        line-height: 1.4;
        color: inherit;
        padding-bottom: 8px;

        button {
            font-family: inherit;
            color: inherit;
        }
    }

    .hero {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        &__icon {
            flex: none;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #2f8cff, #1459c7);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        &__title {
            font-size: 17px;
            font-weight: 700;
            line-height: 1.2;
        }

        &__subtitle {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 2px;
        }
    }

    .intro {
        margin: 0 0 16px;
        font-size: 12.5px;
        opacity: 0.8;
    }

    .section-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.6;
        margin: 0 0 6px;
    }

    .card {
        border: 1px solid var(--line);
        border-radius: 10px;
        margin-bottom: 12px;
        overflow: hidden;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        cursor: pointer;

        & + & {
            border-top: 1px solid var(--line);
        }

        &:hover {
            background: var(--fill);
        }

        &__mark {
            flex: none;
            width: 20px;
            height: 4px;
            border-radius: 2px;

            &--dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
        }

        &__text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }

        &__title {
            font-weight: 600;
        }

        &__sub {
            font-size: 11.5px;
            opacity: 0.6;
        }
    }

    .switch {
        appearance: none;
        -webkit-appearance: none;
        flex: none;
        position: relative;
        width: 36px;
        height: 20px;
        margin: 0;
        border-radius: 10px;
        background: rgba(128, 128, 128, 0.45);
        cursor: pointer;
        transition: background 0.15s;

        &::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            transition: transform 0.15s;
        }

        &:checked {
            background: var(--accent);

            &::after {
                transform: translateX(16px);
            }
        }
    }

    .btn {
        display: block;
        width: 100%;
        padding: 9px 12px;
        margin-bottom: 18px;
        border: 0;
        border-radius: 8px;
        background: var(--accent);
        color: #fff !important;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
            filter: brightness(1.1);
        }
    }

    .tabs {
        display: flex;
        padding: 3px;
        gap: 3px;
        border-radius: 9px;
        background: var(--fill);
        margin-bottom: 8px;
    }

    .tab {
        flex: 1;
        padding: 6px 8px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0.7;

        &--active {
            background: var(--accent);
            color: #fff !important;
            opacity: 1;
        }

        &__count {
            display: inline-block;
            min-width: 18px;
            margin-left: 4px;
            padding: 0 5px;
            border-radius: 9px;
            background: rgba(128, 128, 128, 0.3);
            font-size: 11px;
        }

        &--active &__count {
            background: rgba(255, 255, 255, 0.3);
        }
    }

    .list {
        max-height: 250px;
        overflow-y: auto;
        border: 1px solid var(--line);
        border-radius: 10px;
    }

    .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 7px 10px;
        border: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;

        & + & {
            border-top: 1px solid var(--line);
        }

        &:hover {
            background: var(--fill-hover);
        }

        &__badge {
            flex: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11.5px;
            font-weight: 700;
            color: #fff;
        }

        &__text {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        &__name {
            font-weight: 600;
            font-size: 12.5px;
        }

        &__meta {
            font-size: 11.5px;
            opacity: 0.6;
        }
    }

    .footer {
        margin-top: 12px;
        font-size: 11px;
        opacity: 0.55;
        text-align: center;
    }
</style>
