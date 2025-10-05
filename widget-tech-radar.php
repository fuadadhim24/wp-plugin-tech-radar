<?php
if (! defined('ABSPATH')) {
    exit;
}

class Elementor_Tech_Radar_Widget extends \Elementor\Widget_Base
{
    public function get_name()
    {
        return 'tech_radar';
    }

    public function get_title()
    {
        return 'Tech Radar';
    }

    public function get_icon()
    {
        return 'eicon-integration';
    }

    public function get_categories()
    {
        return [ 'general' ];
    }

    public function get_script_depends()
    {
        return ['tech-radar-js','d3-js'];
    }

    public function get_style_depends()
    {
        return ['tech-radar-css'];
    }

    protected function register_controls()
    {
        $this->start_controls_section(
            'section_general',
            [ 'label' => 'General' ]
        );
        $this->add_control(
            'display_mode',
            [
        'label' => __('Display Mode', 'tech-radar'),
        'type' => \Elementor\Controls_Manager::SELECT,
        'default' => 'radar',
        'options' => [
            'radar' => __('Radar Visualization', 'tech-radar'),
            'list' => __('List View', 'tech-radar'),
        ],
    ]
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

    protected function render()
    {
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
        // 🔀 SWITCH berdasarkan tampilan yang dipilih (radar / list)
        if ($settings['display_mode'] === 'list') {
            // TAMPILAN LIST
            $grouped = [];
            foreach ($entries as $entry) {
                $grouped[$entry['quadrant']][$entry['ring']][] = $entry;
            }

            $quadrants = ['Languages & Framework', 'Platforms/Infrastructure', 'Datastores', 'Tools'];
            $rings = ['ADOPT', 'TRIAL', 'ASSESS', 'HOLD'];

            echo '<div class="tech-radar-list-view">';
            $count = 1;
            foreach ($quadrants as $q_index => $q_name) {
                $display_name = str_replace('/', '/<wbr>', $q_name); // agar bisa wrap
                echo "<h3>$display_name</h3>";
                foreach ($rings as $r_index => $ring_name) {
                    if (!empty($grouped[$q_index][$r_index])) {
                        echo "<strong>$ring_name</strong><div>";
                        foreach ($grouped[$q_index][$r_index] as $entry) {
                            echo "<div  >$count. {$entry['label']}</div>";
                            $count++;
                        }
                        echo "</div>";
                    }
                }
            }

            echo '</div>';

        } else {
            // TAMPILAN RADAR

            $svg_id = 'radar-' . $this->get_id();
            ?>
        <div class="tech-radar-widget">
            <svg id="<?php echo esc_attr($svg_id); ?>"></svg>
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

                config.date = <?php echo wp_json_encode($settings['date']); ?>;
                config.entries = <?php echo wp_json_encode($entries); ?>;
                config.svg = <?php echo wp_json_encode($svg_id); ?>;

                radar_visualization(config);
            }
            runWhenReady();
        })();
        </script>
        <?php
        }
    }
}
