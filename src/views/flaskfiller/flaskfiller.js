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
const view = require("../view");
const dom = require("../../dom");
const ruler = require("./ruler");
const longdrink = require("./longdrink_glass");
const various_glass = require("./glass");

const flaskfiller = function(config) {
    var _flaskfiller = view(config);
    var dimensions = config.dimensions || {
        width: 900,
        height: 600,
        ruler_width: 30,
        margins: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        }
    };

    var CONTAINER = {
            width: dimensions.width || 900,
            height: dimensions.height || 600
        };
                

    const WORLD_HEIGHT_IN_PX = CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom;
    const WORLD_HEIGHT_IN_MM = config.world_height * 10;
    const scale = WORLD_HEIGHT_IN_PX / WORLD_HEIGHT_IN_MM;

    var RULERS = {
            horizontal: {
                x:  dimensions.ruler_width + dimensions.margins.left,
                y:  CONTAINER.height - dimensions.ruler_width - dimensions.margins.top,
                width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
                height: dimensions.ruler_width,
                scale: scale,
                orientation: "horizontal"
            },
            vertical: {
                x:  0 + dimensions.margins.left,
                y:  0 + dimensions.margins.top,
                width: dimensions.ruler_width,
                height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom,
                scale: scale,
                orientation: "vertical"
            }
        };

    var SIMULATION = {
            x:  dimensions.ruler_width + dimensions.margins.left,
            y:  0 + dimensions.margins.top,
            width: CONTAINER.width - dimensions.ruler_width - dimensions.margins.left - dimensions.margins.right,
            height: CONTAINER.height - dimensions.ruler_width - dimensions.margins.top - dimensions.margins.bottom
        };

    const snap_values = {};

    _flaskfiller.fragment = document
        .createDocumentFragment()
        .appendChild(dom.create({
            name: "figure",
            attributes: {
                "class": "flaskfiller"
            }
        }));

    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM
    document.body.appendChild(_flaskfiller.fragment);

    var canvas = Raphael(_flaskfiller.fragment, 
            CONTAINER.width, 
            CONTAINER.height);

    var vertical_ruler = ruler(canvas, RULERS.vertical, CONTAINER.width)
            .style({
                "background": "white"
            }),
        horizontal_ruler = ruler(canvas, RULERS.horizontal, CONTAINER.height)
            .style({
                "background": "white"
            }),
        cm_label = draw_cm_label();



    function draw_cm_label() {
       var x = dimensions.margins.left + (dimensions.ruler_width / 3),
           y = CONTAINER.height - (dimensions.ruler_width / 2) - dimensions.margins.bottom,
           cm_label = canvas.text(x, y, "cm");

       cm_label.attr({
           "font-family": "inherit",
           "font-size": "18pt",
           "font-weight": "bolder",
           "fill": "dimgray"
       }); 

       return cm_label;
    }


    function add_glass(model) {
        var glass;
        if (model.type === "longdrink") {
            glass = longdrink(canvas, model, scale, snap_values);
        } else {
            glass = various_glass(canvas, model, scale, snap_values);
        }
        glass.toFront();

        return glass;
    }

    function update_glass(glass) {
        glass.update_color();        
        glass.update();
    }

    _flaskfiller.update = function(model_name) {
        var model = _flaskfiller.get_model(model_name);

        if (!model.glass) {
            model.glass = add_glass(model.model);
            model.glass.draw_at_bottom(SIMULATION, Math.random() * SIMULATION.width);
        }

        update_glass(model.glass);
    };

    _flaskfiller.remove = function(model_name) {
        var model = _flaskfiller.get_model(model_name);
        model.glass.remove();
    };


    // There is a bug in Raphael regarding placing text on the right
    // y-coordinate when the canvas isn't part of the DOM. It has been added
    // before and now removed again.
    document.body.removeChild(_flaskfiller.fragment);
    return _flaskfiller;

};

module.exports = flaskfiller;
