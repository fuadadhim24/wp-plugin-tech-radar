function getRadarConfig() {
  let w = window.innerWidth;
  if (w >= 1200) {
    return { width: 1450, height: 1000, scale: 0.6 }; // Desktop
  } else if (w >= 768) {
    return { width: 1450, height: 1000, scale: 0.45 }; // Tablet
  } else {
    return { width: 1450, height: 1000, scale: 0.25 }; // Mobile
  }
}

function radar_visualization(config) {
  config.svg_id = config.svg || "radar";
  config.width = config.width || 1450;
  config.height = config.height || 1000;
  config.colors = config.colors || {
    background: "#fff",
    grid: "#dddde0",
    inactive: "#ddd",
  };
  config.print_layout = true;

  const n = config.quadrants.length;
  const quadrants = [];
  for (let i = 0; i < n; i++) {
    let startAngle = (i / n) * 2 * Math.PI;
    let endAngle = ((i + 1) / n) * 2 * Math.PI;
    quadrants.push({ radial_min: startAngle, radial_max: endAngle });
  }

  const rings = [
    { radius: 130, name: "ADOPT", color: "#5ba300" },
    { radius: 220, name: "TRIAL", color: "#009eb0" },
    { radius: 310, name: "ASSESS", color: "#c7ba00" },
    { radius: 400, name: "HOLD", color: "#e09b96" },
  ];

  var scaled_width = config.width * config.scale;
  var scaled_height = config.height * config.scale;
  var svg = d3.select("svg#" + config.svg_id);

  svg.selectAll("*").remove();
  svg.style("background-color", config.colors.background)
    .attr("width", scaled_width + 200)
    .attr("height", scaled_height + 200)

  var radar = svg.append("g")
    .attr("transform", "translate(" + (scaled_width / 2 + 100) + "," + (scaled_height / 2 + 100) + ") scale(" + config.scale + ")");

  var grid = radar.append("g");

  for (let i = 0; i < rings.length; i++) {
    grid.append("circle")
      .attr("cx", 0).attr("cy", 0).attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid);

    grid.append("text")
      .text(rings[i].name)
      .attr("y", -rings[i].radius + 25)
      .attr("text-anchor", "middle")
      .style("fill", rings[i].color)
      .style("opacity", 0.35)
      .style("font-size", "30px")
      .style("font-weight", "bold");
  }

  for (let i = 0; i < n; i++) {
    let angle = (i / n) * 2 * Math.PI;

    grid.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", rings[3].radius * Math.cos(angle))
      .attr("y2", rings[3].radius * Math.sin(angle))
      .style("stroke", config.colors.grid);
  }

  function polarToCartesian(t, r) {
    return { x: r * Math.cos(t), y: r * Math.sin(t) };
  }

  function segment(quadrant, ring) {
    let q = quadrants[quadrant];
    let rMin = ring === 0 ? 30 : rings[ring - 1].radius;
    let rMax = rings[ring].radius;
    return {
      random: function () {
        let t = q.radial_min + Math.random() * (q.radial_max - q.radial_min);
        let r = rMin + Math.random() * (rMax - rMin);
        return polarToCartesian(t, r);
      }
    };
  }

  for (let e of config.entries) {
    e.segment = segment(e.quadrant, e.ring);
    let pt = e.segment.random();
    e.x = pt.x;
    e.y = pt.y;
    e.color = rings[e.ring].color;
  }

  var blips = radar.selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

  blips.append("circle")
    .attr("r", 8)
    .style("fill", d => d.color);

  blips.append("text")
    .text((d, i) => i + 1)
    .attr("y", 3)
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-size", "10px");

  const legend = radar.append("g");
  const radiusLegend = rings[3].radius + 120;

  for (let q = 0; q < n; q++) {
    let angle = ((q + 0.5) / n) * 2 * Math.PI;
    let lx = radiusLegend * Math.cos(angle);
    let ly = radiusLegend * Math.sin(angle);

    let quadrantGroup = legend.append("g")
      .attr("transform", "translate(" + lx + "," + ly + ")");

    quadrantGroup.append("text")
      .text(config.quadrants[q].name)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .attr("text-anchor", "middle");

    const colX = [-60, 60];
    const order = [0, 1, 2, 3];

    order.forEach((rIndex, idx) => {
      let col = idx < 2 ? 0 : 1;
      let row = idx % 2;
      let baseY = 20 + row * 60;

      quadrantGroup.append("text")
        .text(rings[rIndex].name)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", rings[rIndex].color)
        .attr("x", colX[col])
        .attr("y", baseY)
        .attr("text-anchor", "middle");

      let entries = config.entries.filter(e => e.quadrant === q && e.ring === rIndex);
      entries.forEach((e, eIdx) => {
        quadrantGroup.append("text")
          .text((eIdx + 1) + ". " + e.label)
          .style("font-size", "12px")
          .attr("x", colX[col])
          .attr("y", baseY + 15 + eIdx * 14)
          .attr("text-anchor", "middle")
          .style("fill", "#333");
      });
    });
  }
}