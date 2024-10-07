<script lang="ts">
  import { InlineLoading } from 'carbon-components-svelte';
  import { Search } from 'carbon-icons-svelte';
  import SvelteSeo from 'svelte-seo';
  import { goto, preloadData } from '$app/navigation';

  import { fetchUserID } from '../api';
  import { logError } from '../sentry';

  let searchValue = '';
  let searchFocused = false;
  let isLoading = false;
  let error = '';

  const handleSearchButtonClick = async () => {
    if (!searchValue) {
      return;
    }

    isLoading = true;
    error = '';

    let userID: number = 0;
    try {
      userID = await fetchUserID(fetch, searchValue);
    } catch (err) {
      logError('Error fetching user ID', err);
      error = 'Error fetching user.  Double check the username and try again.';
      isLoading = false;
      return;
    }

    try {
      await goto(`/osutrack/daily-challenge/user/${userID}`);
    } catch (err) {
      logError('Error navigating to user page', err);
      error = 'Error loading user page.  Double check the username and try again.';
    } finally {
      isLoading = false;
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchButtonClick();
    }
  };

  const prefetchProfile = () => {
    if (!searchValue) {
      return;
    }

    preloadData(`/osutrack/daily-challenge/user/${searchValue}`);
  };
</script>

<SvelteSeo
  title="osu!track Daily Challenge Stats"
  description="Player stats and global rankings for the osu! daily challenge"
  openGraph={{
    title: 'osu!track Daily Challenge Stats',
    description: 'Player stats and global rankings for the osu! daily challenge',
  }}
/>

<div class="root">
  <h1>osu!track Daily Challenge Stats</h1>
  <div class="top">
    <div class="search-container">
      <input
        type="text"
        class="main-search"
        bind:value={searchValue}
        on:focus={() => {
          searchFocused = true;
        }}
        on:blur={() => {
          searchFocused = false;
        }}
        placeholder={searchFocused ? undefined : 'Enter osu! username'}
        on:keydown={handleSearchKeyDown}
      />
      <button
        on:mouseenter={prefetchProfile}
        on:click={handleSearchButtonClick}
        disabled={!searchValue}
        style={isLoading ? 'background-color: #000' : undefined}
      >
        {#if isLoading}
          <InlineLoading
            style="transform: scale(1.7) translate(9px, 0px); transform-origin: center center"
          />
        {:else}
          <Search size={32} style="margin-top: 10px" />
        {/if}
      </button>
    </div>
    {#if error}
      <span class="error">{error}</span>
    {/if}

    <div class="links">
      <a href="/osutrack/daily-challenge/rankings">View Global Rankings</a>
      <a href="/osutrack/daily-challenge/stats">View Global Stats</a>
    </div>
  </div>

  <footer>
    Created by <a style="margin-left: 4px;" href="https://cprimozic.net">Casey Primozic / ameo</a>
    .&nbsp;Fully&nbsp;
    <a href="https://github.com/Ameobea/osutrack-daily-challenge-stats" target="_blank">
      open-source
    </a>
  </footer>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 20px 20px 0px 20px;
  }

  h1 {
    text-align: center;
    font-weight: 500;
  }

  .error {
    color: #d72121;
    margin-top: 3px;
    text-align: center;
    font-size: 16px;
  }

  .links {
    margin-top: 32px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 24px;
    width: 100%;
    max-width: 600px;
    font-size: 24px;
    color: rgb(212, 212, 212);

    & a {
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      padding: 8px 16px;
      border: 1px solid #323232;
      text-decoration: none;
    }

    & a:hover {
      background-color: #32323244;
      text-decoration: none;
    }
  }

  .top {
    display: flex;
    flex-direction: column;
    flex: 1;
    text-align: center;
    align-items: center;
    justify-content: center;
    margin-left: 20px;
    margin-right: 20px;
  }

  .search-container {
    display: flex;
    flex-direction: row;
    margin-top: 30px;
    max-width: calc(min(800px, 100vw - 40px));
    width: 100%;
  }

  .main-search {
    color: rgb(254, 254, 254);
    background-color: #000;
    box-sizing: border-box;
    width: 100%;
    height: 50px;
    border: 1px solid #323232;
    border-radius: 6px 0px 0px 6px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    font-size: 28px;
    outline: none !important;
  }

  @media (max-width: 800px) {
    .root {
      padding: 6px 4px 0px 4px;
    }

    .main-search {
      font-size: 20px;
    }

    h1 {
      font-size: 30px;
    }

    .links {
      font-size: 16px;
      gap: 12px;

      & a {
        min-height: 66px;
      }
    }

    .top {
      margin-top: -40px;
    }

    footer {
      padding-bottom: 2px !important;
    }
  }

  .main-search::-webkit-input-placeholder,
  .main-search::placeholder {
    color: #aaa;
  }

  .search-container button {
    height: 50px;
    width: 58px;
    border-radius: 0px 6px 6px 0px;
    border: 1px solid #323232;
    border-left: none;
    padding: 0 10px;
    background-color: #050505;
    color: #fff;
    cursor: pointer;
  }

  .search-container button:disabled {
    background-color: #000;
    color: #ffffff66;
    cursor: default;
  }

  .search-container button:not(:disabled) {
    background-color: #488d19;
    transition: background-color 0.15s ease-in-out;
  }

  .search-container button:not(:disabled):active {
    background-color: #23420e !important;
  }

  .search-container button:not(:disabled):hover {
    background-color: #346413;
    transition: background-color 0.1s ease-in-out;
  }

  footer {
    margin-top: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100vw;
    max-width: 100%;
    padding-bottom: 6px;
  }
</style>
