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
const paths = require("../../path");

//  A contour line models the right-hand side of a glass. A contour line is a
//  list of points. A point has the following properties:
// 
//    ∙ x, the x coordinate
//    ∙ y, the y coordinate
//    ∙ border, border ∈ {none, foot, stem, bowl, edge}
//    ∙ segment, the line segment starting from this point to the next, if
//               there is a next point. A segment has the following
//               properties:
//      ∙ type, type ∈ {straight, curve}
//      ∙ c1, control point for this point, only when type = curve
//        ∙ x, the x coordinate of the control point
//        ∙ y, the y coordinate of the control point
//      ∙ c2, control point for the next point, only when type = curve
//        ∙ x, the x coordinate of the control point
//        ∙ y, the y coordinate of the control point
// 
//  For a contour line the followin holds:
// 
//    min.y ≤ edge.y ≤ bowl.y ≤ stem.y ≤ foot.y = max.y
//  ∧
//    (∀p: 0 ≤ p < |points| - 1: points[p].y < points[p+1].y)
//  ∧
//    (∀p: 0 ≤ p < |points|: mid.x ≤ points[p].x ≤ max.x)

const contour_line = function(canvas, shape_, BOUNDARIES) {

  const _contour_line = {};

  const points = [];
  let bottom_point;
  let marriage_point;
  let top_point;
  let original_x = 0;
  let original_y = 0;

  const bowl_path = canvas.path("M0,0");
  const base_path = canvas.path("M0,0");

  _contour_line.current_action = "remove";

  function normalize_shape(shape) {
    const MID_X = BOUNDARIES.x;
    shape.bowl.top.x -= MID_X;
    shape.bowl.bottom.x -= MID_X;
    shape.base.top.x -= MID_X;
    shape.base.bottom.x -= MID_X;
    return shape;
  }
  
  function draw() {
    const shape = normalize_shape(_contour_line.shape());
    const x = BOUNDARIES.x;
    const y = 0;

    bowl_path.attr({
      path: "M" + x + "," + y + paths.complete_path(shape.bowl)
    });

    base_path.attr({
      path: "M" + x + "," + y + paths.complete_path(shape.base) + "z"
    });
  }

  function remove_point(point) {
    if (point.type !== "part") {
      _contour_line.remove(point.index);    
    }
  }
  
  function curve_point(point) {
    const DIST = 10;
    point.segment.command = "c";
    point.segment.cp1 = {
      x: DIST,
      y: DIST
    };
    point.segment.cp2 = {
      x: - DIST,
      y: - DIST
    };
    draw();
  }

  function straight_point(point) {
    point.segment.command = "l";
    draw();
  }
  
  function action_on_point(point) {
    return function() {
      console.log("Action on point: ", point, _contour_line.curent_action);
      switch (_contour_line.current_action) {
        case "remove":
          remove_point(point);
          break;
        case "curve":
          curve_point(point);
          break;
        case "straight":
          straight_point(point);
          break;
      }
    };
  }
  
  function update_point(point, x, y) {
    if (point.name !== "top" && (
          point.prev().segment.command === "c" ||
          point.prev().segment.command === "l")) {
      point.prev().segment.x = x;
      point.prev().segment.y = y;
    }

    point.attr({
      "cx": x,
      "cy": y
    });
  }

  function start_move(point) {
    return function () {
      original_x = point.x();
      original_y = point.y();
    };
  }

  function end_move(point) {
    return function (event) {
      console.log(point, event);
    };
  }

  function move(point) {
    function moveable(new_x, new_y) {
      if (BOUNDARIES.x < new_x && new_x < BOUNDARIES.x + BOUNDARIES.width) {
        switch (point.name) {
          case "top":
            if (BOUNDARIES.y < new_y && new_y < point.next_point().y()) {
              return true;
            } else {
              return false;
            }
            break;
          case "bottom":
            return true;
          default:
            if (point.prev().y() < new_y && new_y < point.next_point().y()) {
              return true;
            } else {
              return false;
            }
        }
      } else {
        return false;
      }
      return true;
    }

    return function (dx, dy) {
      let new_x = original_x + dx;
      let new_y;    
      if (point.name === "bottom") {
        new_y = original_y;
      } else {
        new_y = original_y + dy;
      }
      if (moveable(new_x, new_y)) {
        update_point(point, new_x, new_y);
        draw();
      }
    };
  }

  function create_point(x, y, type) {
    let r;
    let attributes;

    switch(type) {
      case "part":
        r = 3;
        attributes = {
          fill: "white",
          stroke: "black",
          "stroke-width": 2
        };
        break;
      case "segment":
        r = 2;
        attributes = {
          fill: "black",
          stroke: "black"
        };
        break;
      case "control":
        r = 2;
        attributes = {
          fill: "silver",
          stroke: "silver"
        };
        break;
    }

    const point = canvas.circle(x, y, r);
    point.type = type;
    point.x = function() {return this.attr("cx");};
    point.y = function() {return this.attr("cy");};
    point.attr({
      cursor: "move"
    });

    point.control_points = canvas.set();
    point.control_points.cp1 = canvas.circle(0, 0, 3);
    point.control_points.cp1.attr({
      fill: "yellow",
      stroke: "blue",
      cursor: "move"
    });
    point.control_points.cp2 = canvas.circle(0, 0, 3);
    point.control_points.cp2.attr({
      fill: "yellow",
      stroke: "blue",
      cursor: "move"
    });
    point.control_points.push(point.control_points.cp1);
    point.control_points.push(point.control_points.cp2);
    point.control_points.hide();

    point.index = -1;
    point.next_point = function() {
      if (this.index < points.length - 1) {
        return points[this.index + 1];
      }
      return null;
    };
    point.prev = function() {
      if (this.index > 0) {
        return points[this.index - 1];
      }
      return null;
    };
    point.attr(attributes);
    point.drag( move(point), start_move(point), end_move(point) );
    point.dblclick(action_on_point(point));

    return point;
  }

  function show_control_points() {
    points.forEach(function(point, index) {
      const previousPoint = points[index > 0 ? index - 1 : 0];
      console.log("showing control points for: ", point);
      if (point.segment.command === "c") {
        point.control_points.cp1.attr({
          cx: previousPoint.x() + point.segment.cp1.x,
          cy: previousPoint.y() + point.segment.cp1.y
        });
        point.control_points.cp2.attr({
          cx: point.x() + point.segment.cp2.x,
          cy: point.y() - point.segment.cp2.y
        });
        point.control_points.show();
      }
    });
  }
  _contour_line.show_control_points = show_control_points;

  function hide_control_points() {
    points.forEach(function(point) {
      point.control_points.hide();
    });
  }
  _contour_line.hide_control_points = hide_control_points;

  function parse_segment(segment) {
    const command = segment.charAt(0);
    const elts = segment.slice(1).split(/ |,/);
    const specification = {
      command: command
    };

    console.log("Parse segement: ", segment, command, elts);

    switch (command) {
      case "v":
        specification.length = parseFloat(elts[0]);
        break;
      case "h":
        specification.length = parseFloat(elts[0]);
        break;
      case "l":
        specification.x = parseFloat(elts[0]);
        specification.y = parseFloat(elts[1]);
        break;
      case "c":
        specification.cp1 = {
          x: parseFloat(elts[0]),
          y: parseFloat(elts[1])
        };
        specification.cp2 = {
          x: parseFloat(elts[2]),
          y: parseFloat(elts[3])
        };
        specification.x = parseFloat(elts[4]);
        specification.y = parseFloat(elts[5]);
        break;
    }
    return specification;
  }

  _contour_line.insert = function(x, y, index, type, segment) {
    const point = create_point(x, y, type);

    if (segment.command !== "c") {
      segment.cp1 = {
        x: 0,
        y: 0
      };
      segment.cp2 = {
        x: 0,
        y: 0
      };
    }
    point.segment = segment;
    point.name = "";

    point.index = index;

    points.forEach(function(point) {
      if (point.index >= index) {
        point.index++;
      }
    });
    points.splice(index, 0, point);
    return point;
  };

  _contour_line.remove = function(index) {
    const point = points[index];
    if (point.type === "part") {
      throw new Error("cannot remove part-point");
    }

    const prev = point.prev();
    const next = point.next_point();

    prev.segment = {
      command: "l",
      x: next.x() - prev.x(),
      y: next.y() - prev.y()
    };
    point.remove();
    delete points[index];
    points.forEach(function(point) {
      if (point.index > index) {
        point.index--;
      }
    });
    points.splice(index, 1);
    draw();
  };
  
  function convert_to_user_coords(x, y) {
    const svgbb = canvas.canvas.getBoundingClientRect();
    const plus_left = svgbb.left +  window.pageXOffset;
    const plus_top = svgbb.top + window.pageYOffset;

    return {
      x: x - plus_left,
      y: y - plus_top
    };
  }

  
  function add_point(event, x_, y_) {
    // find point directly above

    const user_coords = convert_to_user_coords(x_, y_);
    const x = user_coords.x;
    const y = user_coords.y;

    let next_index = 0;
    while (points[next_index].y() < y) {
      next_index++;
    }

    const point = _contour_line.insert(x, y, next_index, "segment", {command: "l"});

    point.segment.x = point.next_point().x() - x;
    point.segment.y = point.next_point().y() - y;
    point.prev().segment.x = x - point.prev().x();
    point.prev().segment.y = y - point.prev().y();

    draw();

  }


  function populate_points(shape) {
    let part = shape.bowl;
    let path = part.path;
    let segments = path.split(/ /);

    let i = 0;
    let next_point;
    let x = part.top.x;
    let y = part.top.y;
    
    function add_point(segments, x, y, index, type, addendum) {
      let new_x = x;
      let new_y = y;
      let add_to_index = addendum || 0;

      let segment_string = segments[index] || "";
      let segment = parse_segment(segment_string) || [];

      _contour_line.insert(
          x,
          y,
          index + add_to_index,
          type,
          segment
          );

      switch (segment.command) {
        case "v":
          new_y = y + segment.length;
          break;
        case "l":
          new_x = x + segment.x;
          new_y = y + segment.y;
          break;
        case "c":
          new_x = x + segment.x;
          new_y = y + segment.y;
          break;
        case "h":
          new_x = x + segment.length;
          break;
        default:
          new_x = 0;
          new_y = 0;
          break;
      }

      return {
        x: new_x,
        y: new_y
      };
    }

    next_point = add_point(segments, x, y, i, "part");
    top_point = points[i];
    top_point.name = "top";
    i++;

    while (i < segments.length) {
      next_point = add_point(segments, next_point.x, next_point.y, i, "segment");
      i++;
    }

    const bowl_number_of_points = i;

    part = shape.base;
    path = part.path;
    segments = path.split(/ /);
    i = 0;
    x = part.top.x;
    y = part.top.y;

    next_point = add_point(segments, x, y, i, "part", bowl_number_of_points);
    marriage_point = points[bowl_number_of_points];
    marriage_point.name = "marriage";
    i++;

    while (i < segments.length) {
      next_point = add_point(segments, next_point.x, next_point.y, i, "segment", bowl_number_of_points);
      i++;
    }

    add_point([], next_point.x, next_point.y, i, "part", bowl_number_of_points);
    bottom_point = points[i+bowl_number_of_points];
    bottom_point.name = "bottom";
  }

  function path_segment(point) {
    let path = "";
    const next = point.next_point();

    const x = next.x() - point.x();
    const y = next.y() - point.y();

    switch (point.segment.command) {
      case "v":
        path = "v" + point.segment.length;
        break;
      case "h":
        path = "h" + point.segment.length;
        break;
      case "l":
        path = "l" + x + "," + y;
        break;
      case "c":
        path = "c" + point.segment.cp1.x + "," + point.segment.cp1.y + "," +
          point.segment.cp2.x + "," + point.segment.cp2.y + "," +
          x + "," + y;
        break;
    }
    return path;
  }


  function part_path(start) {
    let cur = start;
    const paths = [];

    paths.push(path_segment(cur));
    while (cur.next_point().type !== "part") {
      cur = cur.next_point();
      paths.push(path_segment(cur));
    }
    return paths.join(" ");
  }

  _contour_line.shape = function() {
    return {
      bowl: {
        top: {
          x: top_point.x(),
          y: top_point.y()
        },
        bottom: {
          x: marriage_point.x(),
          y: marriage_point.y()
        },
        path: part_path(top_point)
      },
      base: {
        top: {
          x: marriage_point.x(),
          y: marriage_point.y()
        },
        bottom: {
          x: bottom_point.x(),
          y: bottom_point.y()
        },
        path: part_path(marriage_point)
      },
      scale: shape_.scale
    };
  };



  base_path.attr({
    "stroke-width":2,
    "fill": "dimgray",
    "fill-opacity": 0.5
  });
  bowl_path.attr({
    "stroke-width": 2,
    "fill": "none"
  });

  bowl_path.click(add_point);
  base_path.click(add_point);

  const add_point_dot = canvas.circle(0,0,6);
  add_point_dot.attr({
    fill: "orange",
    "fill-opacity": 0.5,
    stroke: "dimgray"
  });
  add_point_dot.hide();


  populate_points(shape_);
  draw();
  _contour_line.print_shape = function() {
    const shape = normalize_shape(_contour_line.shape());
    console.log(JSON.stringify(shape));
  };
  _contour_line.bottom = bottom_point;
  _contour_line.marriage = marriage_point;
  _contour_line.top = top_point;
  return _contour_line;
};

module.exports = contour_line;
