<?php
/**
 * Plugin Name: Elementor Tech Radar Widget
 * Description: Custom Elementor widget to display a Tech Radar with configurable data (date + entries). Ensure compatibility with Elementor 3.31+.
 * Version: 1.3
 * Author: Fuad, Rofiqi, Tasya, Nisa
 * Requires Elementor: 3.0
 * Tested up to: 3.31.2
 * License: GPL2
 * Text Domain: elementor-tech-radar-widget
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'elementor/widgets/register', function( $widgets_manager ) {
    require_once __DIR__ . '/widget-tech-radar.php';
    $widgets_manager->register( new \Elementor_Tech_Radar_Widget() );
} );

add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_script( 'd3-js', 'https://d3js.org/d3.v7.min.js', [], null, true );
    wp_enqueue_script( 'tech-radar-js', plugin_dir_url( __FILE__ ) . 'radar_visualization.js', [ 'd3-js' ], null, true );
    wp_enqueue_style( 'tech-radar-css', plugin_dir_url( __FILE__ ) . 'style/radar-style.css' );
});

add_action('admin_menu', function() {
    add_menu_page(
        'Tech Radar',                  
        'Tech Radar',                  
        'manage_options',              
        'tech-radar',                  
        'render_tech_radar_settings_page', 
        'dashicons-chart-pie',         
        30                             
    );
});

add_action('admin_init', function() {
    register_setting('tech_radar_group', 'tech_radar_options', [
        'sanitize_callback' => 'sanitize_tech_radar_options'
    ]);
});

function sanitize_tech_radar_options($input) {
    if (!empty($input['entries'])) {
        foreach ($input['entries'] as $i => $entry) {
            if (empty($entry['label'])) {
                unset($input['entries'][$i]);
            }
        }
    }

    add_settings_error(
        'tech_radar_options',
        'saved',
        "✅ Tech Radar settings saved successfully.",
        'updated'
    );

    return $input;
}

function render_tech_radar_settings_page() {
    $options = get_option('tech_radar_options', []);

    if (empty($options)) {
        $options = [
            'date' => date('Y.m'),
            'entries' => [
                [
                    'label'    => 'AWS Glue',
                    'quadrant' => 'Data Management',
                    'ring'     => 'ASSESS',
                    'moved'    => 'No Change',
                    'link'     => 'https://aws.amazon.com/glue/',
                    'active'   => true,
                ]
            ]
        ];
    }

    $quadrants = ["Languages & Framework", "Platforms/Infrastructure", "Datastores", "Data Management", "Tools"];
    $rings = ["ADOPT", "TRIAL", "ASSESS", "HOLD"];
    $moved = ["No Change", "Up", "Down", "New"];
    ?>
    <div class="wrap">
        <h1>Tech Radar</h1>

        <!-- Notifikasi -->
        <?php settings_errors(); ?>

        <form method="post" action="options.php">
            <?php settings_fields('tech_radar_group'); ?>

            <h2>Version Date</h2>
            <input type="text" name="tech_radar_options[date]"
                   value="<?php echo esc_attr($options['date']); ?>"
                   placeholder="2025.10" style="width:200px;" />

            <h2>Entries</h2>
            <div id="tech-radar-entries">
                <?php if (!empty($options['entries'])) :
                    foreach ($options['entries'] as $index => $entry) : ?>
                        <div class="tech-radar-entry" style="margin-bottom:15px; padding:10px; border:1px solid #ddd;">
                            Label:
                            <input type="text" name="tech_radar_options[entries][<?php echo $index; ?>][label]"
                                   value="<?php echo esc_attr($entry['label']); ?>" required />

                            Quadrant:
                            <select name="tech_radar_options[entries][<?php echo $index; ?>][quadrant]">
                                <?php foreach ($quadrants as $q) : ?>
                                    <option value="<?php echo $q; ?>" <?php selected($entry['quadrant'], $q); ?>><?php echo $q; ?></option>
                                <?php endforeach; ?>
                            </select>

                            Ring:
                            <select name="tech_radar_options[entries][<?php echo $index; ?>][ring]">
                                <?php foreach ($rings as $r) : ?>
                                    <option value="<?php echo $r; ?>" <?php selected($entry['ring'], $r); ?>><?php echo $r; ?></option>
                                <?php endforeach; ?>
                            </select>

                            Moved:
                            <select name="tech_radar_options[entries][<?php echo $index; ?>][moved]">
                                <?php foreach ($moved as $m) : ?>
                                    <option value="<?php echo $m; ?>" <?php selected($entry['moved'], $m); ?>><?php echo $m; ?></option>
                                <?php endforeach; ?>
                            </select>

                            Link:
                            <input type="url" name="tech_radar_options[entries][<?php echo $index; ?>][link]"
                                   value="<?php echo esc_url($entry['link']); ?>" style="width:250px;" />

                            <input type="hidden" name="tech_radar_options[entries][<?php echo $index; ?>][edited]" value="1" />

                            <button type="button" class="button button-secondary remove-entry">Remove</button>
                        </div>
                <?php endforeach; endif; ?>
            </div>

            <button type="button" id="add-entry" class="button">+ Add Entry</button>
            <br><br>
            <?php submit_button('Save Changes'); ?>
        </form>
    </div>

    <script>
    (function($){
        let entryIndex = <?php echo isset($options['entries']) ? count($options['entries']) : 0; ?>;

        $('#add-entry').on('click', function(e){
            e.preventDefault();
            let html = `
            <div class="tech-radar-entry" style="margin:10px 0; padding:10px; border:1px solid #ddd;">
                Label:
                <input type="text" name="tech_radar_options[entries][${entryIndex}][label]" required />

                Quadrant:
                <select name="tech_radar_options[entries][${entryIndex}][quadrant]">
                    <?php foreach ($quadrants as $q) : ?>
                        <option value="<?php echo $q; ?>"><?php echo $q; ?></option>
                    <?php endforeach; ?>
                </select>

                Ring:
                <select name="tech_radar_options[entries][${entryIndex}][ring]">
                    <?php foreach ($rings as $r) : ?>
                        <option value="<?php echo $r; ?>"><?php echo $r; ?></option>
                    <?php endforeach; ?>
                </select>

                Moved:
                <select name="tech_radar_options[entries][${entryIndex}][moved]">
                    <?php foreach ($moved as $m) : ?>
                        <option value="<?php echo $m; ?>"><?php echo $m; ?></option>
                    <?php endforeach; ?>
                </select>

                Link:
                <input type="url" name="tech_radar_options[entries][${entryIndex}][link]" style="width:250px;" />

                <button type="button" class="button button-secondary remove-entry">Remove</button>
            </div>`;
            $('#tech-radar-entries').append(html);
            entryIndex++;
        });

        $(document).on('click','.remove-entry', function(e){
            e.preventDefault();
            $(this).closest('.tech-radar-entry').remove();
        });
    })(jQuery);
    </script>
    <?php
}