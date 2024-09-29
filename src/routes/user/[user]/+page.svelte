<script lang="ts">
  import UserStats from './UserStats.svelte';
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  export let data: PageData;
  $: userID = +$page.params.user;
</script>

<div class="root">
  <UserStats stats={data.stats} {userID} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
