<?php
if (!function_exists('h')) {
  /**
   * Create hashed assets path
   *
   * @param  string  $path
   * @param  boolean $uri
   * @return string
   */
  function h($path = '', $uri = true)
  {
    $rootRelative = substr($path, 0, 1) === '/';
    $relativePath = $rootRelative ? substr($path, 1) : $path;
    if (!$relativePath) {
      throw new Exception("`{$path}` doesn't exist in manifest.json.");
    }
    $manifestAbsolutePath = dirname(__FILE__, 2) . '/manifest.json';
    if (!file_exists($manifestAbsolutePath)) {
      throw new Exception("manifest.json doesn't exist.");
    }
    $manifests = json_decode(file_get_contents($manifestAbsolutePath), true);
    if (!isset($manifests[$relativePath])) {
      throw new Exception("`{$path}` doesn't exist in manifest.json.");
    }
    return $uri && function_exists('get_stylesheet_directory_uri')
      ? get_stylesheet_directory_uri() . '/' . $manifests[$relativePath]
      : ($rootRelative ? '/' : '') . $manifests[$relativePath];
  }
}
