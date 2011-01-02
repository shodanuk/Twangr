<!DOCTYPE HTML>
<html lang="en-GB">
<head>
  <meta charset="UTF-8" />
  <meta content="width=device-width; initial-scale=1; maximum-scale=1; user-scalable=0;" name="viewport" />
  <title><?php echo $pageTitle; ?></title>
  <link rel="stylesheet" href="/css/screen.css" type="text/css" media="screen" charset="utf-8" />
</head>
<body class="<?php echo $bodyClass; ?>">
  <div id="container">
    <header>
      <h1>Twangr</h1>

      <!-- <nav id="primary-nav">
        <ul>
          <li><a href="/home/logout">Logout</a></li>
        </ul>
      </nav> -->

      <?php if($isLoggedIn):?>
      <div id="user-dets">Logged in as <a href=""><?php echo $userName; ?></a>.</div>
      <?php endif; ?>
    </header>