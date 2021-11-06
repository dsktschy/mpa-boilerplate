<?php
$dirname = dirname(__FILE__);
$manifest = json_decode(file_get_contents("{$dirname}/asset-manifest.json"), true);
$_ = function ($path = '') use ($manifest) { return $manifest[$path]; };
$spriteSvg = file_get_contents("{$dirname}/assets/sprites/foobar.svg");
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link href="<?= $_('assets/stylesheets/foobar.css') ?>" rel="stylesheet" />
  <link href="favicon.ico" rel="icon" />
  <title>Foobar | Webpack Boilerplate</title>
</head>
<body>
  <?= $spriteSvg ?>

  <h1 class="heading">Foobar | Webpack Boilerplate</h1>

  <picture>
    <source type="image/webp" srcset="<?= $_('assets/images/logo.webp') ?>" />
    <img src="<?= $_('assets/images/logo.jpg') ?>" class="image" />
  </picture>

  <ul class="link-list">
    <li class="link-item">
      <a href="index.php">
        <svg class="link-icon">
          <use xlink:href="#sprite-home"></use>
        </svg>
      </a>
    </li>
    <li class="link-item">
      <a
        href="https://github.com/dsktschy/webpack-boilerplate"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg class="link-icon">
          <use xlink:href="#sprite-github"></use>
        </svg>
      </a>
    </li>
  </ul>

  <script src="<?= $_('assets/scripts/foobar.js') ?>"></script>
</body>
</html>
