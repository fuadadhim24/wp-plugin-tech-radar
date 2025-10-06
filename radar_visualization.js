function getRadarConfig() {
  let w = window.innerWidth;
  let h = window.innerHeight;

  if (w >= 1200) {
    return { width: 1550, height: 1000, scale: 0.6 }; // Desktop
  } else if (w >= 768) {
    return { width: 1550, height: 1000, scale: 0.45 }; // Tablet
  } else {
    return { width: 1550, height: 1000, scale: 0.2 }; // Mobile
  }
}

function radar_visualization(config) {
  config.svg_id = config.svg || "radar";
  config.width = config.width || 1450;
  config.height = config.height || 1000;
  config.colors =
    "colors" in config
      ? config.colors
      : {
        background: "#fff",
        grid: "#dddde0",
        inactive: "#ddd",
      };
  config.print_layout = true;
  config.links_in_new_tabs =
    "links_in_new_tabs" in config ? config.links_in_new_tabs : true;
  config.repo_url = config.repo_url || "#";
  config.print_ring_descriptions_table =
    "print_ring_descriptions_table" in config
      ? config.print_ring_descriptions_table
      : false;
  config.legend_offset = config.legend_offset || [
    { x: 450, y: 90 },   // kanan atas  (Tools)
    { x: -675, y: 90 },  // kiri atas   (Datastores)
    { x: -675, y: -310 },// kiri bawah  (Platforms / Infrastructure)
    { x: 450, y: -370 }, // kanan bawah (Languages / Framework)
  ];

  config.title_offset = config.title_offset || { x: -675, y: -420 };
  config.footer_offset = config.footer_offset || { x: -245, y: 450 };
  config.legend_column_width = config.legend_column_width || 155;
  config.legend_line_height = config.legend_line_height || 20;

  var seed = 42;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min, max) {
    return min + random() * (max - min);
  }

  function normal_between(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  const quadrants = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 },
  ];

  const rings = [
    { radius: 130 },
    { radius: 220 },
    { radius: 310 },
    { radius: 400 },
  ];

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y),
    };
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t),
    };
  }

  function bounded_interval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  function bounded_ring(polar, r_min, r_max) {
    return {
      t: polar.t,
      r: bounded_interval(polar.r, r_min, r_max),
    };
  }

  function bounded_box(point, min, max) {
    return {
      x: bounded_interval(point.x, min.x, max.x),
      y: bounded_interval(point.y, min.y, max.y),
    };
  }

  function segment(quadrant, ring) {
    var polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius,
    };
    var polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius,
    };
    var cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y,
    };
    var cartesian_max = {
      x: rings[3].radius * quadrants[quadrant].factor_x,
      y: rings[3].radius * quadrants[quadrant].factor_y,
    };
    return {
      clipx: function (d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(
          polar(c),
          polar_min.r + 15,
          polar_max.r - 15
        );
        d.x = cartesian(p).x;
        return d.x;
      },
      clipy: function (d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(
          polar(c),
          polar_min.r + 15,
          polar_max.r - 15
        );
        d.y = cartesian(p).y;
        return d.y;
      },
      random: function () {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r),
        });
      },
    };
  }

  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color =
      entry.active || config.print_layout
        ? config.rings[entry.ring].color
        : config.colors.inactive;
  }

  var segmented = new Array(4);
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  var id = 1;
  for (quadrant of [2, 3, 1, 0]) {
    for (var ring = 0; ring < 4; ring++) {
      var entries = segmented[quadrant][ring];
      entries.sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
      for (var i = 0; i < entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  function translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function viewbox(quadrant) {
    return [
      Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
      Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
      440,
      440,
    ].join(" ");
  }

  config.scale = config.scale || 1;
  var scaled_width = config.width * config.scale;
  var scaled_height = config.height * config.scale;
  var svg = d3.select("svg#" + config.svg_id);

  svg.selectAll("*").remove();
  svg.style("background-color", config.colors.background)
    .attr("width", scaled_width)
    .attr("height", scaled_height);


  var radar = svg.append("g");
  if ("zoomed_quadrant" in config) {
    svg.attr("viewBox", viewbox(config.zoomed_quadrant));
  } else {
    radar.attr(
      "transform",
      translate(scaled_width / 2, scaled_height / 2).concat(
        `scale(${config.scale})`
      )
    );
  }

  var grid = radar.append("g");

  config.font_family = config.font_family || "Arial, Helvetica";

  grid
    .append("line")
    .attr("x1", 0)
    .attr("y1", -400)
    .attr("x2", 0)
    .attr("y2", 400)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);
  grid
    .append("line")
    .attr("x1", -400)
    .attr("y1", 0)
    .attr("x2", 400)
    .attr("y2", 0)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);

  var defs = grid.append("defs");
  var filter = defs
    .append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood").attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite").attr("in", "SourceGraphic");

  for (var i = 0; i < rings.length; i++) {
    grid
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 1);
    if (config.print_layout) {
      grid
        .append("text")
        .text(config.rings[i].name)
        .attr("y", -rings[i].radius + 62)
        .attr("text-anchor", "middle")
        .style("fill", config.rings[i].color)
        .style("opacity", 0.35)
        .style("font-family", config.font_family)
        .style("font-size", "42px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }

  function legend_transform(
    quadrant,
    ring,
    legendColumnWidth,
    index = null,
    previousHeight = null
  ) {
    const dx = ring < 2 ? 0 : legendColumnWidth;
    let dy = index == null ? -16 : index * config.legend_line_height;

    if (ring % 2 === 1) {
      dy = dy + (ring == 1 ? 10 : 0) + 46 + previousHeight;
    } else if (index != null) {
      dy = dy + 4;
    }

    if (quadrant === 3 && ring === 1) {
      dy += 15;
    }

    return translate(
      config.legend_offset[quadrant].x + dx,
      config.legend_offset[quadrant].y + dy
    );
  }

  if (config.print_layout) {
    radar
      .append("a")
      .attr("href", config.repo_url)
      .attr(
        "transform",
        translate(config.title_offset.x, config.title_offset.y)
      )
      .append("text")
      .attr("class", "hover-underline")
      .text(config.title)
      .style("font-family", config.font_family)
      .style("font-size", "30")
      .style("font-weight", "bold");

    radar
      .append("text")
      .attr(
        "transform",
        translate(config.title_offset.x, config.title_offset.y + 20)
      )
      .text(config.date || "")
      .style("font-family", config.font_family)
      .style("font-size", "14px")
      .style("fill", "#999");

    radar
      .append("text")
      .attr(
        "transform",
        translate(config.footer_offset.x, config.footer_offset.y)
      )
      .text("▲ moved up     ▼ moved down     ★ new     ⬤ no change")
      .attr("xml:space", "preserve")
      .style("font-family", config.font_family)
      .style("font-size", "18px");

    const legend = radar.append("g");
    for (let quadrant = 0; quadrant < 4; quadrant++) {
      legend
        .append("text")
        .attr(
          "transform",
          translate(
            config.legend_offset[quadrant].x,
            config.legend_offset[quadrant].y - 45
          )
        )
        .text(config.quadrants[quadrant].name)
        .style("font-family", config.font_family)
        .style("font-size", "24px")
        .style("font-weight", "bold");
      let previousLegendHeight = 0;
      for (let ring = 0; ring < 4; ring++) {
        if (ring % 2 === 0) {
          previousLegendHeight = 0;
        }
        legend
          .append("text")
          .attr(
            "transform",
            legend_transform(
              quadrant,
              ring,
              config.legend_column_width,
              null,
              previousLegendHeight
            )
          )
          .text(config.rings[ring].name)
          .style("font-family", config.font_family)
          .style("font-size", "20px")
          .style("font-weight", "bold")
          .style("fill", config.rings[ring].color);
        legend
          .selectAll(".legend" + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
          .append("a")
          .attr("href", function (d, i) {
            return d.link ? d.link : "#";
          })
          .attr("target", function (d, i) {
            return d.link && config.links_in_new_tabs ? "_blank" : null;
          })
          .append("text")
          .attr("transform", function (d, i) {
            return legend_transform(
              quadrant,
              ring,
              config.legend_column_width,
              i,
              previousLegendHeight + 10
            );
          })
          .attr("class", "legend" + quadrant + ring)
          .attr("id", function (d, i) {
            return "legendItem" + d.id;
          })
          .text(function (d) {
            return d.id + ". " + d.label;
          })
          .style("font-family", config.font_family)
          .style("font-size", "18px")
          .on("mouseover", function (event, d) {
            showBubble(d);
            highlightLegendItem(d);
            console.log("active hover")
          })
          .on("mouseout", function (event, d) {
            hideBubble(d);
            unhighlightLegendItem(d);
          })
          .call(wrap_text)
          .each(function () {
            previousLegendHeight += d3
              .select(this)
              .node()
              .getBBox().height;
          });
      }
    }
  }

  function wrap_text(text) {
    let heightForNextElement = 0;

    text.each(function () {
      const textElement = d3.select(this);
      const words = textElement.text().split(" ");
      let line = [];

      const number = `${textElement.text().split(".")[0]}. |`;
      const legendNumberText = textElement.append("tspan").text(number);
      const legendBar = textElement.append("tspan").text("|");
      const numberWidth =
        legendNumberText.node().getComputedTextLength() -
        legendBar.node().getComputedTextLength();

      textElement.text(null);

      let tspan = textElement
        .append("tspan")
        .attr("x", 0)
        .attr("y", heightForNextElement)
        .attr("dy", 0);

      for (let position = 0; position < words.length; position++) {
        line.push(words[position]);
        tspan.text(line.join(" "));

        if (
          tspan.node().getComputedTextLength() >
          config.legend_column_width &&
          position !== 1
        ) {
          line.pop();
          tspan.text(line.join(" "));
          line = [words[position]];

          tspan = textElement
            .append("tspan")
            .attr("x", numberWidth)
            .attr("dy", config.legend_line_height)
            .text(words[position]);
        }
      }

      const textBoundingBox = textElement.node().getBBox();
      heightForNextElement = textBoundingBox.y + textBoundingBox.height;
    });
  }

  var rink = radar.append("g").attr("id", "rink");

  var bubble = radar
    .append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect").attr("rx", 4).attr("ry", 4).style("fill", "#333");
  bubble
    .append("text")
    .style("font-family", config.font_family)
    .style("font-size", "10px")
    .style("fill", "#fff");
  bubble
    .append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    .style("fill", "#333");

  function showBubble(d) {
    console.log("Showing bubble for: ", d);
    var tooltip = d3.select("#bubble text").text(d.label);
    var bbox = tooltip.node().getBBox();
    d3.select("#bubble")
      .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
      .style("opacity", 0.8);
    d3.select("#bubble rect")
      .attr("x", -5)
      .attr("y", -bbox.height)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 4);
    d3.select("#bubble path").attr(
      "transform",
      translate(bbox.width / 2 - 5, 3)
    );
  }

  function hideBubble(d) {
    var bubble = d3
      .select("#bubble")
      .attr("transform", translate(0, 0))
      .style("opacity", 0);
  }

  function highlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.setAttribute("filter", "url(#solid)");
    legendItem.setAttribute("fill", "white");
  }

  function unhighlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.removeAttribute("filter");
    legendItem.removeAttribute("fill");
  }

  var blips = rink
    .selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", function (d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
    .on("mouseover", function (event, d) {
      showBubble(d);
      highlightLegendItem(d);
      console.log("active hover")
    })
    .on("mouseout", function (event, d) {
      hideBubble(d);
      unhighlightLegendItem(d);
    });

  blips.each(function (d) {
    var blip = d3.select(this);

    if (d.active && Object.prototype.hasOwnProperty.call(d, "link") && d.link) {
      blip = blip.append("a").attr("xlink:href", d.link);

      if (config.links_in_new_tabs) {
        blip.attr("target", "_blank");
      }
    }

    blip.on("mouseover", function (event, d) {
      showBubble(d);
      highlightLegendItem(d);
    })
      .on("mouseout", function (event, d) {
        hideBubble(d);
        unhighlightLegendItem(d);
      });

    if (d.moved == 1) {
      blip
        .append("path")
        .attr("d", "M -11,5 11,5 0,-13 z")
        .style("fill", d.color);
    } else if (d.moved == -1) {
      blip
        .append("path")
        .attr("d", "M -11,-5 11,-5 0,13 z")
        .style("fill", d.color);
    } else if (d.moved == 2) {
      blip
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolStar).size(200))
        .style("fill", d.color);
    } else {
      blip.append("circle").attr("r", 9).attr("fill", d.color);
    }

    if (d.active || config.print_layout) {
      var blip_text = config.print_layout
        ? d.id
        : d.label.match(/[a-z]/i);
      blip
        .append("text")
        .text(blip_text)
        .attr("y", 3)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", config.font_family)
        .style("font-size", function (d) {
          return blip_text.length > 2 ? "11px" : "12px";
        })
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  });

  function ticked() {
    blips.attr("transform", function (d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    });
  }

  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19)
    .force("collision", d3.forceCollide().radius(12).strength(0.85))
    .on("tick", ticked);

  function ringDescriptionsTable() {
    var table = d3
      .select("body")
      .append("table")
      .attr("class", "radar-table")
      .style("border-collapse", "collapse")
      .style("position", "relative")
      .style("top", "-70px")
      .style("margin-left", "50px")
      .style("margin-right", "50px")
      .style("font-family", config.font_family)
      .style("font-size", "13px")
      .style("text-align", "left");

    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var columnWidth = `${100 / config.rings.length}%`;

    var headerRow = thead.append("tr").style("border", "1px solid #ddd");

    headerRow
      .selectAll("th")
      .data(config.rings)
      .enter()
      .append("th")
      .style("padding", "8px")
      .style("border", "1px solid #ddd")
      .style("background-color", (d) => d.color)
      .style("color", "#fff")
      .style("width", columnWidth)
      .text((d) => d.name);

    var descriptionRow = tbody
      .append("tr")
      .style("border", "1px solid #ddd");

    descriptionRow
      .selectAll("td")
      .data(config.rings)
      .enter()
      .append("td")
      .style("padding", "8px")
      .style("border", "1px solid #ddd")
      .style("width", columnWidth)
      .text((d) => d.description);
  }

  if (config.print_ring_descriptions_table) {
    ringDescriptionsTable();
  }
}