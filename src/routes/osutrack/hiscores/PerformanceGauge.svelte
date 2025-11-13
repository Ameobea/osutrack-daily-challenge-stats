<script lang="ts">
  let { label, value, max }: { label: string; value: number; max: number } = $props();

  const percentage = $derived(max > 0 ? (value / max) * 100 : 0);
</script>

<div class="gauge-container">
  <div class="gauge-label">{label}</div>
  <div class="gauge-track">
    <div class="gauge-fill" style="width: {percentage}%"></div>
    <div class="gauge-text">
      {value.toFixed(2)} / {max.toFixed(2)}
    </div>
  </div>
</div>

<style lang="css">
  .gauge-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .gauge-label {
    font-size: 12px;
    font-weight: 600;
    color: #555;
  }

  .gauge-track {
    position: relative;
    width: 100%;
    height: 12px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .gauge-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #8ac1ff 0%, #7ab6fa 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .gauge-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #181818;
  }
</style>
