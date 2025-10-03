<?php
if (!defined('ABSPATH')) {
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
        return ['general'];
    }

    public function get_script_depends()
    {
        return ['tech-radar-js','d3-js'];
    }
    public function get_style_depends()
    {
        return ['tech-radar-css'];
    }

    /** Tidak ada kontrol entries di sini. Hanya info & date preview dari option. */
    protected function register_controls()
    {
        $this->start_controls_section('section_general', ['label' => 'General']);
        $this->add_control('notice', [
            'label' => 'Info',
            'type'  => \Elementor\Controls_Manager::RAW_HTML,
            'raw'   => '<strong>Data radar diambil dari menu <em>Tech Radar</em> di Dashboard.</strong><br>Silakan isi Entries di sana. Widget ini hanya menampilkan hasilnya.',
            'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
        ]);
        $this->end_controls_section();
    }

    protected function render()
    {
        if (!function_exists('tr_build_config')) {
            echo '<p>Plugin belum lengkap: fungsi sumber data tidak ditemukan.</p>';
            return;
        }

        $cfg = tr_build_config();

        // Jika kamu ingin tetap menyematkan satu entry default (mis. AWS Glue) saat kosong:
        if (empty($cfg['entries'])) {
            $cfg['entries'][] = [
                'label' => 'AWS Glue',
                'quadrant' => 3,
                'ring' => 2,
                'moved' => 0,
                'link'  => 'https://aws.amazon.com/glue/',
                'active' => true,
            ];
        }

        $json   = wp_json_encode($cfg);
        $svg_id = 'radar-' . $this->get_id();
        ?>
        <div class="tech-radar-widget">
            <svg id="<?php echo esc_attr($svg_id); ?>"></svg>
        </div>
        <script>
        (function(){
          function go(){
            if (typeof radar_visualization !== 'function') { setTimeout(go,50); return; }
            try {
              var cfg = <?php echo $json; ?>;
              cfg.svg = <?php echo wp_json_encode($svg_id); ?>;
              radar_visualization(cfg);
            } catch(e){ console.error('Radar error (widget)', e); }
          }
          go();
        })();
        </script>
        <?php
    }
}