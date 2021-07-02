<?php
// This line should be removed in WordPress project
require_once dirname(__FILE__) . '/inc/h.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Webpack Boilerplate</title>
  <link href="<?= h('/assets/stylesheets/app.css') ?>" rel="stylesheet">
</head>
<body>
  <h1 class="heading">Webpack Boilerplate</h1>
  <script src="<?= h('/assets/scripts/app.js') ?>"></script>
</body>
</html>
