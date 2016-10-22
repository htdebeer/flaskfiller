/*
 * Copyright 2013, 2016 Huub de Beer <Huub@heerdebeer.org>
 *
 * This file is part of FlaskFiller.
 *
 * FlaskFiller is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FlaskFiller is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with FlaskFiller.  If not, see <http://www.gnu.org/licenses/>.
 */
const view = require("./view");
const dom = require("../dom");

const graph = function(config_) {
  const config = Object.create(config_);
  config.type = "graph";
  const _graph = view(config);

  let horizontal = config_.horizontal;
  let vertical = config_.vertical;

  const RULER_WIDTH = config.dimensions.ruler_width || 30;
  const dimensions = {
    width: config.dimensions.width,
    height: config.dimensions.height,
    margins: {
      top: 5,
      right: 5,
      left: RULER_WIDTH + 15,
      bottom: RULER_WIDTH + 5
    }
  };

  const CONTAINER = {
    width: dimensions.width || 900,
    height: dimensions.height || 600
  };
  const MARGINS = {
    top:dimensions.margins.top || 10,
    right:dimensions.margins.right || 20,
    left:dimensions.margins.left || 60,
    bottom:dimensions.margins.bottom || 60
  };
  const GRAPH = {
    width: CONTAINER.width - MARGINS.left - MARGINS.right,
    height: CONTAINER.height - MARGINS.top - MARGINS.bottom
  };
  const GRAPH_LINE_WIDTH = 4;

  _graph.fragment = document
    .createDocumentFragment()
    .appendChild(dom.create({
      name: "figure",
      attributes: {
        "class": "graph"
      }
    }));

  let horizontal_axis;
  let vertical_axis;

  const svg = d3.select(_graph.fragment)
    .append("svg")
      .attr("width", CONTAINER.width)
      .attr("height", CONTAINER.height);

  svg.append("defs")
        .append("marker")
          .attr("id", "arrowhead")
          .attr("markerWidth", "4")
          .attr("markerHeight", "6")
          .attr("refX", "4")
          .attr("refY", "3")
          .attr("orient", "auto")
          .append("path")
            .attr("d", "M0,0 l0,6 l4,-3 l-4,-3")
            .style("fill", "black");
  
  const tooltip = d3.select("body")
    .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0);

  const speed_tooltip = d3.select("body")
    .append("div")
    .attr("class", "speed_tooltip")
    .style("position", "absolute")
    .style("opacity", 0);
  
  const setAxis = function (orientation, elt) {
    const translateQuantity = function (en) {
      const map = {
        "time": "tijd",
        "height": "hoogte",
        "volume": "volume",
        "speed": "stijgsnelheid"
      };
      return map[en];
    };
    const select = $(elt);
    const value = translateQuantity(select.val());

    if ("vertical" === orientation) {
      vertical = value;
    } else {
      horizontal = value;
    }

    _graph.update_all();
  };

  const setHorizontalAxis = function () {
    setAxis("horizontal", this);
  };

  const setVerticalAxis = function () {
    setAxis("vertical", this);
  };

  $("select[name='horizontal-axis']").on("change", setHorizontalAxis);
  $("select[name='vertical-axis']").on("change", setVerticalAxis);

  // Initialize
  setHorizontalAxis.call($("select[name='horizontal-axis']"));
  setVerticalAxis.call($("select[name='vertical-axis']"));

  const graph = svg.append("g")
      .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")");

  function add_tooltip(model_name) {
    return function() {
      const PADDING = 10;
      graph.select("g.lines g.line." + model_name + " path")
        .style("cursor", "crosshair");

      const container = _graph.fragment.querySelector("svg > g");
      const point = d3.mouse(container);
      const x_scale = horizontal_axis.scale;
      const x_quantity = horizontal_axis.quantity;
      const y_scale = vertical_axis.scale;
      const y_quantity = vertical_axis.quantity;
      const x = x_scale.invert(point[0]).toFixed(x_quantity.precision || 0);
      const y = y_scale.invert(point[1]).toFixed(y_quantity.precision || 0);
      const x_unit = x_quantity.unit;
      const y_unit = y_quantity.unit;

      tooltip.html( x + " " + x_unit + "; " + y + " " + y_unit);

      tooltip
        .style("left", d3.event.pageX + PADDING*2 + "px")     
        .style("top", d3.event.pageY - PADDING + "px")
        .style("opacity", 0.7);
    };
  }

  function remove_tooltip(model_name) {
    return function() {
      graph.select("g.lines g.line." + model_name + " path")
        .style("cursor", "default");
      tooltip.style("opacity", 0);
    };
  }

  function draw_tailpoints(model_name) {
    const model = _graph.get_model(model_name).model;
    const step = function(value, index) {
      const step_size = model.step_size();
      return index % step_size === 0;
    };
    const data = model.data().filter(step);
    const x_scale = horizontal_axis.scale;
    const x_quantity = horizontal_axis.quantity;
    const y_scale = vertical_axis.scale;
    const y_quantity = vertical_axis.quantity;

    const model_tailpoints = _graph.fragment.querySelector("svg g.tailpoints g." + model_name);
    if (model_tailpoints) {
      model_tailpoints.parentNode.removeChild(model_tailpoints);
    }

    const POINT_R = 3;
    const TAIL_WIDTH = 3;
    const COLOR = model.color();

    graph.select("g.tailpoints")
      .append("g")
        .attr("class", model_name)
        .selectAll("line")
          .data(data)
          .enter()
            .append("line")
              .attr("x1", function(d) {
                return x_scale(d[x_quantity.name]);
              })
              .attr("y1", function(d) {
                return y_scale(d[y_quantity.name]);
              })
              .attr("x2", function(d) {
                return x_scale(d[x_quantity.name]);
              })
              .attr("y2", y_scale(0))
              .attr("stroke", COLOR)
              .attr("stroke-width", TAIL_WIDTH);

    graph.select("g.tailpoints g." + model_name)
      .selectAll("circle")
      .data(data)
      .enter()
        .append("circle")
          .attr("cx", function(d) {
            return x_scale(d[x_quantity.name]);
          })
          .attr("cy", function(d) {
              return y_scale(d[y_quantity.name]);
          })
          .attr("r", POINT_R)
          .attr("stroke", COLOR)
          .attr("fill", COLOR)
          .attr("stroke-width", 0)
          .on("mouseover.tooltip", add_tooltip(model_name))
          .on("mouseout.tooltip", remove_tooltip(model_name));

    const arrow_data = data.slice(0, -1);
    graph.select("g.tailpoints g." + model_name)
      .append("g")
        .classed("arrows", true)
        .selectAll("line")
        .data(arrow_data)
        .enter()
          .append("line")
            .attr("x1", function (d) {
              return x_scale(d[x_quantity.name]);
            })
            .attr("y1", function (d) {
              return y_scale(d[y_quantity.name]);
            })
            .attr("x2", function (d, i) {
              return x_scale(data[i+1][x_quantity.name]);
            })
            .attr("y2", function (d, i) {
              return y_scale(data[i+1][y_quantity.name]);
            })
            .attr("marker-end", "url(#arrowhead)")
            .style("stroke-width", 1.5)
            .style("stroke", "black")
            .style("fill", "black");

    if (model.graph_is_shown("tailpoints")) {
      _graph.show_tailpoints(model_name);
    } else {
      _graph.hide_tailpoints(model_name);
    }

    if (model.graph_is_shown("arrows")) {
      _graph.show_arrows(model_name);
    } else {
      _graph.hide_arrows(model_name);
    }
  }

  function add_tangent_triangle() {
    return function() {
      const container = _graph.fragment.querySelector("svg > g");
      const path = d3.event.target || d3.event.srcElement;
      const point = d3.mouse(container);

      let length_at_point = 0;
      let total_length = path.getTotalLength();
      const INTERVAL = 50;

      while (path.getPointAtLength(length_at_point).x < point[0] && 
          length_at_point < total_length) {
        length_at_point += INTERVAL;
      }

      length_at_point -= INTERVAL;

      while (path.getPointAtLength(length_at_point).x < point[0] && 
          length_at_point < total_length) {
        length_at_point++;
      }

      const x_scale = horizontal_axis.scale;
      const x_quantity = horizontal_axis.quantity;
      const y_scale = vertical_axis.scale;
      const y_quantity = vertical_axis.quantity;

      let prev;
      let next;
      let cur_px = path.getPointAtLength(length_at_point);
      let a;
      let b;

      if (length_at_point > 1 && length_at_point < total_length - 1) {

        prev = path.getPointAtLength(length_at_point - 1);
        next = path.getPointAtLength(length_at_point + 1);
        if (length_at_point > 10) {
          prev = path.getPointAtLength(length_at_point - 10);
        }
        if (length_at_point < total_length - 10) {
          next = path.getPointAtLength(length_at_point + 10);
        }

        const compute_a = function(p, n) {
          return (y_scale.invert(n.y) - y_scale.invert(p.y)) /
            (x_scale.invert(n.x) - x_scale.invert(p.x));
        };
        const compute_b = function(a, p) {
          return y_scale.invert(p.y) - a*x_scale.invert(p.x);
        };
        a = compute_a(prev, next);
        b = compute_b(a, cur_px);

      } else {
        // don't worry about the first and last pixel or so
        return;
      }

      let x1 = x_quantity.minimum;
      let x2;
      let y1;
      let y2;

      if (a > 0) {
        y2 = y_quantity.maximum;
      } else {
        y2 = y_quantity.minimum;
      }

      y1 = a*x1 + b;
      x2 = (y2 - b)/a;

      const tangent = graph.select("g.tangent_triangle line.tangent");
      tangent.style("pointer-events", "none");
      const SEP = GRAPH_LINE_WIDTH / 1.75;
      const STEP = GRAPH_LINE_WIDTH / 1.75;

      if (a >= 0) {
        tangent.attr("x1", x_scale(x1) - STEP)
          .attr("y1", y_scale(y1) - SEP)
          .attr("x2", x_scale(x2) - STEP)
          .attr("y2", y_scale(y2) - SEP);
      } else {
        tangent.attr("x1", x_scale(x1) - STEP)
          .attr("y1", y_scale(y1) + SEP)
          .attr("x2", x_scale(x2) - STEP)
          .attr("y2", y_scale(y2) + SEP);
      }

      const tangent_text = a.toFixed(y_quantity.precision || 0) + " " + y_quantity.unit + "/" + x_quantity.unit;

      speed_tooltip.html(tangent_text);
      const WIDTH = speed_tooltip.clientHeight || tangent_text.length*10;
      const X_SEP = 10;
      const Y_SEP = 30;

      speed_tooltip
        .style("left", d3.event.pageX - WIDTH - X_SEP + "px")     
        .style("top", d3.event.pageY - Y_SEP + "px")
        .style("opacity", 0.7);

      graph.select("g.tangent_triangle").style("visibility", "visible");
    };
  }

  function remove_tangent_triangle() {
    return function() {
      graph.select("g.tangent_triangle")
        .style("visibility", "hidden");
      speed_tooltip.style("opacity", 0);
    };
  }

  function draw_line(model_name) {
    const model = _graph.get_model(model_name).model;
    const data = model.data();
    const x_scale = horizontal_axis.scale;
    const x_quantity = horizontal_axis.quantity;
    const y_scale = vertical_axis.scale;
    const y_quantity = vertical_axis.quantity;

    const line = d3.line()
      .x(function(d) {
        return x_scale(d[x_quantity.name]);
      })
      .y(function(d) {
        return y_scale(d[y_quantity.name]);
      })
      .curve(d3.curveCardinal.tension(1));

    let model_line = _graph.fragment.querySelector("svg g.lines g." + model_name);
    if (model_line) {
      model_line.parentNode.removeChild(model_line);
    }

    const lines = graph.select("g.lines")
      .append("g")
        .classed(model_name, true)
        .classed("line", true)
        .classed("extensible", model.extensible === true);

    lines
        .selectAll("path")
        .data([data])
        .enter()
          .append("path")
            .attr("d", line)
            .attr("class", "graph")
            .attr("fill", "none")
            .attr("stroke", model.color || "red")
            .style("stroke-width", GRAPH_LINE_WIDTH)
            .on("mouseover.tooltip", add_tooltip(model_name))
            .on("mousemove.tooltip", add_tooltip(model_name))
            .on("mouseout.tooltip", remove_tooltip(model_name))
            .on("mouseover.tangent_triangle", add_tangent_triangle(model_name))
            .on("mousemove.tangent_triangle", add_tangent_triangle(model_name))
            .on("mouseout.tangent_triangle", remove_tangent_triangle(model_name));

    // The graph of the extensible highball glass can be moved around as it
    // should be able to act as a tangent line.
    if (model.extensible) {
      const MOVE_HANDLE_SIZE = 10;
      const MID_POINT = data[Math.floor(data.length / 2)];
      const MID_HORIZONTAL = x_scale(MID_POINT[x_quantity.name]);
      const MID_VERTICAL = y_scale(MID_POINT[y_quantity.name]);
      const OFFSET = 50;

      let currentTranslate = {};

      let translateString = function (t) {
        return "translate(" + t.x + ", " + t.y + ")";
      };
          
      lines.attr("transform", translateString(model.translate));

      const startDragging = function (_, index, gs) {
        if (0 < gs.length) {
          currentTranslate.x = model.translate.x;
          currentTranslate.y = model.translate.y;
        }
      };

      const moveDragging = function (_, index, gs) {
        const group = gs[0];
        const dragEvent = d3.event;
        currentTranslate.x = currentTranslate.x + dragEvent.dx;
        currentTranslate.y = currentTranslate.y + dragEvent.dy;
        group.setAttribute("transform", translateString(currentTranslate));
      };

      const endDragging = function () {
        model.translate.x = currentTranslate.x;
        model.translate.y = currentTranslate.y;
        currentTranslate = {};
      };

      const dragLine = d3.drag()
        .on("start", startDragging)
        .on("drag", moveDragging)
        .on("end", endDragging)
        ;

      const handle = lines.append("circle")
            .classed("drag-handle", true)
            .attr("cx", MID_HORIZONTAL)
            .attr("cy", MID_VERTICAL + OFFSET)
            .attr("r", MOVE_HANDLE_SIZE)
            .attr("fill", model.color)
            .attr("stroke", model.color)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0)
            ;
      
      const showHandleSetting = $("input[name='graph-options'][value='move-highball']").prop("checked");
      if (!showHandleSetting || data.length <= 0) {
        handle.style("display", "none");
      }
      lines.call(dragLine);
    }

    if (model.graph_is_shown("line")) {
      _graph.show_line(model_name);
    } else {
      _graph.hide_line(model_name);
    }
  }
  
  function update_lines() {
    Object.keys(_graph.models).forEach(draw_line);
  }

  function update_tailpoints() {
    Object.keys(_graph.models).forEach(draw_tailpoints);
  }

  function set_axis(quantity_name, orientation) {
    const axes_g = svg.select("g.axes");
    const quantity = _graph.quantities[quantity_name];
    const create_scale = function(quantity, orientation) {
      let range;
      if (orientation === "horizontal") {
        range = [0, GRAPH.width];
      } else {
        range = [GRAPH.height, 0];
      }

      let maximum = quantity.maximum;
      if ("hoogte" === quantity_name && config.world_height) {
        maximum = config.world_height;
      }

      return d3.scaleLinear()
        .range(range)
        .domain([quantity.minimum, maximum]);
    };
    const scale = create_scale(quantity, orientation);

    const create_axis = function(quantity, orientation) {
      let axis;
      if (orientation === "horizontal") {
        axis = d3.axisBottom()
          .scale(scale)
          .tickSizeInner(3);
      } else {
        axis = d3.axisLeft()
          .scale(scale)
          .tickSizeInner(3);
      }
      return axis;
    };

    const axis = create_axis(quantity, orientation);

    if (orientation === "horizontal") {
      horizontal = quantity_name;
      const xaxisg = _graph.fragment.querySelector("g.x.axis");
      if (xaxisg) {
        xaxisg.parentNode.removeChild(xaxisg);
      }

      axes_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + GRAPH.height + ")")
        .call(axis);

      const xgridg = _graph.fragment.querySelector("g.x.grid");
      if (xgridg) {
        xgridg.parentNode.removeChild(xgridg);
      }

      axes_g.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + GRAPH.height + ")")
        .call(axis.tickSize(- GRAPH.height, 0, 0).tickFormat(""));

      const xlabel = _graph.fragment.querySelector("text.x.label");
      if (xlabel) {
        xlabel.parentNode.removeChild(xlabel);
      }

      axes_g.append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "x label")
          .text(quantity.label)
            .attr('x', GRAPH.width / 2)
            .attr('y', CONTAINER.height - MARGINS.bottom / 4);

      horizontal_axis = {
        quantity: quantity,
        scale: scale,
        axis: axis
      };
    } else {
      // vertical axis
      vertical = quantity_name;
      const yaxisg = _graph.fragment.querySelector("g.y.axis");
      if (yaxisg) {
        yaxisg.parentNode.removeChild(yaxisg);
      }

      axes_g.append("g")
        .attr("class",  "y axis")
        .call(axis);

      const ygridg = _graph.fragment.querySelector("g.y.grid");
      if (ygridg) {
        ygridg.parentNode.removeChild(ygridg);
      }

      axes_g.append("g")
        .attr("class", "y grid")
        .call(axis.tickSize(-1 * GRAPH.width, 0, 0).tickFormat(""));

      const ylabel = _graph.fragment.querySelector("text.y.label");
      if (ylabel) {
        ylabel.parentNode.removeChild(ylabel);
      }

      axes_g.append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "y label")
          .text(quantity.label)
            .attr('transform', 'rotate(-270,0,0)')
            .attr('x', GRAPH.height / 2)
            .attr('y', MARGINS.left * 0.9 );

      vertical_axis = {
        quantity: quantity,
        scale: scale,
        axis: axis
      };
    }

    update_lines();
    update_tailpoints();
  }

  function create_graph() {
    graph.append("g")
      .classed("axes", true);

    set_axis(horizontal, "horizontal");
    set_axis(vertical, "vertical");

    graph.append("g")
      .attr("class", "lines");

    graph.append("g")
      .attr("class", "tailpoints");

    graph.append("g")
      .classed("tangent_triangle", true)
      .style( "visibility", "hidden")
      .append("line")
      .classed("tangent", true)
      .style("stroke-width", GRAPH_LINE_WIDTH / 2)
      .style( "stroke", "crimson");
  }
  create_graph();
  _graph.update_all();


  _graph.remove = function(model_name) {
    const model_line = _graph.fragment
      .querySelector("svg g.lines g." + model_name);
    if (model_line) {
      model_line.parentNode.removeChild(model_line);
    }

    const model_tailpoints = _graph.fragment
      .querySelector("svg g.tailpoints g." + model_name);
    if (model_tailpoints) {
      model_tailpoints.parentNode.removeChild(model_tailpoints);
    }
  };

  _graph.update_all = function() {
    _graph.compute_extrema();
    set_axis(horizontal, "horizontal");
    set_axis(vertical, "vertical");
    Object.keys(_graph.models).forEach(_graph.update);
  };

  _graph.update = function(model_name) {
    draw_line(model_name);
    draw_tailpoints(model_name);
  };

  _graph.show_arrows = function(model_name) {
    const model_arrows = _graph.fragment
      .querySelector("svg g.tailpoints g." + model_name + " g.arrows" );

    if (model_arrows) {
      model_arrows.style.visibility = "visible";
    }
  };

  _graph.hide_arrows = function(model_name) {
    const model_arrows = _graph.fragment
      .querySelector("svg g.tailpoints g." + model_name + " g.arrows" );

    if (model_arrows) {
      model_arrows.style.visibility = "hidden";
    }
  };

  _graph.show_tailpoints = function(model_name) {
    const model_tailpoints = _graph.fragment
      .querySelector("svg g.tailpoints g." + model_name);
    if (model_tailpoints) {
      model_tailpoints.style.visibility = "visible";
    }
  };

  _graph.hide_tailpoints = function(model_name) {
    const model_tailpoints = _graph.fragment
      .querySelector("svg g.tailpoints g." + model_name);
    if (model_tailpoints) {
      model_tailpoints.style.visibility = "hidden";
    }
  };


  _graph.show_line = function(model_name) {
    const model_line = _graph.fragment
      .querySelector("svg g.lines g." + model_name);
    if (model_line) {
      model_line.style.visibility = "visible";
    }
  };

  _graph.hide_line = function(model_name) {
    const model_line = _graph.fragment
      .querySelector("svg g.lines g." + model_name);
    if (model_line) {
      model_line.style.visibility = "hidden";
    }
  };

  return _graph;
};

module.exports = graph;
