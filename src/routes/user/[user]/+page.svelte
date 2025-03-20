<script lang="ts">
  import SvelteSeo from 'svelte-seo';
  import { page } from '$app/stores';

  import UserStats from './UserStats.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: userID = +$page.params.user;
</script>

<SvelteSeo
  title="{data.username} | Daily Challenge Stats"
  description="osu! daily challenge stats for {data.username}"
  openGraph={{
    title: `${data.username} | Daily Challenge Stats`,
    description: `osu! daily challenge stats for ${data.username}`,
  }}
/>

<div class="root">
  <UserStats stats={data.stats} {userID} username={data.username} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
