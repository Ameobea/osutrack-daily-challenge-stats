<script lang="ts">
  import { browser } from '$app/environment';

  let container = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!browser) {
      return;
    }

    fetch('/osutrack/hiscores?user=4093752&mode=0')
      .then(res => res.text())
      .then(text => {
        if (container) {
          container.innerHTML = text;
        }
      });
  });
</script>

<div class="root" bind:this={container}>TODO</div>

<style lang="css">
  .root {
    width: 1240px;
    max-width: 1240px;
    min-width: 1240px;
    margin-left: auto;
    margin-right: auto;
  }

  :global(*) {
    font-family: 'Oxygen', sans-serif;
    color: rgb(85, 85, 85);
  }
</style>
