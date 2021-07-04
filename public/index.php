<?php
// This line should be removed in WordPress project
require_once dirname(__FILE__) . '/inc/h.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="<?= h('assets/stylesheets/index.css') ?>" rel="stylesheet">
  <link href="favicon.ico" rel="icon">
  <title>Webpack Boilerplate</title>
</head>
<body>
  <?php
    $documentRootPath = function_exists('get_stylesheet_directory')
      ? get_stylesheet_directory()
      : dirname(__FILE__);
    $spriteSvgPath = $documentRootPath . h('/assets/sprites/index.svg', false);
  ?>
  <?php if (file_exists($spriteSvgPath)): ?>
  <?= file_get_contents($spriteSvgPath) ?>
  <?php else: ?>
  <script>console.warn('Please rebuild to copy sprites to dist.')</script>
  <?php endif; ?>

  <h1 class="heading">Webpack Boilerplate</h1>

  <picture>
    <source type="image/webp" srcset="<?= h('assets/images/logo.webp') ?>" />
    <img src="<?= h('assets/images/logo.png') ?>" class="image" />
  </picture>

  <ul class="link-list">
    <?php if (!function_exists('get_stylesheet_directory')): ?>
    <li class="link-item">
      <a href="foobar.php">
        <svg class="link-icon">
          <use xlink:href="#sprite-flask"></use>
        </svg>
      </a>
    </li>
    <?php endif; ?>
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

  <script src="<?= h('assets/scripts/index.js') ?>"></script>
</body>
</html>
