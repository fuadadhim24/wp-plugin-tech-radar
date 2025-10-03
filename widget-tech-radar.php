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
        return 'eicon-chart-pie';
    }

    public function get_categories() {
        return [ 'general' ];
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

        $this->start_controls_section(
            'section_entries',
            [ 'label' => 'Radar Entries' ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control( 'quadrant', [
            'label' => 'Quadrant (0..3)',
            'type' => \Elementor\Controls_Manager::NUMBER,
            'default' => 3,
            'min' => 0,
            'max' => 3,
            'step' => 1,
        ] );

        $repeater->add_control( 'ring', [
            'label' => 'Ring (0..3)',
            'type' => \Elementor\Controls_Manager::NUMBER,
            'default' => 2,
            'min' => 0,
            'max' => 3,
            'step' => 1,
        ] );

        $repeater->add_control( 'label', [
            'label' => 'Label',
            'type' => \Elementor\Controls_Manager::TEXT,
            'default' => 'AWS Glue',
        ] );

        $repeater->add_control( 'active', [
            'label' => 'Active',
            'type' => \Elementor\Controls_Manager::SWITCHER,
            'label_on' => 'Yes',
            'label_off' => 'No',
            'return_value' => 'yes',
            'default' => 'yes',
        ] );

        $repeater->add_control( 'moved', [
            'label' => 'Moved ( -1, 0, 1, 2 )',
            'type' => \Elementor\Controls_Manager::NUMBER,
            'default' => 0,
            'min' => -1,
            'max' => 2,
            'step' => 1,
        ] );

        $this->add_control( 'entries', [
            'label' => 'Entries',
            'type' => \Elementor\Controls_Manager::REPEATER,
            'fields' => $repeater->get_controls(),
            'default' => [
                [ 'quadrant' => 3, 'ring' => 2, 'label' => 'AWS Glue', 'active' => 'yes', 'moved' => 0 ],
            ],
            'title_field' => '{{{ label }}}',
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();

        $entries = [];
        if ( ! empty( $settings['entries'] ) && is_array( $settings['entries'] ) ) {
            foreach ( $settings['entries'] as $e ) {
                $entries[] = [
                    'quadrant' => isset($e['quadrant']) ? intval($e['quadrant']) : 0,
                    'ring'     => isset($e['ring']) ? intval($e['ring']) : 0,
                    'label'    => isset($e['label']) ? wp_slash( $e['label'] ) : '',
                    'active'   => (isset($e['active']) && $e['active'] === 'yes') ? true : false,
                    'moved'    => isset($e['moved']) ? intval($e['moved']) : 0,
                    'link'     => isset($e['link']) ? esc_url_raw($e['link']) : null,
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
                  { name: "Languages" },
                  { name: "Infrastructure" },
                  { name: "Datastores" },
                  { name: "Data Management" },
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