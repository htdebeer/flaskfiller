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
const model = require("./model");

/**
 * height in cm
 * radius in cm
 * flow_rate in ml/sec
 *
 */
const highball_glass = function(name, config) {
  let radius = config.radius || 2;
  let height = config.height || 7.5;
  let flow_rate = config.flow_rate || 50;

  /**
   * Compute the volume in ml in the highball glass given flow_rate and time the
   * water has flown in seconds.
   */
  function compute_volume(time) {
    return time * flow_rate;
  }


  /**
   * Compute the height of the water in cm given the volume of the water in
   * the glass in ml.
   */
  function compute_height(volume) {
    const area = Math.PI * Math.pow(radius, 2);
    if (area > 0) {
      return volume / area;
    } else {
      return 0;
    }
  }
  
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
    end: quantities.time.maximum*1000,
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
    const actions = {},
    create_action = function(action_name) {
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

  let speed = 0;
  function compute_speed() {
    const EPSILON = 0.01;
    speed = (compute_height(compute_volume(1)) - compute_height(compute_volume(1 - EPSILON))) / EPSILON;
  }

  function compute_maxima() {
    const area = Math.PI * Math.pow(radius, 2);
    const time_max = Math.floor(area*height*10 / flow_rate)/10;
    const volume_max = time_max * flow_rate;
    const height_max = volume_max / area;

    _model.set_end(time_max);

    _model.quantities.time.maximum = time_max.toFixed(quantities.time.precision);
    _model.quantities.height.maximum = height_max.toFixed(quantities.height.precision);
    _model.quantities.volume.maximum = volume_max.toFixed(quantities.volume.precision);

    _model.quantities.speed.minimum = speed-1;
    _model.quantities.speed.maximum = speed+1;
  }

  compute_maxima();

  _model.measure_moment = function(moment) {
    const time_in_ms = _model.moment_to_time(moment);
    const time = time_in_ms / 1000;
    const volume = compute_volume(time);
    const height = compute_height(volume);

    return {
      time: time,
      volume: volume,
      height: height,
      speed: speed
    };
  };

  _model.bowl_path = function(SCALE, fill, x_, y_) {
    let x = x_ || 0;
    let y = y_ || 0;
    let h = height * SCALE * 10;

    if (fill) {
      h = _model.get("height") * SCALE * 10;
      y += height * SCALE * 10 - h;
    }

    let path = "M" + x + "," + y;
    path += "v" + h;
    path += "h" + radius * 2 * SCALE * 10;
    path += "v-" + h;
    return path;
  };

  _model.base_path = function() {
    return "M0,0";
  };

  _model.path = _model.bowl_path;

  _model.step();
  _model.compute_maxima = compute_maxima;
  _model.type = "highball";
  _model.height = function(h) {
    if (arguments.length === 1) {
      height = h;
      compute_speed();
      _model.reset_model();
      compute_maxima();
      _model.update_all_views();
    }
    return height;
  };
  _model.radius = function(r) {
    if (arguments.length === 1) {
      radius = r;
      compute_speed();
      _model.reset_model();
      compute_maxima();
      _model.update_all_views();
    }
    return radius;
  };
  _model.flow_rate = function(fr) {
    if (arguments.length === 1) {
      flow_rate = fr;
      compute_speed();
      _model.reset_model();
      compute_maxima();
      _model.update_all_views();
    }
    return flow_rate;
  };

  return _model;
};

module.exports = highball_glass;
