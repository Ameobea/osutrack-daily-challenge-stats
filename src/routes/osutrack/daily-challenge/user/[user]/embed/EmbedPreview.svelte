<script lang="ts">
  // url of the rendered embed SVG (persisted hash), or null before the first render resolves
  export let svgUrl: string | null;
  export let loading: boolean;
  export let error: string | null;
</script>

<div class="preview">
  <div class="preview-head">
    <span class="title">Preview</span>
    {#if loading}
      <span class="status">updating…</span>
    {/if}
  </div>
  <div class="stage" class:dim={loading}>
    {#if error}
      <div class="error">{error}</div>
    {:else if svgUrl}
      <img src={svgUrl} alt="Embed preview" />
    {:else}
      <div class="placeholder">Rendering…</div>
    {/if}
  </div>
</div>

<style lang="css">
  .preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .title {
    font-size: 17px;
    font-weight: 500;
  }

  .status {
    font-size: 13px;
    color: #02b5c3;
  }

  .stage {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    /* checkerboard so the card edges read regardless of the card's own background color */
    background-color: #0c0c0c;
    background-image:
      linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
      linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
      linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0;
    border: 1px solid hsl(200, 10%, 18%);
    min-height: 200px;
    transition: opacity 120ms ease;
  }

  .stage.dim {
    opacity: 0.6;
  }

  .stage img {
    max-width: 100%;
    height: auto;
  }

  .placeholder {
    color: hsl(0, 0%, 55%);
    font-size: 15px;
  }

  .error {
    color: #ff5a5a;
    font-size: 14px;
    text-align: center;
    max-width: 320px;
  }
</style>
