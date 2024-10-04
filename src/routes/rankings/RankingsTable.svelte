<script lang="ts">
  import { Pagination } from 'carbon-components-svelte';
  import type { Writable } from 'svelte/store';

  import type { DailyChallengeRanking } from '../../api';
  import { IntegerFormatter, TotalScoreFormatter } from '../../util';

  export let rankings: DailyChallengeRanking[] | null | undefined;
  export let highlightedUsername: string | null | undefined = undefined;
  export let totalRankings: number;
  export let pageNumber: Writable<number | null>;
</script>

<div class="rankings-table">
  <div class="first header">Rank</div>
  <div class="header">Username</div>
  <div class="last header">Total Score</div>
  {#if rankings}
    {#each rankings as { rank, username, total_score, user_id }}
      {@const highlighted = username === highlightedUsername ? 'true' : undefined}
      <div data-highlighted={highlighted} class="first rank">
        #{IntegerFormatter.format(rank)}
      </div>
      <div data-username={username} data-highlighted={highlighted} class="username">
        <a href="/osutrack/daily-challenge/user/{user_id}">{username}</a>
      </div>
      <div data-highlighted={highlighted} class="last" title={IntegerFormatter.format(total_score)}>
        {TotalScoreFormatter.format(total_score)}
      </div>
    {/each}
  {:else}
    <div>Loading...</div>
  {/if}
</div>

<Pagination
  totalItems={totalRankings}
  page={$pageNumber ?? 1}
  on:change={evt => pageNumber.set(evt.detail.page ?? 1)}
  pageSize={50}
  pageSizeInputDisabled
  class="pagination"
/>

<style lang="css">
  .rankings-table {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    max-width: calc(min(440px, 100vw - 20px));
    margin: 0 auto;
    width: 100%;
    font-size: 19px;
    margin-top: 32px;
    margin-bottom: 16px;

    .header {
      font-weight: 500;
      font-size: 20px;
    }

    & > div {
      display: flex;
      padding: 1px 4px;
      background: rgba(255, 255, 255, 0.03);
      margin-bottom: 5px;

      &[data-highlighted='true'] {
        background: rgba(255, 71, 246, 0.25);

        &.username {
          font-weight: 500;
        }
      }

      & > a {
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .first {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      padding-left: 8px;
    }

    .rank {
      font-size: 16px;
      align-items: center;
    }

    .last {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      padding-right: 8px;
    }
  }

  :global(.pagination) {
    max-width: calc(min(600px, 100vw));
    overflow-x: hidden !important;
    margin: 0 auto;
  }

  @media (max-width: 600px) {
    .rankings-table {
      font-size: 16px;

      .header {
        font-size: 18px;
      }
    }
  }
</style>
