<script lang="ts">
  import type { EmbedConfig, EmbedColors, EmbedFeature, StatKey } from '../../../../../../api';
  import ArrowUp from 'carbon-icons-svelte/lib/ArrowUp.svelte';
  import ArrowDown from 'carbon-icons-svelte/lib/ArrowDown.svelte';
  import {
    ALL_STAT_KEYS,
    COLOR_FIELDS,
    DEFAULT_COLORS,
    SIMPLE_FEATURES,
    STAT_LABELS,
  } from './embedMeta';

  export let config: EmbedConfig;
  export let onConfigChange: (next: EmbedConfig) => void;
  // the rainbow effect only applies to full-streak users, so only surface its toggle for them
  export let isFullStreak: boolean;

  const update = (patch: Partial<EmbedConfig>) => onConfigChange({ ...config, ...patch });

  // ---- feature ----
  // the panel picker collapses the discriminated `EmbedFeature` to a flat kind (the hero variant's
  // chosen stat is tracked separately in `heroStat`)
  type FeatureKind = Exclude<EmbedFeature, object> | 'hero_stat';

  $: featureIsHero = typeof config.feature === 'object';
  $: featureKind = (featureIsHero ? 'hero_stat' : config.feature) as FeatureKind;
  $: heroStat = (featureIsHero ? (config.feature as { hero_stat: StatKey }).hero_stat : 'global_rank') as StatKey;

  const setFeatureKind = (kind: FeatureKind) => {
    if (kind === 'hero_stat') {
      update({ feature: { hero_stat: heroStat } });
    } else {
      update({ feature: kind });
    }
  };
  const setHeroStat = (stat: StatKey) => update({ feature: { hero_stat: stat } });

  // ---- stats list ----
  $: enabledStats = config.stats;
  $: availableStats = ALL_STAT_KEYS.filter(k => !config.stats.includes(k));

  const toggleStat = (key: StatKey) => {
    if (config.stats.includes(key)) {
      update({ stats: config.stats.filter(k => k !== key) });
    } else {
      update({ stats: [...config.stats, key] });
    }
  };
  const moveStat = (index: number, dir: -1 | 1) => {
    const next = [...config.stats];
    const target = index + dir;
    if (target < 0 || target >= next.length) {
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    update({ stats: next });
  };

  // ---- colors ----
  const setColor = (key: keyof EmbedColors, value: string) =>
    update({ colors: { ...config.colors, [key]: value } });
  const resetColors = () => update({ colors: { ...DEFAULT_COLORS } });

  const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
</script>

<div class="controls">
  <section>
    <h4>Feature Panel</h4>
    <div class="radio-row">
      {#each SIMPLE_FEATURES as f (f.value)}
        <label class="chip" class:active={featureKind === f.value}>
          <input
            type="radio"
            name="feature"
            checked={featureKind === f.value}
            on:change={() => setFeatureKind(f.value)}
          />
          {f.label}
        </label>
      {/each}
      <label class="chip" class:active={featureKind === 'hero_stat'}>
        <input
          type="radio"
          name="feature"
          checked={featureKind === 'hero_stat'}
          on:change={() => setFeatureKind('hero_stat')}
        />
        Featured Stat
      </label>
    </div>
    {#if featureKind === 'hero_stat'}
      <select
        class="select"
        value={heroStat}
        on:change={e => setHeroStat(e.currentTarget.value as StatKey)}
      >
        {#each ALL_STAT_KEYS as key (key)}
          <option value={key}>{STAT_LABELS[key]}</option>
        {/each}
      </select>
    {/if}
  </section>

  <section>
    <h4>Stats</h4>
    <ul class="stat-list">
      {#each enabledStats as key, i (key)}
        <li class="stat-row enabled">
          <label class="stat-label">
            <input type="checkbox" checked on:change={() => toggleStat(key)} />
            {STAT_LABELS[key]}
          </label>
          <div class="reorder">
            <button
              type="button"
              class="icon-btn"
              title="Move up"
              disabled={i === 0}
              on:click={() => moveStat(i, -1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              class="icon-btn"
              title="Move down"
              disabled={i === enabledStats.length - 1}
              on:click={() => moveStat(i, 1)}
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </li>
      {/each}
      {#if availableStats.length > 0}
        <li class="divider" aria-hidden="true"></li>
      {/if}
      {#each availableStats as key (key)}
        <li class="stat-row">
          <label class="stat-label">
            <input type="checkbox" on:change={() => toggleStat(key)} />
            <span class="muted-strong">{STAT_LABELS[key]}</span>
          </label>
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <div class="section-head">
      <h4>Colors</h4>
      <button type="button" class="text-btn" on:click={resetColors}>Reset</button>
    </div>
    <div class="color-grid">
      {#each COLOR_FIELDS as field (field.key)}
        <div class="color-row">
          <span class="color-label">{field.label}</span>
          <input
            type="color"
            value={config.colors[field.key]}
            on:input={e => setColor(field.key, e.currentTarget.value)}
          />
          <input
            type="text"
            class="hex-input"
            class:invalid={!isHex(config.colors[field.key])}
            value={config.colors[field.key]}
            spellcheck="false"
            on:change={e => setColor(field.key, e.currentTarget.value.trim())}
          />
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h4>Options</h4>
    <div class="toggles">
      {#if isFullStreak}
        <label class="toggle">
          <input
            type="checkbox"
            checked={config.rainbow_full_streak}
            on:change={e => update({ rainbow_full_streak: e.currentTarget.checked })}
          />
          Rainbow on full streak
        </label>
      {/if}
      <label class="toggle">
        <input
          type="checkbox"
          checked={config.show_avatar}
          on:change={e => update({ show_avatar: e.currentTarget.checked })}
        />
        Show avatar
      </label>
      <label class="toggle">
        <input
          type="checkbox"
          checked={config.show_header}
          on:change={e => update({ show_header: e.currentTarget.checked })}
        />
        Show header
      </label>
    </div>
    <div class="size-row">
      <span class="color-label">Image size</span>
      <select
        class="select size-select"
        value={String(config.scale ?? 2)}
        on:change={e => update({ scale: Number(e.currentTarget.value) })}
      >
        <option value="1">1× (compact)</option>
        <option value="2">2× (recommended)</option>
        <option value="3">3× (large)</option>
      </select>
    </div>
  </section>
</div>

<style lang="css">
  .controls {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  h4 {
    font-size: 17px;
    font-weight: 500;
    margin: 0;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .muted-strong {
    color: hsl(0, 0%, 70%);
  }

  .radio-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid hsl(200, 10%, 22%);
    background: hsl(200, 10%, 13%);
    cursor: pointer;
    font-size: 14px;
    user-select: none;
  }

  .chip.active {
    border-color: #02b5c3;
    background: hsl(187, 96%, 12%);
  }

  .chip input {
    accent-color: #02b5c3;
  }

  .select {
    background: hsl(200, 10%, 13%);
    color: hsl(0, 0%, 90%);
    border: 1px solid hsl(200, 10%, 22%);
    padding: 6px 8px;
    font-size: 14px;
  }

  .stat-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px;
  }

  .stat-row.enabled {
    background: hsl(200, 10%, 12%);
  }

  .stat-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 15px;
  }

  .stat-label input {
    accent-color: #02b5c3;
    width: 16px;
    height: 16px;
  }

  .divider {
    height: 1px;
    background: hsl(200, 10%, 18%);
    margin: 8px 0;
  }

  .reorder {
    display: flex;
    gap: 2px;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid hsl(200, 10%, 22%);
    background: hsl(200, 10%, 16%);
    color: hsl(0, 0%, 85%);
    cursor: pointer;
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .text-btn {
    background: none;
    border: none;
    color: #02b5c3;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
  }

  .color-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-label {
    flex: 1;
    font-size: 15px;
  }

  input[type='color'] {
    width: 36px;
    height: 28px;
    padding: 0;
    border: 1px solid hsl(200, 10%, 22%);
    background: none;
    cursor: pointer;
  }

  .hex-input {
    width: 92px;
    background: hsl(200, 10%, 13%);
    color: hsl(0, 0%, 90%);
    border: 1px solid hsl(200, 10%, 22%);
    padding: 5px 6px;
    font-family: monospace;
    font-size: 14px;
  }

  .hex-input.invalid {
    border-color: #ff5a5a;
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 15px;
  }

  .toggle input {
    accent-color: #02b5c3;
    width: 16px;
    height: 16px;
  }

  .size-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }
</style>
