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

const glass = require("./glass");

const highball_glass = function(canvas, model, SCALE, snap_values, boundaries_) {
    const HANDLE_SPACE = 15;
    const    HANDLE_SIZE = 2.5;
    const PADDING = 5;

    let _glass = glass(canvas, model, SCALE, snap_values, boundaries_);

    _glass.handle = canvas.circle( 
            _glass.x + _glass.width + HANDLE_SPACE, 
            _glass.y - HANDLE_SPACE, 
            HANDLE_SIZE);
    _glass.handle.attr({
        fill: "silver",
        "stroke": "silver"
    });
    _glass.push(_glass.handle);
    _glass.handle.hover(enable_resizing, disable_resizing);
    _glass.handle.drag(sizemove, sizestart, sizestop);

    let old_height, old_radius, delta_x, delta_y;
    function sizemove(dx, dy) {
        let d_height = dy / SCALE / 10;
        let d_radius = dx / 2 / SCALE / 10;
        let new_radius = old_radius + d_radius;
        let new_height = old_height - d_height;
        let area = Math.PI * new_radius * new_radius;


        if (area*new_height >= 5){
            delta_y = dy;
            model.height(new_height);
            model.radius(new_radius);
            _glass.draw_at(_glass.x, _glass.y+dy);
        }

    }

    function sizestart() {
        delta_x = 0;
        delta_y = 0;
        old_height = model.height();
        old_radius = model.radius();
        model.action("reset").callback(model)();
    }

    function sizestop() {
        _glass.y += delta_y;
        model.get_views_of_type("graph").forEach(function(v) {v.update_all();});
    }

    function enable_resizing() {
        _glass.handle.attr({
            fill: "yellow",
            stroke: "black",
            "stroke-width": 2,
            r: HANDLE_SIZE * 1.5,
            cursor: "nesw-resize"
        });
        _glass.glass_pane.attr({
            fill: "lightyellow",
            opacity: 0.7
        });
    }

    function disable_resizing() {
        _glass.handle.attr({
            fill: "silver",
            stroke: "silver",
            "stroke-width": 1,
            r: HANDLE_SIZE,
            cursor: "default"
        });
        _glass.glass_pane.attr({
            fill: "white",
            opacity: 0
        });
    }

    function update_size() {
        const bbox = _glass.glass_pane.getBBox();

        _glass.width = bbox.width;
        _glass.height = bbox.height;
    }

    _glass.draw_at = function (x, y) {
        _glass.fill.attr({path: model.bowl_path(SCALE, true, x, y)});
        _glass.bowl_shape.attr({path: model.bowl_path(SCALE, false, x, y)});
        _glass.base_shape.attr({path: model.base_path(SCALE, x, y)});
        _glass.glass_pane.attr({path: model.path(SCALE, false, x, y)});
        update_size();
        const MAX_LINE_WIDTH = Math.min(30, _glass.width / 2);
        const MAX_LINE_SKIP = 5;
        const MAX_LINE_Y = y + _glass.height - model.get_maximum("height") * 10 * SCALE;

        _glass.max_line.attr({
            path: "M" + x + "," + MAX_LINE_Y + 
                "h" + MAX_LINE_WIDTH
        });
        _glass.max_label.attr({
            x: x + MAX_LINE_WIDTH / 1.5,
            y: MAX_LINE_Y - MAX_LINE_SKIP            
        });

        _glass.handle.attr({
            cx: x + _glass.width + HANDLE_SPACE, 
            cy: y - HANDLE_SPACE
        });
        _glass.set_label(x, y);
    };

    _glass.set_label = function(x_, y_) {
        let x = x_, y = y_;
        model.compute_maxima();
        _glass.label.attr({
            x: x + _glass.width / 2,
            y: y + _glass.height/2,
            "font-size": compute_font_size(),
            text: model.get_maximum("volume") + " ml"
        });

        function compute_font_size() {
            return Math.max((_glass.width - 2*PADDING)/ ((model.get_maximum("volume") + "").length + 3) - PADDING), 8 + "px";
        }
    };

    _glass.set_snap_value = function() {
      snap_values[model.name] = _glass.x + _glass.width / 2;
    };

    _glass.get_snap_values = function() {
      return Object.keys(snap_values).map(function (m) {return snap_values[m] - _glass.width / 2;});
    };

    return _glass;
};

module.exports = highball_glass;
