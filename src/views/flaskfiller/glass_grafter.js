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
const dom = require("../../dom");
const ruler = require("./ruler");
const contour_line = require("./contour_line");

const glass_grafter = function(config) {
  const _grafter = {};

  const scale = config.scale || config.shape ? config.shape.scale || 3 : 3; // px per mm
  const shape = config.shape || {
    bowl: {
      top: {
        x: 100,
        y: 0
      },
      bottom: {
        x: 10,
        y: 100
      },
      path: "l-90,100"
    },
    base: {
      top: {
        x: 10,
        y: 100
      },
      bottom: {
        x: 70,
        y: 200
      },
      path: "l0,90 l50,0 c5,2.5,7.5,7.5,10,10"
    },
    scale: scale
  };

  const dimensions = config.dimensions || {
    width: 600,
    height: 500,
    ruler_width: 30,
    margins: {
      left: 5,
      right: 5,
      top: 5,
      bottom: 5
    }
  };

  const CONTAINER = {
    width: dimensions.width || 900,
    height: dimensions.height || 600
  };

  const HALF_WIDTH = (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width;

  const MIRROR_AREA = {
    x: dimensions.margins.left,
    y: dimensions.margins.top,
    width: HALF_WIDTH,
    height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
  };

  const CONSTRUCTION_AREA = {
    x: MIRROR_AREA.x + MIRROR_AREA.width,
    y: dimensions.margins.top,
    width: HALF_WIDTH,
    height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.bottom - dimensions.margins.top
  };

  const RULERS = {
    horizontal: {
      x:  CONSTRUCTION_AREA.x,
      y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
      width: (CONTAINER.width - dimensions.margins.left - dimensions.margins.right)/2 - dimensions.ruler_width,
      height: dimensions.ruler_width,
      scale: scale,
      orientation: "horizontal"
    },
    vertical: {
      x:  dimensions.margins.left + HALF_WIDTH*2,
      y:  0 + dimensions.margins.top,
      width: dimensions.ruler_width,
      height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
      scale: scale,
      orientation: "vertical",
      reverse: true
    }
  };

  _grafter.fragment = document
    .createDocumentFragment()
    .appendChild(dom.create({
      name: "figure",
      attributes: {
        "class": "glassgrafter"
      }
    }));

  // There is a bug in Raphael regarding placing text on the right
  // y-coordinate when the canvas isn't part of the DOM
  document.body.appendChild(_grafter.fragment);

  const canvas = Raphael(_grafter.fragment,
      CONTAINER.width,
      CONTAINER.height
      );

  const vertical_ruler = ruler(canvas, RULERS.vertical, CONTAINER.width)
    .style({
      "background": "white"
    });
  const horizontal_ruler = ruler(canvas, RULERS.horizontal, CONTAINER.height)
    .style({
      "background": "white"
    });

  const ACTION_PADDING = 5;
  const ACTION_WIDTH = 40;
  const ACTION_HEIGHT = 25;
  const ACTION_SEP = 5;
  const ACTION_AREA = {
    x: MIRROR_AREA.x,
    y: MIRROR_AREA.y + MIRROR_AREA.height + ACTION_PADDING
  };

  let construction_background;
  let mirror_background;

  function draw() {
    construction_background = canvas.rect(CONSTRUCTION_AREA.x,
        CONSTRUCTION_AREA.y,
        CONSTRUCTION_AREA.width,
        CONSTRUCTION_AREA.height
        );
    construction_background.attr({
      stroke: "dimgray",
      "stroke-width": 2,
      fill: "white"
    });

    mirror_background = canvas.rect(MIRROR_AREA.x,
        MIRROR_AREA.y,
        MIRROR_AREA.width,
        MIRROR_AREA.height
        );
    mirror_background.attr({
      stroke: "dimgray",
      "stroke-width": 2,
      fill: "silver",
      "fill-opacity": 0.5
    });

  }

  function reshape(shape) {
    const bottom_y = CONSTRUCTION_AREA.y + CONSTRUCTION_AREA.height;
    const delta_x = HALF_WIDTH + dimensions.margins.left;
    const delta_y = bottom_y - shape.base.bottom.y;

    shape.base.bottom.y = shape.base.bottom.y + delta_y; 
    shape.base.bottom.x = shape.base.bottom.x + delta_x; 
    shape.base.top.y = shape.base.top.y + delta_y; 
    shape.base.top.x = shape.base.top.x + delta_x; 
    shape.bowl.bottom.y = shape.bowl.bottom.y + delta_y; 
    shape.bowl.bottom.x = shape.bowl.bottom.x + delta_x; 
    shape.bowl.top.y = shape.bowl.top.y + delta_y; 
    shape.bowl.top.x = shape.bowl.top.x + delta_x; 

    return shape;
  }

  draw();
  
  vertical_ruler.toFront();
  horizontal_ruler.toFront();

  const points = contour_line(canvas, reshape(shape), CONSTRUCTION_AREA);
  
  function draw_action(name, index) {
    const action = canvas.set();

    const x = ACTION_AREA.x + index*(ACTION_SEP + ACTION_WIDTH);
    const y = ACTION_AREA.y;

    const background = canvas.rect(x, y, ACTION_WIDTH, ACTION_HEIGHT);
    background.attr({
      fill: "gold",
      stroke: "dimgray"
    });
    action.push(background);

    const label = canvas.text(x + ACTION_WIDTH/2, y + ACTION_HEIGHT / 2, name);
    action.push(label);
    action.attr({

    });
    action.click(function() {
      points.current_action = name;
      if (name === "curve") {
        points.show_control_points();
      } else {
        points.hide_control_points();
      }
      console.log(points.current_action);
    });
    return action;
  }

  draw_action("remove", 0);
  draw_action("straight", 1);
  draw_action("curve", 2);

  function draw_cm_label() {
    const x = dimensions.margins.left + 2*HALF_WIDTH + dimensions.ruler_width / 2;
    const y = CONTAINER.height - dimensions.ruler_width / 2 - dimensions.margins.bottom;
    const cm_label = canvas.text(x, y, "cm");

    cm_label.attr({
      "font-family": "inherit",
      "font-size": "18pt",
      "font-weight": "bolder",
      "fill": "dimgray"
    }); 

    cm_label.click(function() {
      points.print_shape();
    });

    return cm_label;
  }

  draw_cm_label();

  mirror_background.toFront();

  // There is a bug in Raphael regarding placing text on the right
  // y-coordinate when the canvas isn't part of the DOM. It has been added
  // before and now removed again.
  document.body.removeChild(_grafter.fragment);
  
  return _grafter;
};

module.exports = glass_grafter;
