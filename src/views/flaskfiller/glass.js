/*
 * Copyright 2012, 2013, 2016 Huub de Beer <Huub@heerdebeer.org>
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
const glass = function(canvas, model, SCALE, snap_values) {
  const _glass = canvas.set();
  const GLASS_BORDER = 3;
  const PADDING = 5;

  let x = 0, 
  y = 0, 
  width, 
  height;

  function update() {
    fill.attr("fill", model.color());
    _glass.draw_at(_glass.x, _glass.y);
  }

  var fill, base_shape, bowl_shape, max_line, max_label, label, glass_pane;

  function draw() {
    label = canvas.text(x, y, model.get_maximum("volume") + " ml");
    label.attr({
    });
    _glass.push(label);
    fill = canvas.path(model.bowl_path(SCALE, true));
    fill.attr({
      fill: model.color(),
      stroke: "none",
      opacity: 0.4
    });
    _glass.push(fill);

    max_line = canvas.path("M0,0");
    max_line.attr({
      stroke: "dimgray",
      "stroke-width": 1
    });
    _glass.push(max_line);

    max_label = canvas.text(x, y, "max");
    max_label.attr({
      stroke: "none",
      fill: "dimgray",
      "font-family": "inherit",
      "font-size": "10pt"
    });
    _glass.push(max_label);

    bowl_shape = canvas.path(model.bowl_path(SCALE));
    bowl_shape.attr({
      "stroke": "black",
      "stroke-width": GLASS_BORDER,
      "fill": "none"
    });
    _glass.push(bowl_shape);  

    base_shape = canvas.path(model.base_path(SCALE));
    base_shape.attr({
      "stroke": "black",
      "stroke-width": GLASS_BORDER,
      "fill": "dimgray",
      "fill-opacity": 0.1
    });
    _glass.push(base_shape);  

    glass_pane = canvas.path(model.path(SCALE));
    glass_pane.attr({
      fill: "white",
      opacity: 0,
      stroke: "white",
      "stroke-opacity": 0,
      "stroke-width": GLASS_BORDER
    });
    _glass.push(glass_pane);

    var bbox = _glass.getBBox();
    width = bbox.width;
    height = bbox.height;

    set_label();

    glass_pane.hover(onhover, offhover);
    glass_pane.drag(onmove, onstart, onend);

    glass_pane.dblclick(run_pause);
  }

  function run_pause() {
    if (model.is_finished()) {
      model.action("reset").callback(model)();
    } else {
      model.action("start").callback(model)();
    }
  }

  function set_label(x_, y_) {
    if (arguments.length < 2) {
      return;
    }
    var bowlbb = bowl_shape.getBBox(),
    bowl_width = bowlbb.width,
    bowl_height = bowlbb.height;

    var x = x_, y = y_;

    label.attr({
      x: x,
      y: y + bowl_height/2,
      "font-size": compute_font_size(),
      text: model.get_maximum("volume") + " ml"
    });
    function compute_font_size() {
      return Math.max((((bowl_width - 2*PADDING)/ ((model.get_maximum("volume") + "").length + 3)) - PADDING), 8) + "px";
    }
  }
  _glass.set_label = set_label;

  var delta_x = 0, delta_y = 0;
  function onmove(dx, dy) {
    let new_x = _glass.x + dx;
    new_x = Raphael.snapTo(_glass.get_snap_values(), new_x);
    delta_x = new_x - _glass.x;
    delta_y = dy;
    _glass.draw_at(new_x, _glass.y+dy);
  }

  function onstart() {
    model.action("pause").callback(model)();
    delta_x = 0;
    delta_y = 0;
  }

  function onend() {
    _glass.x += delta_x;
    _glass.y += delta_y;
    _glass.set_snap_value();
  }

  function onhover() {
    _glass.attr({
      "cursor": "move"
    });
  }

  function offhover() {
    _glass.attr({
      "cursor": "default"
    });
  }

  _glass.draw_at = function (x, y) {
    _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
    _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
    _glass.base_shape.attr({path: model.base_path(SCALE, x, y)});
    _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
    var MAX_LINE_WIDTH = Math.min(30, width / 2),
    MAX_LINE_SKIP = 5,
    BORDERS_ADD = _glass.bowl_shape.attr("stroke-width") * 2,
    MAX_LINE_Y = y + height - model.get_maximum("height") * 10 * SCALE - BORDERS_ADD,
    INTERSECTIONS = Raphael.pathIntersection(
        _glass.bowl_shape.attr("path"),
        "M0," + (MAX_LINE_Y) + "h1000"),
    MAX_LINE_X = Math.min.apply(null,INTERSECTIONS.map(function(e) {return e.x;})) || x;
   
    MAX_LINE_X = Infinity === MAX_LINE_X ? x :  MAX_LINE_X;
    
    _glass.max_line.attr({
      path: "M" + MAX_LINE_X + "," + MAX_LINE_Y + 
        "h" + MAX_LINE_WIDTH
    });
    _glass.max_label.attr({
      x: MAX_LINE_X + MAX_LINE_WIDTH / 1.5,
      y: MAX_LINE_Y - MAX_LINE_SKIP            
    });

    _glass.set_label(x, y);
  };

  function draw_at_bottom(boundaries, distance_from_left) {
    var bbox = _glass.glass_pane.getBBox(),
    width = _glass.width,
    height = _glass.height,
    x = Math.min(boundaries.x + (distance_from_left || width), boundaries.x + (boundaries.width - width)),
    y = boundaries.y + boundaries.height - height + 2*_glass.bowl_shape.attr("stroke-width");

    _glass.draw_at(x, y);
    _glass.x = x;
    _glass.y = y;
  }
  _glass.draw_at_bottom = draw_at_bottom;

  function update_color() {
    fill.attr("fill", model.color());
  }

  function set_snap_value() {
    snap_values[model.name] = _glass.x;
  }

  function get_snap_values() {
    return Object.keys(snap_values).map(function (m) {return snap_values[m];});
  }

  draw();

  _glass.height = height;
  _glass.width = width;
  _glass.x = x;
  _glass.y = y;
  _glass.draw = draw;
  _glass.update = update;
  _glass.update_color = update_color;
  _glass.fill = fill;
  _glass.label = label;
  _glass.bowl_shape = bowl_shape;
  _glass.base_shape = base_shape;
  _glass.max_line = max_line;
  _glass.max_label = max_label;
  _glass.glass_pane = glass_pane;
  _glass.set_snap_value = set_snap_value;
  _glass.get_snap_values = get_snap_values;
  
  return _glass;
};

module.exports = glass;
