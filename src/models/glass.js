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
const model = require("./model.js");
const paths = require("../path");

const glass = function(name, config) {
  const flow_rate = config.flow_rate || 50;
  const shape = config.shape;

  const quantities = {
    height: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'cm',
      name: "height",
      label: I18N.height_in_cm,
      stepsize: 0.01,
      monotone: true,
      precision: 2
    },
    volume: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'ml',
      name: "volume",
      label: I18N.volume_in_ml,
      stepsize: 0.1,
      monotone: true,
      precision: 1
    },
    time: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'sec',
      name: "time",
      label: I18N.time_in_sec,
      stepsize: 0.01,
      monotone: true,
      precision: 2
    },
    speed: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'cm/sec',
      name: 'speed',
      label: I18N.speed_in_cmsec,
      stepsize: 0.01,
      monotone: false,
      precision: 2
    }
  };

  const step = config.step || 10;
  const time = {
    start: 0,
    end: quantities.time.maximum * 1000,
    step: step
  };
  const action_list = config.actions || [
    "start", 
    "pause", 
    "reset", 
    "finish", 
    "toggle_line", 
    "toggle_tailpoints", 
    "toggle_arrows", 
    "step_size"
  ];
  const default_actions = require("../actions")({speed: step});

  function create_actions(action_list) {
    const actions = {};
    const create_action = function(action_name) {
      actions[action_name] = default_actions[action_name];
    };
    action_list.forEach(create_action);
    return actions;
  }

  const _model = model(name, {
    time: time,
    quantities: quantities,
    actions: create_actions(action_list)
  });

  let scaled_shape = paths.scale_shape(shape, shape.scale);
  let values = []; 

  _model.path = function(SCALE, fill, x_, y_) {
    if (scaled_shape.scale !== SCALE) {
      scaled_shape = paths.scale_shape(shape, SCALE);
    }

    const bowl = _model.bowl_path(SCALE, fill, x_, y_);
    const base = _model.base_path(SCALE, fill, x_, y_);
    const whole_glass = base + bowl;

    return whole_glass;
  };

  _model.base_path = function(SCALE, x_, y_) {
    if (scaled_shape.scale !== SCALE) {
      scaled_shape = paths.scale_shape(shape, SCALE);
    }
    
    const x = x_ || 0;
    const y = y_ || 0;
    const path = "M" + x + "," + y + paths.complete_path(scaled_shape.base) + "z";

    return path;
  };

  _model.bowl_path = function(SCALE, fill, x_, y_) {
    if (scaled_shape.scale !== SCALE) {
      scaled_shape = paths.scale_shape(shape, SCALE);
    }

    const x = x_ || 0;
    const y = y_ || 0;
    let path;

    if (fill) {
      const current_moment = _model.current_moment(true);
      const fill_length = values[current_moment].length * scaled_shape.factor;

      path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl,
          fill_length );
    } else {
      path = "M" + x + "," + y + paths.complete_path(scaled_shape.bowl);
    }

    return path;
  };

  function compute_quantities() {
    const scale = scaled_shape.scale;
    const px_to_cm = function(px) {
      return px / scale / 10;
    };
    const bowl = scaled_shape.bowl;
    const base = scaled_shape.base;
    const path = "M"+ bowl.top.x + "," + bowl.top.y + bowl.path;

    const ms_step = step / 1000;

    const h_start = px_to_cm(base.bottom.y - base.top.y);
    const l_start = 0;
    const l_end = Raphael.getTotalLength(path);

    function point(length) {
      return Raphael.getPointAtLength(path, length);
    }

    function ml_to_ms(ml) {
      return ml / flow_rate;
    }

    let h = h_start;
    let r;
    let area;
    let vol = 0;
    let time = 0;
    let speed = 0;

    let l = l_end-1;
    let prev = point(l);
    let cur = prev;
    let delta_time = 0;
    let delta_vol = 0;
    let delta_h = 0;

    const values = [{
      time: time,
      height: h,
      volume: vol,
      length: l,
      speed: speed
    }];

    while (l > l_start) {
      l -= 0.1;
      prev = cur;
      cur = point(l);
      r = px_to_cm((cur.x+prev.x)/2);
      area = Math.PI * r * r;

      delta_h = px_to_cm(Math.abs(prev.y - cur.y));
      delta_vol = area * delta_h;
      delta_time += ml_to_ms(delta_vol);

      h += delta_h;
      vol += delta_vol;

      if (delta_time >= ms_step ) {
        time += ms_step;
        vol = time * flow_rate;
        speed = (h - values[values.length - 1].height) / delta_time;

        values.push({
          time: time,
          height: h,
          volume: vol,
          length: l,
          speed: speed
        });

        delta_time = 0;
      }
    }

    values[0].speed = values[1].speed;
    return values;
  }

  function compute_maxima() {
    // Has to be computed before the model can be used. Probably time
    // intensive.
    //

    values = compute_quantities();

    const max = values[values.length - 1];
    const max_time_in_ms = (values.length - 1) * step;

    _model.set_end(max_time_in_ms / 1000);
    _model.quantities._time_.maximum = max_time_in_ms;

    _model.quantities.time.maximum = max.time.toFixed(quantities.time.precision);
    _model.quantities.height.maximum = max.height.toFixed(quantities.height.precision);
    _model.quantities.height.minimum = 0;
    _model.quantities.volume.maximum = max.volume.toFixed(quantities.volume.precision);

    _model.quantities.speed.maximum = Math.max.apply(null, values.map(function(v) {return v.speed;})) + 1;

    _model.quantities.speed.minimum = Math.min.apply(null, values.map(function(v) {return v.speed;})) - 1;
  }

  compute_maxima();

  _model.measure_moment = function(moment) {
    return values[moment];
  };

  _model.step();
  return _model;
};

module.exports = glass;
