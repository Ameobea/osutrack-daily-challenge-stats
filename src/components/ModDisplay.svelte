<script lang="ts" context="module">
  enum ModCategoryColor {
    DiffIncrease = '#fe6465',
    DiffReduction = '#b2ff66',
    Conversion = '#8c66ff',
    Fun = '#ff66ab',
    Automation = '#66ccff',
  }

  const ModColorByAcronym: Record<string, string> = {
    DT: ModCategoryColor.DiffIncrease,
    NC: ModCategoryColor.DiffIncrease,
    HD: ModCategoryColor.DiffIncrease,
    AC: ModCategoryColor.DiffIncrease,
    HR: ModCategoryColor.DiffIncrease,
    PF: ModCategoryColor.DiffIncrease,
    SD: ModCategoryColor.DiffIncrease,
    FL: ModCategoryColor.DiffIncrease,
    BL: ModCategoryColor.DiffIncrease,
    ST: ModCategoryColor.DiffIncrease,
    EZ: ModCategoryColor.DiffReduction,
    HT: ModCategoryColor.DiffReduction,
    DC: ModCategoryColor.DiffReduction,
    NF: ModCategoryColor.DiffReduction,
    TP: ModCategoryColor.Conversion,
    DA: ModCategoryColor.Conversion,
    CL: ModCategoryColor.Conversion,
    RD: ModCategoryColor.Conversion,
    MR: ModCategoryColor.Conversion,
    AL: ModCategoryColor.Conversion,
    SG: ModCategoryColor.Conversion,
    TR: ModCategoryColor.Fun,
    WG: ModCategoryColor.Fun,
    SI: ModCategoryColor.Fun,
    BR: ModCategoryColor.Fun,
    TC: ModCategoryColor.Fun,
    AD: ModCategoryColor.Fun,
    WU: ModCategoryColor.Fun,
    WD: ModCategoryColor.Fun,
    DF: ModCategoryColor.Fun,
    GR: ModCategoryColor.Fun,
    MU: ModCategoryColor.Fun,
    NS: ModCategoryColor.Fun,
    MG: ModCategoryColor.Fun,
    RP: ModCategoryColor.Fun,
    AS: ModCategoryColor.Fun,
    FR: ModCategoryColor.Fun,
    BU: ModCategoryColor.Fun,
    SY: ModCategoryColor.Fun,
    DP: ModCategoryColor.Fun,
    AT: ModCategoryColor.Automation,
    CN: ModCategoryColor.Automation,
    RX: ModCategoryColor.Automation,
    AP: ModCategoryColor.Automation,
    SO: ModCategoryColor.Automation,
  };

  const getModStyle = (acronym: string): string | undefined => {
    const color = ModColorByAcronym[acronym];

    if (!color) {
      return undefined;
    }

    return `color: ${color};`;
  };

  const ModiferDefs: Record<
    string,
    { label?: string; formatValue?: (value: any) => string; formatSuffix?: (value: any) => string }
  > = {
    final_rate: { label: 'Final Rate', formatValue: (value: number) => `${value}x` },
    speed_change: {
      formatValue: (value: number) => '',
      formatSuffix: (value: number) => `${value}x`,
    },
    adjust_pitch: { formatValue: () => '' },
    max_depth: { label: 'Max Depth' },
    only_fade_approach_circles: {
      label: 'Only Fade Approach Circles',
      formatValue: (v: boolean) => (v ? 'Yes' : 'No'),
    },
    strength: { label: 'Strength', formatValue: (v: number) => v.toFixed(2) },
    circle_size: { label: 'CS' },
    approach_rate: { label: 'AR' },
    overall_difficulty: { label: 'OD' },
    drain_rate: { label: 'HP' },
    style: { label: 'Style' },
    scale: { label: 'Scale' },
    affects_hit_sounds: {
      label: 'Affects Hit Sounds',
      formatValue: (v: boolean) => (v ? 'Yes' : 'No'),
    },
    restart: { label: 'Restart', formatValue: (v: boolean) => (v ? 'Yes' : 'No') },
    mute_combo_count: { label: 'Mute Combo Count' },
    minimum_accuracy: { label: 'Minimum Accuracy', formatValue: (v: number) => `${v * 100}%` },
    spin_speed: { label: 'Spin Speed' },
    angle_sharpness: { label: 'Angle Sharpness' },
    seed: { label: 'Seed' },
  };

  const formatMod = (
    settings?: Record<string, unknown>
  ): { settings?: { label?: string; value: string }[]; suffix?: string } => {
    if (!settings) {
      return {};
    }

    let suffix: string | undefined;
    const formattedSettings: { label?: string; value: string }[] = [];

    for (const [key, value] of Object.entries(settings)) {
      const def = ModiferDefs[key];
      if (!def) {
        console.warn(`No definition found for mod modifier: ${key}`);
        formattedSettings.push({ label: key, value: `${value}` });
        continue;
      }

      const formattedValue = def.formatValue ? def.formatValue(value) : `${value}`;
      if (def.label || formattedValue) {
        formattedSettings.push({ label: def.label, value: formattedValue });
      }
      if (def.formatSuffix) {
        if (suffix) {
          console.warn(`Multiple suffixes found for mod modifier: ${key}`);
        }
        suffix = def.formatSuffix(value);
      }
    }

    return { settings: formattedSettings, suffix };
  };
</script>

<script lang="ts">
  import { TooltipDefinition } from 'carbon-components-svelte';
  import type { Mod } from '../api';

  export let mod: Mod;

  $: formattedMod = formatMod(mod.settings);
</script>

<div class="root">
  {#if formattedMod.settings?.length}
    <TooltipDefinition direction="top">
      <span class="mod-acronym" style={getModStyle(mod.acronym)}>
        {mod.acronym}{#if formattedMod.suffix}
          <span class="mod-suffix">{formattedMod.suffix}</span>
        {/if}
      </span>

      <div slot="tooltip" class="settings">
        {#each formattedMod.settings as { label, value }}
          {#if label}
            <span class="setting">{label}: {value}</span>
          {:else}
            <span class="setting">{value}</span>
          {/if}
        {/each}
      </div>
    </TooltipDefinition>
  {:else}
    <span class="mod-acronym" style={getModStyle(mod.acronym)}>
      {mod.acronym}
      {#if formattedMod.suffix}
        <span class="mod-suffix">{formattedMod.suffix}</span>
      {/if}
    </span>
  {/if}
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: row;
    gap: 1px;
    align-items: flex-end;
  }

  .mod-acronym {
    font-size: 18px;
  }

  .mod-suffix {
    font-size: 13px;
    margin-left: -4px;
  }

  .settings {
    display: flex;
    flex-direction: column;

    .setting {
      font-size: 14px;
    }
  }
</style>
