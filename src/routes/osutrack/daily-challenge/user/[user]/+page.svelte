<script lang="ts">
  import { page } from '$app/stores';

  import UserStats from './UserStats.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: userID = +($page.params.user ?? '');
  $: title = `${data.username} | Daily Challenge Stats`;
  $: description = `osu! daily challenge stats for ${data.username}`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<div class="root">
  <UserStats stats={data.stats} {userID} username={data.username} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
