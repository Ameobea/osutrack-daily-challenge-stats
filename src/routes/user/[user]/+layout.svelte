<script lang="ts" context="module">
  enum UserTab {
    Summary = 0,
    Calendar = 1,
  }

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
  import type { PageData } from './$types';

  export let data: PageData;
  $: username = data.username;

  $: activeTab = getActiveTab($page.url);
  $: userID = $page.params.user;

  const handleTabSelected = (evt: any) => {
    const newSelectedTab = evt.detail as UserTab;

    // It's possible that we change tabs using a link in the page or other means.
    //
    // If so, we want to avoid overwriting any query params or hash that might have been added.
    const url = new URL($page.url);
    if (url.pathname === getTabPath(userID, newSelectedTab)) {
      return;
    }

    goto(getTabPath(userID, newSelectedTab));
  };

  const mkTabPrefetcher = (tab: UserTab) => () => {
    const path = getTabPath(userID, tab);
    preloadCode(path);
  };
</script>

<div class="side-header">
  <h2>
    <a href={`https://osu.ppy.sh/u/userID`} target="_blank">
      {username}
    </a>
  </h2>
  <img src="https://ameobea.b-cdn.net/osutrack/Mixins/userImage.php?u={userID}" alt="User avatar" />
</div>

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

  .side-header {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 8px 12px;

    h2 {
      margin-bottom: 4px;
      text-align: center;
      font-weight: 500;
      font-size: 30px;

      a {
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    img {
      width: 64px;
      height: 64px;
      min-width: 48px;
      min-height: 48px;
      max-width: 48px;
      max-height: 48px;
      margin-right: 12px;
      aspect-ratio: 1;
    }
  }

  @media (min-width: 1920px) {
    .side-header {
      min-width: 300px;
      max-width: 300px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: fixed;
      left: calc((100vw - 1270px) / 2 - (300px + 16px));
      top: 12px;
      padding: 16px;
      border: 1px solid #333;
      border-radius: 4px;

      img {
        width: 256px;
        height: 256px;
        min-width: 256px;
        min-height: 256px;
        max-width: 256px;
        max-height: 256px;
      }

      h2 {
        margin-top: -8px;
        margin-bottom: 12px;
        font-size: 34px;
      }
    }
  }
</style>
