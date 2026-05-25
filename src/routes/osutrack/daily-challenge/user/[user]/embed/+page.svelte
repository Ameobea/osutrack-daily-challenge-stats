<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  import type { EmbedConfig } from '../../../../../../api';
  import { createEmbed, embedPngUrl, embedSvgUrl } from '../../../../../../api';
  import { makeDefaultConfig } from './embedMeta';
  import EmbedControls from './EmbedControls.svelte';
  import EmbedPreview from './EmbedPreview.svelte';
  import EmbedOutput from './EmbedOutput.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: userID = +($page.params.user ?? '');
  $: username = data.username;
  $: isFullStreak = data.isFullStreak;

  let config: EmbedConfig = makeDefaultConfig();
  let hash: string | null = null;
  let loading = false;
  let error: string | null = null;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let reqSeq = 0;

  const onConfigChange = (next: EmbedConfig) => {
    config = next;
  };

  const runRender = async (cfg: EmbedConfig, seq: number) => {
    try {
      const res = await createEmbed(fetch, userID, cfg);
      if (seq !== reqSeq) {
        return; // a newer edit superseded this request
      }
      hash = res.hash;
      error = null;
    } catch (e) {
      if (seq !== reqSeq) {
        return;
      }
      console.error(e);
      error = 'Failed to render preview. The stats backend may be unreachable.';
    } finally {
      if (seq === reqSeq) {
        loading = false;
      }
    }
  };

  const scheduleRender = (cfg: EmbedConfig) => {
    clearTimeout(debounceTimer);
    const seq = ++reqSeq;
    loading = true;
    debounceTimer = setTimeout(() => runRender(cfg, seq), 350);
  };

  // auto-generate as you edit: every config change (and the initial mount) re-renders. guarded to
  // the browser so it fires lazily only once this tab's route is actually opened.
  $: if (browser && userID && config) {
    scheduleRender(config);
  }

  $: svgUrl = hash ? embedSvgUrl(userID, hash) : null;
  $: pngUrl = hash ? embedPngUrl(userID, hash) : '';
  $: title = `${username} | Daily Challenge User Card`;
  $: description = `Generate a shareable osu! daily challenge stats image for ${username}`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<div class="embed-page">
  <div class="col controls-col">
    <EmbedControls {config} {onConfigChange} {isFullStreak} />
  </div>
  <div class="col preview-col">
    <div class="sticky">
      <EmbedPreview {svgUrl} {loading} {error} />
      {#if hash && !error && !loading}
        <EmbedOutput {pngUrl} svgUrl={svgUrl ?? ''} />
      {/if}
    </div>
  </div>
</div>

<style lang="css">
  .embed-page {
    display: flex;
    flex-direction: row;
    gap: 28px;
    padding: 8px 16px 48px;
    align-items: flex-start;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
  }

  .col {
    display: flex;
    flex-direction: column;
  }

  .controls-col {
    flex: 0 0 380px;
    max-width: 380px;
  }

  .preview-col {
    flex: 1;
    min-width: 0;
  }

  .sticky {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: 12px;
  }

  @media (max-width: 900px) {
    .embed-page {
      flex-direction: column-reverse;
      gap: 24px;
      padding: 8px 10px 48px;
    }

    .controls-col {
      flex: 1 1 auto;
      max-width: 100%;
      width: 100%;
    }

    .sticky {
      position: static;
    }
  }
</style>
