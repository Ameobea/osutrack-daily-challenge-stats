<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let container = $state<HTMLDivElement | null>(null);

  // $effect(() => {
  //   if (!browser) {
  //     return;
  //   }

  //   fetch('/osutrack/hiscores?user=4093752&mode=0')
  //     .then(res => res.text())
  //     .then(text => {
  //       // it's crazy how little I care
  //       const bodyRgx = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
  //       const bodyMatch = bodyRgx.exec(text);
  //       const bodyHTML = bodyMatch![1];

  //       const tmp = document.createElement('div');
  //       tmp.innerHTML = bodyHTML;
  //       const script: HTMLScriptElement = tmp.children[0].children[0] as HTMLScriptElement;
  //       script.onload = console.warn;
  //       script.onerror = console.error;

  //       document.body.appendChild(script);
  //       console.log(script);
  //     });
  // });

  let fetched = $state<string>('Loading...');
  onMount(() => {
    if (browser) {
      fetch('/osutrack/hiscores?user=4093752&mode=0')
        .then(res => res.text())
        .then(text => {
          fetched = text;
        });
    }
  });
</script>

<div class="root" bind:this={container}>
  {@html fetched}
</div>

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
