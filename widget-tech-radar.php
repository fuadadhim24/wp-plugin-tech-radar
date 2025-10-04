<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Elementor_Tech_Radar_Widget extends \Elementor\Widget_Base {

    public function get_name() {
        return 'tech_radar';
    }

    public function get_title() {
        return 'Tech Radar';
    }

    public function get_icon() {
        return 'eicon-integration';
    }

    public function get_categories() {
        return [ 'general' ];
    }

    public function get_script_depends(){
        return ['tech-radar-js','d3-js']; 
    }

    public function get_style_depends(){
        return ['tech-radar-css'];
    }

    protected function register_controls() {
        $this->start_controls_section(
            'section_general',
            [ 'label' => 'General' ]
        );

        $this->add_control(
            'date',
            [
                'label' => 'Radar Date (ex: 2025.05)',
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => date('Y.m'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();

        $options = get_option('tech_radar_options', []);
        $entries = [];

        $quadrants = [
            "Languages & Framework" => 0,
            "Platforms/Infrastructure" => 1,
            "Datastores" => 2,
            "Tools" => 3
        ];
        $rings = [
            "ADOPT" => 0,
            "TRIAL" => 1,
            "ASSESS" => 2,
            "HOLD" => 3
        ];
        $moved = [
            "No Change" => 0,
            "Up" => 1,
            "Down" => -1,
            "New" => 2
        ];

        if (!empty($options['entries'])) {
            foreach ($options['entries'] as $entry) {
                $entries[] = [
                    'quadrant' => isset($quadrants[$entry['quadrant']]) ? $quadrants[$entry['quadrant']] : 0,
                    'ring'     => isset($rings[$entry['ring']]) ? $rings[$entry['ring']] : 0,
                    'label'    => $entry['label'],
                    'moved'    => isset($moved[$entry['moved']]) ? $moved[$entry['moved']] : 0,
                    'link'     => $entry['link'],
                    'active'   => !empty($entry['active']),
                ];
            }
        }

        $svg_id = 'radar-' . $this->get_id(); 
        ?>
        <div class="tech-radar-widget">
            <svg id="<?php echo esc_attr( $svg_id ); ?>"></svg>
        </div>
        <script>
        (function(){
            function runWhenReady() {
                if (typeof radar_visualization !== 'function' || typeof getRadarConfig !== 'function') {
                    setTimeout(runWhenReady, 50);
                    return;
                }

                var config = getRadarConfig();
                config.quadrants = [
                    { name: "Languages & Framework" },
                    { name: "Platforms/Infrastructure" },
                    { name: "Datastores" },
                    { name: "Tools" }
                ];
                config.rings = [
                    { name: "ADOPT", color: "#5ba300" },
                    { name: "TRIAL", color: "#009eb0" },
                    { name: "ASSESS", color: "#c7ba00" },
                    { name: "HOLD", color: "#e09b96" },
                ];

                config.date = <?php echo wp_json_encode( $settings['date'] ); ?>;
                config.entries = <?php echo wp_json_encode( $entries ); ?>;
                config.svg = <?php echo wp_json_encode( $svg_id ); ?>;

                radar_visualization(config);
            }
            runWhenReady();
        })();
        </script>
        <?php
    }
}