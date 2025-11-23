<script lang="ts">
</script>

<nav class="navbar navbar-default" style="margin-bottom: 0;">
  <div class="container">
    <div class="navbar-header pull-left">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <a href="/osutrack/" id="logo-link">
        <img
          width="82"
          height="60"
          src="https://ameobea.b-cdn.net/resources/logo_25.png"
          id="iclogo"
          alt="osu!track logo"
        />
      </a>
      <a href="/osutrack/" id="logo-link"><div id="logo">osu!track</div></a>
    </div>

    <div class="col-md-3 navbar-right" style="margin-top: 2px; margin-bottom: 2px;">
      <form
        id="trackForm"
        class="input-group"
        onsubmit={evt => {
          evt.preventDefault();
          const userInput = (document.getElementById('user') as HTMLInputElement).value;
          const modeSelect = document.getElementById('mode-chooser') as HTMLSelectElement;
          const mode =
            {
              '0': null,
              '1': 'taiko',
              '2': 'ctb',
              '3': 'mania',
            }[modeSelect.value] ?? 0;
          if (userInput.trim() !== '') {
            window.location.href = `/osutrack/user/${encodeURIComponent(userInput)}${mode !== null ? `/${mode}` : ''}`;
          }
        }}
      >
        <input type="text" id="user" name="user" placeholder="Username" class="form-control" />
        <select class="form-control" id="mode-chooser">
          <option value="0">Osu! Standard</option>
          <option value="1">Taiko</option>
          <option value="2">Catch the Beat</option>
          <option value="3">Mania</option>
        </select>
        <span class="input-group-btn">
          <input type="submit" id="trackUser" value="Search" class="btn btn-default" />
        </span>
      </form>
    </div>

    <div id="navheaderlinks" class="navbar-header navbar-right" style="margin-top: 21px;">
      <ul class="nav pull-right">
        <li class="dropdown pull-left" style="width: 116px">
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a class="dropdown-toggle" data-toggle="dropdown" href="#">
            <span class="glyphicon glyphicon-star"></span> Best Plays
          </a>
          <ul class="dropdown-menu" role="menu">
            <li><a href="/osutrack/bestplays/">Osu! Standard</a></li>
            <li><a href="/osutrack/bestplays/taiko">Taiko</a></li>
            <li><a href="/osutrack/bestplays/ctb">Catch the Beat</a></li>
            <li><a href="/osutrack/bestplays/mania">Mania</a></li>
          </ul>
        </li>
        <li class="pull-left" style="width: 132px">
          <a href="/osutrack/b/discord/">
            <span class="glyphicon glyphicon-send"></span> Discord Bots
          </a>
        </li>
        <li class="pull-left" style="width: 100px">
          <a href="/osutrack/updater/index.php">
            <span class="glyphicon glyphicon-comment"></span> IRC Bot
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
