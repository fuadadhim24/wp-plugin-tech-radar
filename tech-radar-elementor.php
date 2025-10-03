<?php

/**
 * Plugin Name: Elementor Tech Radar Widget
 * Description: Custom Elementor widget untuk menampilkan Tech Radar dengan data configurable (date + entries).
 * Version: 1.0
 * Author: Fuad, Rofiqi, Tasya, Nisa
 */

if (! defined('ABSPATH')) {
    exit;
}

add_action('elementor/widgets/register', function ($widgets_manager) {
    require_once __DIR__ . '/widget-tech-radar.php';
    $widgets_manager->register(new \Elementor_Tech_Radar_Widget());
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script('d3-js', 'https://d3js.org/d3.v7.min.js', [], null, true);
    wp_enqueue_script('tech-radar-js', plugin_dir_url(__FILE__) . 'radar_visualization.js', [ 'd3-js' ], null, true);
});
