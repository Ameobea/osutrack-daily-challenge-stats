<script lang="ts">
  import Copy from 'carbon-icons-svelte/lib/Copy.svelte';

  export let pngUrl: string;
  export let svgUrl: string;

  $: snippets = [
    { id: 'png', label: 'Direct image (PNG)', value: pngUrl },
    { id: 'bbcode', label: 'osu! profile (BBCode)', value: `[img]${pngUrl}[/img]` },
    { id: 'svg', label: 'Direct image (SVG)', value: svgUrl },
  ];

  let copiedID: string | null = null;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  const flagCopied = (id: string) => {
    copiedID = id;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copiedID = null), 1500);
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flagCopied(id);
    } catch (err) {
      console.error('clipboard write failed', err);
    }
  };
</script>

<div class="output">
  <h4>Share &amp; Embed</h4>
  <p class="hint">
    Paste the direct image on your osu! profile (BBCode), in Discord, or anywhere else.
  </p>
  <div class="rows">
    {#each snippets as s (s.id)}
      <div class="row">
        <span class="label">{s.label}</span>
        <div class="field">
          <input type="text" readonly value={s.value} />
          <button
            type="button"
            class="copy-btn"
            class:copied={copiedID === s.id}
            on:click={() => copyText(s.id, s.value)}
          >
            <Copy size={16} />
            {copiedID === s.id ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="css">
  .output {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h4 {
    font-size: 17px;
    font-weight: 500;
    margin: 0;
  }

  .hint {
    color: hsl(0, 0%, 60%);
    font-size: 13px;
    margin: 0;
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 13px;
    color: hsl(0, 0%, 70%);
  }

  .field {
    display: flex;
    gap: 6px;
  }

  .field input {
    flex: 1;
    min-width: 0;
    background: hsl(200, 10%, 11%);
    color: hsl(0, 0%, 85%);
    border: 1px solid hsl(200, 10%, 20%);
    padding: 6px 8px;
    font-family: monospace;
    font-size: 13px;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    background: hsl(200, 10%, 16%);
    color: hsl(0, 0%, 90%);
    border: 1px solid hsl(200, 10%, 22%);
    padding: 6px 10px;
    cursor: pointer;
    font-size: 13px;
  }

  .copy-btn.copied {
    border-color: #00aa00;
    color: #4ad34a;
  }
</style>
