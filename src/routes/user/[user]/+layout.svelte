<script lang="ts" context="module">
  enum UserTab {
    Summary = 0,
    Calendar = 1,
  }

  const formatTabName = (tab: UserTab) => {
    switch (tab) {
      case UserTab.Summary:
        return 'Summary';
      case UserTab.Calendar:
        return 'Calendar';
      default:
        return 'Unknown';
    }
  };

  const getActiveTab = (url: URL) => {
    const pathname = url.pathname;
    if (pathname.includes('/calendar')) {
      return UserTab.Calendar;
    } else {
      return UserTab.Summary;
    }
  };

  const getTabPath = (username: string, tab: UserTab) => {
    switch (tab) {
      case UserTab.Summary:
        return `/user/${username}`;
      case UserTab.Calendar:
        return `/user/${username}/calendar`;
      default:
        return `/user/${username}`;
    }
  };
</script>

<script lang="ts">
  import { Tabs, Tab } from 'carbon-components-svelte';
  import { goto, preloadCode } from '$app/navigation';
  import { page } from '$app/stores';

  $: activeTab = getActiveTab($page.url);
  $: username = $page.params.user;

  const handleTabSelected = (evt: any) => {
    const newSelectedTab = evt.detail as UserTab;
    goto(getTabPath(username, newSelectedTab));
  };

  const mkTabPrefetcher = (tab: UserTab) => () => {
    const path = getTabPath(username, tab);
    preloadCode(path);
  };
</script>

<div class="root">
  <Tabs
    autoWidth
    selected={activeTab}
    on:change={handleTabSelected}
    style="margin-left: auto; margin-right: auto; background-color: #111;"
  >
    <Tab on:mouseenter={mkTabPrefetcher(UserTab.Summary)} label="Summary" />
    <Tab on:mouseenter={mkTabPrefetcher(UserTab.Calendar)} label="Calendar" />
  </Tabs>
  <slot />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
