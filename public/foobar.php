<?php
// This line should be removed in WordPress project
require_once dirname(__FILE__) . '/inc/h.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Foobar | Webpack Boilerplate</title>
  <link href="<?= h('/assets/stylesheets/foobar.css') ?>" rel="stylesheet">
</head>
<body>
  <h1 class="heading">Foobar | Webpack Boilerplate</h1>
  <a href="index.php">Index</a>
  <script src="<?= h('/assets/scripts/foobar.js') ?>"></script>
</body>
</html>
