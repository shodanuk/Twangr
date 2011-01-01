<div id="user-details-template" style="display:none">
  <article class="user-details" id="user-#{userId}">
    <header>
      <hgroup>
        <h1 class="real-name">#{realName}</h1>
        <h2 class="screen-name">#{screenName}</h2>
      </hgroup>
    </header>
    <div class="bd" id="">
      <ul>
        <li class="following"><span class="label">Am I following this person?:</span><span class="data">#{following}</span></li>
        <li class="followers"><span class="label">Followers:</span><span class="data">#{followers}</span></li>
        <li class="friends"><span class="label">Following:</span><span class="data">#{friends}</span></li>
        <li class="location"><span class="label">Location:</span><span class="data">#{location}</span></li>
        <li class="url"><span class="label">Website:</span><span class="data">#{url}</span></li>
      </ul>
    </div>
  </article>
</div>