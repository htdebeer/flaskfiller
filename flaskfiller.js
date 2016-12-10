(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
const actions = function() {
  const _actions = {};

  // Running model actions
  const running_models = {};
  let current_speed = 17; // refresh rate of about 60 updates per second  || config.speed || 10;

  _actions.speed = function( speed ) {
    if (arguments.length === 1) {
      current_speed = speed;
    }
    return current_speed;
  };

  const is_running =  function(model) {
    return running_models[model.name];
  };

  _actions.start = {
    name: "start",
    group: "run_model",
    icon: "fa-play",
    tooltip: I18N.start_simulation,
    enabled: true,
    callback: function(model) {

      const step = function() {
        if (!model.is_finished()) {
          model.step();
        } else {
          clearInterval(running_models[model.name]);
          delete running_models[model.name];
          model.disable_action("finish");
          model.disable_action("pause");
          model.disable_action("start");
          model.update_views();
        }
      };

      return function() {
        if (!is_running(model)) {
          running_models[model.name] = setInterval(step, current_speed);
        }
        model.disable_action("start");
        model.enable_action("pause");
        model.enable_action("reset");
        model.update_views();
      };
    }
  };

  _actions.pause = {
    name: "pause",
    group: "run_model",
    icon: "fa-pause",
    tooltip: I18N.pause_simulation,
    enabled: false,
    callback: function(model) {
      return function() {
        if (is_running(model)) {
          clearInterval(running_models[model.name]);
          delete running_models[model.name];
        }
        model.enable_action("start");
        model.disable_action("pause");
        model.update_views();
      };
    }
  };

  _actions.reset = {
    name: "reset",
    group: "run_model",
    icon: "fa-fast-backward",
    tooltip: I18N.reset_simulation,
    enabled: true,
    callback: function(model) {
      return function() {
        if (is_running(model)) {
          clearInterval(running_models[model.name]);
          delete running_models[model.name];
        }
        model.reset();
        model.enable_action("start");
        model.enable_action("finish");
        model.disable_action("pause");
        model.disable_action("reset");
        model.update_views();
      };
    }
  };

  _actions.finish = {
    name: "finish",
    group: "run_model",
    icon: "fa-fast-forward",
    tooltip: I18N.finish_simulation,
    enabled: true,
    callback: function(model) {
      return function() {
        if (is_running(model)) {
          clearInterval(running_models[model.name]);
          delete running_models[model.name];
        }
        model.finish();
        model.disable_action("pause");
        model.disable_action("start");
        model.disable_action("finish");
        model.enable_action("reset");
        model.update_views();
      };
    }
  };

  // Toggle view action

  _actions.toggle_line = {
    name: "toggle_line",
    group: "toggle_view",
    icon: "fa-line-chart",
    tooltip: I18N.show_line_graph,
    enabled: true,
    toggled: false,
    callback: function(model) {
      return function() {
        if (model.graph_is_shown("line")) {
          this.removeAttribute("data-toggled");
          model.hide_graph("line");
        } else {
          this.setAttribute("data-toggled", true);
          model.show_graph("line");
        }
      };
    }
  };

  _actions.toggle_arrows = {
    name: "toggle_arrows",
    group: "toggle_view",
    icon: "fa-long-arrow-right",
    tooltip: I18N.show_arrow_graph,
    enabled: true,
    toggled: false,
    callback: function(model) {
      return function() {
        if (model.graph_is_shown("arrows")) {
          this.removeAttribute("data-toggled");
          model.hide_graph("arrows");
        } else {
          this.setAttribute("data-toggled", true);
          model.show_graph("arrows");
        }
      };
    }
  };

  _actions.toggle_tailpoints = {
    name: "toggle_tailpoints",
    group: "toggle_view",
    icon: "fa-bar-chart",
    tooltip: I18N.show_bar_graph,
    enabled: true,
    toggled: false,
    callback: function(model) {
      return function() {
        if (model.graph_is_shown("tailpoints")) {
          this.removeAttribute("data-toggled");
          model.hide_graph("tailpoints");
        } else {
          this.setAttribute("data-toggled", true);
          model.show_graph("tailpoints");
        }
      };
    }
  };


  _actions.step_size = {
    name: "step_size",
    group: "step_size",
    tooltip: I18N.set_step_size,
    enabled: true,
    type: "slider",
    callback: function(model) {
      return function() {
        model.step_size(this.value);

        const update_tailpoints = function(graph) {
          graph.update(model.name);
        };
        model.get_views_of_type("graph").forEach(update_tailpoints);
      };
    }
  };


  return _actions;
};

module.exports = actions;

},{}],2:[function(require,module,exports){
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
const dom = {
  create: function(spec) {
    let elt;

    if (spec.name === "textNode") {
      elt = document.createTextNode(spec.value);
    } else {
      elt = document.createElement(spec.name);
    }

    const set_attribute = function(attr) {
      elt.setAttribute(attr, spec.attributes[attr]);
    };

    if (spec.attributes) {
      Object.keys(spec.attributes).forEach(set_attribute);
    }

    if (spec.children) {
      const append = function(child) {
        elt.appendChild(dom.create(child));
      };
      spec.children.forEach(append);
    }

    if (spec.on) {
      if (Array.isArray(spec.on)) {
        spec.on.forEach(function(on) {
          elt.addEventListener( on.type, on.callback );
        });
      } else {
        elt.addEventListener( spec.on.type, spec.on.callback );
      }
    }

    if (spec.value) {
      if (spec.name === "input" || spec.name === "option") {
        elt.value = spec.value;
      } else {
        elt.innerHTML = spec.value;
      }
    }

    if (spec.text) {
      elt.innerHTML = spec.text;
    }

    if (spec.style) {
      const set_style = function(style_name) {
        elt.style[style_name] = spec.style[style_name];
      };
      Object.keys(spec.style).forEach(set_style);
    }

    return elt;
  },

  invert_color: function(color) {
    const R = parseInt(color.slice(1,3), 16);
    const G = parseInt(color.slice(3,5), 16);
    const B = parseInt(color.slice(5,7), 16);
    const inverted_color = "#" +       
      (255 - R).toString(16) +
      (255 - G).toString(16) +
      (255 - B).toString(16);

    console.log(color, inverted_color);
    return inverted_color;
  }
};

module.exports = dom;

},{}],3:[function(require,module,exports){
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
const highball_model = require("./models/highball_glass");
const predefined = require("./predefined_glasses");
const simulation = require("./views/flaskfiller/flaskfiller");
const table = require("./views/table");
const graph = require("./views/graph");
const glassgrafter = require("./views/flaskfiller/glass_grafter");

const flaskfiller = function flaskfiller(config) {

  const microworld = {};

  const flow_rate = config.flow_rate || 50; // ml per sec
  const scale = config.scale || 3.5; // px per mm
  const quantities = {
    height: {
      name: "height",
      minimum: 0,
      maximum: 10,
      value: 0,
      label: I18N.height_in_cm,
      unit: "cm",
      stepsize: 0.01,
      precision: 2,
      monotone: true
    },
    time: {
      name: "time",
      minimum: 0,
      maximum: 100,
      value: 0,
      label: I18N.time_in_sec,
      unit: "sec",
      stepsize: 0.01,
      precision: 2,
      monotone: true
    },
    volume: {
      name: "volume",
      minimum: 0,
      maximum: 1000,
      value: 0,
      label: I18N.volume_in_ml,
      unit: "ml",
      stepsize: 0.01,
      precision: 2,
      monotone: true
    },
    speed: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'cm/sec',
      name: "speed",
      label: I18N.speed_in_cmsec,
      stepsize: 0.01,
      monotone: false,
      precision: 2
    }
  };

  const WORLD_HEIGHT = config.world_height || 20;

  if (config.not_in_table) {
    config.not_in_table.forEach(function(q) {
      quantities[q].not_in_table = true;
    });
  }
  if (config.not_in_graph) {
    config.not_in_graph.forEach(function(q) {
      quantities[q].not_in_graph = true;
    });
  }

  function create_view(config, view_creator, models) {
    let elt = document.getElementById(config.id);
    if (!elt) {
      throw new Error("Unable to find element with id=" + config.id);
    }

    const view = view_creator({
      quantities: quantities,
      scale: scale,
      world_height: WORLD_HEIGHT,
      horizontal: "time",
      vertical: "height",
      dimensions: {
        width: config.width || 600,
        height: config.height || 400,
        ruler_width: 30,
        margins: {
          left: 5,
          right: 5,
          top: 5,
          bottom: 5
        }
      },
      hide_actions: config.hide_actions || [],
      models: models,
      microworld: microworld
    });

    elt.appendChild(view.fragment);

    return view;
  }

  const views = {};
  if (config.simulation) {
    views.simulation = create_view(config.simulation, simulation);
  }
  if (config.table) {
    views.table = create_view(config.table, table, config.models);
  }
  if (config.graph) {
    views.graph = create_view(config.graph, graph);
  }

  if (config.designer) {
    const gg = glassgrafter(config.designer);
    const elt = document.getElementById(config.designer.id);
    if (!elt) {
      throw new Error("Unable to find element with id=" + config.designer.id);
    }
    elt.appendChild(gg.fragment);
  }
  
  
  const models = {};
  
  function register_model(model_spec) {
    return model_spec.register;
  }

  const afterRegister = config.afterRegister || function () {};

  function register(model_spec) {
    function generate_unique_name(prefix) {
      function has_prefix(elt) {
        return elt.substr(0, prefix.length) === prefix;
      }

      function postfix(elt) {
        return parseInt(elt.substr(prefix.length + 1), 10);
      }

      function max(arr) {
        if (arr.length > 0 ) {
          return Math.max.apply(null, arr);
        } else {
          return 0;
        }
      }

      const suffix = max(Object.keys(models).filter(has_prefix).map(postfix)) + 1;
      return prefix + "_" + suffix;
    }
    
    let model;

    function add_model(view) {
      views[view].register(model);
    }

    if (model_spec.multiple) {
      if (!model_spec.prefix) {
        throw new Error("when a model has option 'multiple', it should also have option 'prefix'.");
      }
      model_spec.name = generate_unique_name(model_spec.prefix);
    } else if (models[model_spec.name]) {
      // cannot create the same model twice
      return;
    }
    switch(model_spec.type) {
      case "glass":
        model = glass_model(model_spec.name, {
          name: model_spec.name,
          shape: model_spec.shape,
          flow_rate: flow_rate
        });
        break;
      case "highball":
        model = highball_model(model_spec.name, {
          name: model_spec.name,
          radius: model_spec.radius,
          height: model_spec.height,
          flow_rate: flow_rate
        });
        break;
      case "predefined":
        model = predefined(model_spec.name, flow_rate);
        break;
    }

    if (model_spec.extensible) {
      model.extensible = true;
      model.translate = {
        x: 0,
        y: 0
      };
    }

    Object.keys(views).forEach(add_model);
    models[model_spec.name] = model_spec;

    afterRegister();
  }

  config.models.filter(register_model).forEach(register);

  function unregister(model_name) {
    function remove_model(view) {
      views[view].unregister(model_name);
    }

    Object.keys(views).forEach(remove_model);

    delete models[model_name];
  }

  microworld.register = register;
  microworld.unregister = unregister;
  afterRegister();
  return microworld;
};

module.exports = flaskfiller;

},{"./models/highball_glass":7,"./predefined_glasses":10,"./views/flaskfiller/flaskfiller":13,"./views/flaskfiller/glass_grafter":15,"./views/graph":18,"./views/table":19}],4:[function(require,module,exports){
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
module.exports = {
  add_a_model: "add a glass", 
  beer_glass: "beer glass",
  change: "change",
  click_to_change_color: "click to change the color.",
  cocktail_glass: "cocktail glass",
  cognac_glass: "cognac glass",
  extensible: "extensible",
  extensible_highball_glass: "extensible highball glass",
  finish: "finish",
  finish_simulation: "Finish simulation.",
  height: "height",
  height_in_cm: "height in cm",
  highball: "highball",
  highball_glass: "highball glass",
  larger_highball_glass: "larger highball glass",
  pause: "pause",
  pause_simulation: "Pause simulation.",
  remove: "remove",
  remove_this_model: "remove this glass",
  reset: "reset",
  reset_simulation: "Reset simulation.",
  set_step_size: "Set the step size.",
  show_arrow_graph: "Show/hide arrow graph.",
  show_bar_graph: "Show/hide bar graph.",
  show_line_graph: "Show/hide line graph.",
  small_cocktail_glass: "small cocktail glass",
  small_highball_glass: "small highball glass",
  speed: "rising speed",
  speed_in_cmsec: "rising speed in cm/sec",
  start: "start",
  start_simulation: "Start simulation",
  time: "time",
  time_in_sec: "time in sec",
  vase: "vase",
  volume: "volume",
  volume_in_ml: "volume in ml",
  wide_highball_glass: "wide highball glass",
  wine_glass: "wine glass",

};

},{}],5:[function(require,module,exports){
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
module.exports = {
  add_a_model: "voeg een glas toe",
  beer_glass: "bierglas",
  change: "verander", 
  click_to_change_color: "klik om de kleur te veranderen.",
  cocktail_glass: "cocktailglas",
  cognac_glass: "cognacglas",
  extensible: "uitrekbaar",
  extensible_highball_glass: "uitrekbaar longdrinkglas",
  finish: "finish",
  finish_simulation: "Naar het einde van de simulatie.",
  height: "hoogte",
  height_in_cm: "hoogte in cm",
  highball: "longdrink",
  highball_glass: "longdrinkglas",
  larger_highball_glass: "groter longdrinkglas",
  pause: "pauzeer",
  pause_simulation: "Simulatie pauzeren.",
  remove: "verwijderen",
  remove_this_model: "verwijder dit glas",
  reset: "reset",
  reset_simulation: "Simulatie herbeginnen.",
  set_step_size: "Stel de stapgrootte in.",
  show_arrow_graph: "Laat de pijlgrafiek zien of verberg de pijlgrafiek.",
  show_bar_graph: "Laat de staafgrafiek zien of verberg de staafgrafiek.",
  show_line_graph: "Laat de lijngrafiek zien of verberg de lijngrafiek.",
  small_cocktail_glass: "klein cocktailglas",
  small_highball_glass: "klein longdrinkglas",
  speed: "stijgsnelheid",
  speed_in_cmsec: "stijgsnelheid in cm/sec",
  start: "start",
  start_simulation: "Start simulatie.",
  time: "tijd",
  time_in_sec: "tijd in sec",
  vase: "vaas",
  volume: "volume",
  volume_in_ml: "volume in ml",
  wide_highball_glass: "breed longdrinkglas",
  wine_glass: "wijnglas",
};

},{}],6:[function(require,module,exports){
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

},{"../actions":1,"../path":9,"./model.js":8}],7:[function(require,module,exports){
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

},{"../actions":1,"./model":8}],8:[function(require,module,exports){
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
const model = function(name, config) {
  "use strict";

  const _model = {name: name};
  const _appendix = {};

  // ## Data invariant and initialization
  //
  // This model describes a dynamic phenomenon in terms of changing
  // quantities over time.
  //
  //
  // This description starts at `T_START` milliseconds
  // (ms), defaulting to 0 ms and ends at `T_END` ms. If no end is specified
  // it is assumed that the phenomenon does not end or is still ongoing in
  // the real world (RW). The phenomenon's change is tracked by "measuring"
  // the changing quantities at consecutive moments in time. These moments
  // are `T_STEP` apart, defaulting to 1 ms, and are tracked by order
  // number.

  let T_START     = config.time.start     || 0;
  let T_END       = config.time.end       || Infinity;
  let T_STEP      = config.time.step      || 1;

  function set_end(seconds) {
    T_END = seconds*1000;
  }
  _model.set_end = set_end;

  // To translate from a moment's order number to its corresponding time in
  // ms and vice versa, two helper functions are defined, `time_to_moment`
  // and `moment_to_time`, as well as a shorthand name for these two helper
  // functions, respectively, `t2m` and `m2t`.

  _model.time_to_moment = function(time) {
    return Math.floor(time / T_STEP); 
  };

  const t2m = _model.time_to_moment;

  _model.moment_to_time = function(moment) {
    return moment * T_STEP;
  };

  const m2t = _model.moment_to_time;

  // When I use "measured" I mean to denote that the values of the
  // quantities describing the phenomenon have been captured, computed,
  // downloaded, measured, or otherwise obtained. This `model` function is
  // intended to be applicable for describing purely theoretical models of a
  // phenomenon as well as real-time measurements of a phenomenon.
  //
  // "Measuring" a moment is left to the `measure_moment` function. Each
  // model has to (re)implement this function to specify the relationship
  // between the phenomenon's quantities of interest at each moment during
  // the phenomenon.

  _model.measure_moment = function(/*moment*/) {
    // to be implemented in an object implementing model
  };


  // The model has the following data invariant:
  //
  //   (∀m: 0 ≤ m ≤ |`moments`|: `moment_computed`(`moments`[m]))
  //
  // stating that the phenomenon has been described quantitatively for all
  // moments. These "measurements" are stored in a list of `moments` and can
  // be accessed through a moment's order number.

  let moments = [];

  _model.get_moment = function(moment) {
    return moments[moment];
  };

  _model.number_of_moments = function() {
    return moments.length;
  };


  // A moment can only be inspected if it already has been "measured".
  // Following the data invariant, a moment has been measured when its order
  // number is smaller or equal to the number of measured moments.

  _model.moment_measured = function(moment) {
    return moment <= moments.length - 1;
  };

  // Furthermore, the current moment of interest, or `now`, points to an
  // already "measured" moment during the phenomenon's duration. Hence, the
  // data invariant is extended as follows:
  //
  //   `t2m`(`T_START`) ≤ `now` ≤ `t2m`(`T_END`) → `moment_computed`(`now`)

  let now;

  // To ensure this data invariant, `now` is set to a moment before the
  // phenomenon started. 

  now = t2m(T_START) - 1;

  // ## Inspecting and running a model

  // Inspection through registerd views

  const views = [];
  const update_views = function() {
    const update_view = function(view) {
      view.update(_model.name);
    };
    views.forEach(update_view);
  };
  _model.update_views = update_views;

  const update_all_views = function() {
    const update_view = function(view) {
      if (view.update_all) {
        view.update_all();
      } else {
        view.update(_model.name);
      }
    };
    views.forEach(update_view);
  };
  _model.update_all_views = update_all_views;

  _model.register = function(view) {
    const view_found = views.indexOf(view);
    if (view_found === -1) {
      views.push(view);
      views.forEach(function(v) { if(v.update_all) {v.update_all();}});
    }
  };

  _model.get_views_of_type = function(view_type) {
    return views.filter(function(v) {
      return v.type === view_type;
    });
  };

  _model.unregister = function(view) {
    if (arguments.length === 0) {
      const unregister = function(view) {
        view.unregister(_model.name);
      };
      views.forEach(unregister);
    } else {
      const view_found = views.indexOf(view);
      if (view_found !== -1) {
        views.slice(view_found, 1);
      }
    }
  };

  // As a model can be inspected repeatedly, as is one
  // of the reasons to model a phenomenon using a computer, we introduce a
  // `reset` function to resets `now` to a moment before the phenomenon
  // started.

  _model.reset = function() {
    now = t2m(T_START) - 1;
    _model.step();
    update_views();
  };



  // Once a model has been started, the current moment will be measured as
  // well as all moments before since the start. These moments can be
  // inspected.
  //
  _model.has_started = function() {
    return now >= 0;
  };

  // The `step` function will advance `now` to the next moment if the end of
  // the phenomenon has not been reached yet. If that moment has not been
  // "measured" earlier, "measure" it now.

  _model.step = function(do_not_update_views) {
    if (m2t(now) + T_STEP <= T_END) {
      now++;
      if (!_model.moment_measured(now)) {
        const moment = _model.measure_moment(now);
        moment._time_ = m2t(now);
        moments.push(moment);
      }
    }
    if (!do_not_update_views) {
      update_views();
    }
    return now;
  };

  // If the phenomenon is a finite process or the "measuring" process cannot
  // go further `T_END` will have a value that is not `Infinity`.

  _model.can_finish = function() {
    return Math.abs(T_END) !== Infinity;
  };

  // To inspect the whole phenomenon at once or inspect the last moment,
  // `finish`ing the model will ensure that all moments during the
  // phenomenon have been "measured".

  _model.finish = function() {
    const DO_NOT_UPDATE_VIEWS = true;
    if (_model.can_finish()) {
      while (moments.length - 1 < t2m(T_END)) {
        _model.step(DO_NOT_UPDATE_VIEWS);
      }
    }
    now = moments.length - 1;
    _model.update_views();
    return now;
  };

  // We call the model finished if the current moment, or `now`, is the
  // phenomenon's last moment.

  _model.is_finished = function() {
    return _model.can_finish() && m2t(now) >= T_END;
  };

  function reset_model() {
    moments = [];
    _model.action("reset").callback(_model)();
    //        _model.reset();
  }
  _model.reset_model = reset_model;

  /** 
   * ## Actions on the model
   *
   */
  _model.actions = {};
  _model.add_action = function( action ) {
    _model.actions[action.name] = action;
    _model.actions[action.name].install = function() {
      return action.callback(_model);
    };
  };
  if (config.actions) {
    const add_action = function(action_name) {
      _model.add_action(config.actions[action_name]);
    };
    Object.keys(config.actions).forEach(add_action);
  }
  _model.action = function( action_name ) {
    if (_model.actions[action_name]) {
      return _model.actions[action_name];
    }
  };
  _model.remove_action = function( action ) {
    if (_model.actions[action.name]) {
      delete _model.actions[action.name];
    }
  };
  _model.disable_action = function( action_name ) {
    if (_model.actions[action_name]) {
      _model.actions[action_name].enabled = false;
    }
  };
  _model.enable_action = function( action_name ) {
    if (_model.actions[action_name]) {
      _model.actions[action_name].enabled = true;
    }
  };
  _model.toggle_action = function( action_name ) {
    if (_model.actions[action_name]) {
      _model.actions[action_name].enabled = 
        !_model.action[action_name].enabled;
    }
  };


  // ## Coordinating quantities
  //
  // All quantities that describe the phenomenon being modeled change in
  // coordination with time's change. Add the model's time as a quantity to
  // the list with quantities. To allow people to model time as part of
  // their model, for example to describe the phenomenon accelerated, the
  // internal time is added as quantity `_time_` and, as a result, "_time_"
  // is not allowed as a quantity name.

  _model.quantities = config.quantities || {};

  _model.quantities._time_ = {
    hidden: true,
    minimum: T_START,
    maximum: T_END,
    value: m2t(now),
    stepsize: T_STEP,
    unit: "ms",
    label: "internal time",
    monotone: true
  };


  _model.get_minimum = function(quantity) {
    if (arguments.length === 0) {
      // called without any arguments: return all minima
      const minima = {};
      const add_minimum = function(quantity) {
        minima[quantity] = parseFloat(_model.quantities[quantity].minimum);
      };

      Object.keys(_model.quantities).forEach(add_minimum);
      return minima;
    } else {
      // return quantity's minimum
      return parseFloat(_model.quantities[quantity].minimum);
    }
  };

  _model.get_maximum = function(quantity) {
    if (arguments.length === 0) {
      // called without any arguments: return all minima
      const maxima = {};
      const add_maximum = function(quantity) {
        maxima[quantity] = parseFloat(_model.quantities[quantity].maximum);
      };

      Object.keys(_model.quantities).forEach(add_maximum);
      return maxima;
    } else {
      // return quantity's minimum
      return parseFloat(_model.quantities[quantity].maximum);
    }
  };


  _model.find_moment = function(quantity, value) {
    if (moments.length === 0) {
      // no moment are measured yet, so there is nothing to be found

      return -1;
    } else {
      const val = _appendix.quantity_value(quantity);

      // pre: quantity is monotone
      // determine if it is increasing or decreasing
      // determine type of monotone
      //
      // As the first moment has been measured and we do know the
      // minimum of this quantity, type of monotone follows.

      const start = val(0);
      const INCREASING = start !== _model.get_maximum(quantity);


      // Use a stupid linear search to find the moment that approaches the
      // value best


      let m = 0;
      let n = moments.length - 1;
      let lowerbound;
      let upperbound;


      if (INCREASING) {
        lowerbound = function(moment) {
          return val(moment) < value;
        };
        upperbound = function(moment) {
          return val(moment) > value;
        };
      } else {
        lowerbound = function(moment) {
          return val(moment) > value;
        };
        upperbound = function(moment) {
          return val(moment) < value;
        };
      }

      // Increasing "function", meaning
      //
      //  (∀m: 0 ≤ m < |`moments`|: `val`(m) <= `val`(m+1))
      //
      // Therefore,
      //
      //  (∃m, n: 0 ≤ m < n ≤ |`moments`|: 
      //      `val`(m) ≤ value ≤ `val`(n) ⋀
      //      (∀p: m < p < n: `val`(p) = value))
      //
      // `find_moment` finds those moments m and n and returns the
      // one closest to value or, when even close, the last moment
      // decreasing is reverse.


      while (lowerbound(m)) {
        m++;
        if (m>n) {
          // 
          return -1;
        }
      }
      return m;
    }
  };


  _model.get = function(quantity) {
    if (now < 0) {
      return undefined;
    } else {
      return moments[now][quantity];
    }
  };

  _model.set = function(quantity, value) {
    const q = _model.quantities[quantity];

    if (value < parseFloat(q.minimum)) {
      value = parseFloat(q.minimum);
    } else if (value > parseFloat(q.maximum)) {
      value = parseFloat(q.maximum);
    }


    // q.minimum ≤ value ≤ q.maximum

    // has value already been "measured"?
    // As some quantities can have the same value more often, there are
    // potentially many moments that fit the bill. There can be an unknown
    // amount of moments that aren't measured as well.
    //
    // However, some quantities will be strictly increasing or decreasing
    // and no value will appear twice. For example, the internal time will
    // only increase. Those quantities with property `monotone`
    // `true`, only one value will be searched for

    let moment = -1;

    if (q.monotone) {
      moment = _model.find_moment(quantity, value);

      if (moment === -1) {
        // not yet "measured"
        const DO_NOT_UPDATE_VIEWS = true;
        _model.step(DO_NOT_UPDATE_VIEWS);
        // THIS DOES WORK ONLY FOR INCREASING QUANTITIES. CHANGE THIS
        // ALTER WITH FIND FUNCTION !!!!
        while(moments[now][quantity] < value && !_model.is_finished()) {
          _model.step(DO_NOT_UPDATE_VIEWS);
        }
      } else {
        now = moment;
      }
      update_views();
      return moments[now];
    }
  };

  _model.data = function() {
    return moments.slice(0, now + 1);
  };

  _model.current_moment = function(moment_only) {
    if (moment_only) {
      return now;
    } else {
      return moments[now];
    }
  };

  _model.graphs_shown = {
    tailpoints: false,
    line: false,
    arrows: false
  };



  _model.show_graph = function(kind) {
    const graphs = _model.get_views_of_type("graph");

    function show_this_graph(g) {
      switch(kind) {
        case "line":
          g.show_line(_model.name);
          break;
        case "tailpoints":
          g.show_tailpoints(_model.name);
          break;
        case "arrows":
          g.show_arrows(_model.name);
          break;
      }
    }
    graphs.forEach(show_this_graph);
    _model.graphs_shown[kind] = true;

  };

  _model.hide_graph = function(kind) {
    const graphs = _model.get_views_of_type("graph");

    function hide_this_graph(g) {
      switch(kind) {
        case "line":
          g.hide_line(_model.name);
          break;
        case "tailpoints":
          g.hide_tailpoints(_model.name);
          break;
        case "arrows":
          g.hide_arrows(_model.name);
          break;
      }
    }
    graphs.forEach(hide_this_graph);
    _model.graphs_shown[kind] = false;

  };

  _model.graph_is_shown = function(kind) {
    return _model.graphs_shown[kind];
  };


  // ## _appendix H: helper functions

  _appendix.approximates = function(epsilon) {
    const EPSILON = epsilon || 0.001;
    const fn = function(a, b) {
      return Math.abs(a - b) <= EPSILON;
    };
    fn.EPSILON = EPSILON;
    return fn;
  };
  _appendix.quantity_value = function(quantity) {
    return function(moment) {
      return moments[moment][quantity];
    };
  };


  let step = (config.stepsize || T_STEP)*5 ;

  function step_size(size) {
    if (arguments.length === 1) {
      step = size;
    }
    return step;
  }
  _model.step_size = step_size;

  function random_color() {
    const hexes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    const colors = [];
    let i = 0;

    while (i < 6) {
      colors.push(hexes[Math.round(Math.random()*(hexes.length - 1))]);
      i++;
    }
    return "#"+ colors.join("");
  }

  let color = random_color();

  _model.color = function(c) {
    if (arguments.length === 1) {
      if (c === "random") {
        color = random_color();
      } else {
        color = c;
      }
    }
    return color;
  };
  return _model;
};    


module.exports = model;

},{}],9:[function(require,module,exports){
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
function start_of_path(path) {
  return Raphael.getPointAtLength(path, 0);
}

function end_of_path(path) {
  return Raphael.getPointAtLength(path,
      Raphael.getTotalLength());
}

function complete_path(part, fill_length) {
  let start = part.top;
  let end = part.bottom;
  let path = part.path;

  if (fill_length) {
    path = "m" + start.x + "," + start.y + path;
    start = Raphael.getPointAtLength(path, fill_length);

    const total_length = Raphael.getTotalLength(path);

    path = Raphael.getSubpath(path, fill_length, total_length);
    path = Raphael.pathToRelative(path);
    path.shift(); // remove the M command
    path = path.toString();
  }

  let segments = Raphael.parsePathString(path),
  completed_path = "m" + start.x + "," + start.y + path;


  completed_path += "h-" + Math.abs(0 - end.x) * 2;

  const mirror_segment = function(segment) {
    let command = segment[0],
    x,y, cp1, cp2,
    mirrored_segment = "";

    switch (command) {
      case "l":
        x = segment[1];
        y = segment[2];
        mirrored_segment = "l" + x + "," + (-y);
        start = {
          x: start.x + x,
          y: start.y + y
        };
        break;
      case "c":
        cp1 = {
          x: segment[1],
          y: segment[2]
        };
        cp2 = {
          x: segment[3],
          y: segment[4]
        };

        x = segment[5];
        y = segment[6];
        end = {
          x: x,
          y: y
        };
        mirrored_segment = "c" + (end.x - cp2.x) + "," + (-(end.y - cp2.y)) + "," +
          (end.x - cp1.x) + "," + (-(end.y - cp1.y)) + "," + 
          x + "," + (-y);
        start = {
          x: start.x + x,
          y: start.y + y
        };
        break;
      case "v":
        y = segment[1];
        mirrored_segment = "v" + (-y);
        start = {
          x: start.x,
          y: start.y + y
        };
        break;
      case "h":
        x = segment[1];
        mirrored_segment = "h" + x;
        start = {
          x: start.x + x,
          y: start.y
        };
        break;
      case "m":
        // skip

        break;
    }

    return mirrored_segment;
  };

  completed_path += segments.map(mirror_segment).reverse().join("");

  return completed_path;
}

function scale_shape(shape, scale_) {
  let model_scale = shape.scale;
  let factor = scale_/model_scale;

  const scale = function(number) {
    return number * factor;
  };

  function scale_path(path) {
    const path_segments = Raphael.parsePathString(path);
    const scale_segment = function(segment) {
      const segment_arr = segment;
      const command = segment_arr.shift();

      return command + segment_arr.map(scale).join(",");
    };

    return path_segments.map(scale_segment).join("");
  }

  return {
    base: {
      path: scale_path(shape.base.path, factor),
      bottom: {
        x: scale(shape.base.bottom.x),
        y: scale(shape.base.bottom.y)
      },
      top: {
        x: scale(shape.base.top.x),
        y: scale(shape.base.top.y)
      }
    },
    bowl: {
      path: scale_path(shape.bowl.path, factor),
      bottom: {
        x: scale(shape.bowl.bottom.x),
        y: scale(shape.bowl.bottom.y)
      },
      top: {
        x: scale(shape.bowl.top.x),
        y: scale(shape.bowl.top.y)
      }
    },
    scale: scale_,
    factor: factor
  };
}

module.exports = {
  start: start_of_path,
  end: end_of_path,
  complete_path: complete_path,
  scale_shape: scale_shape
};

},{}],10:[function(require,module,exports){
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
const glass_model = require("./models/glass");

const glass_specifications = {
  small_highball_glass: {
    "bowl": {
      "top": {
        "x": 67,
        "y": 188
      },
      "bottom": {
        "x": 67,
        "y": 358
      },
      "path": "l0,170"
    },
    "base": {
      "top": {
        "x": 67,
        "y": 358
      },
      "bottom": {
        "x": 67,
        "y": 365
      },
      "path": "l0,7"
    },
    "scale": 3
  },
  highball_glass: {
    "bowl": {
      "top": {
        "x": 88,
        "y": 46
      },
      "bottom": {
        "x": 88,
        "y": 375
      },
      "path": "l0,329"
    },
    "base": {
      "top": {
        "x": 88,
        "y": 375
      },
      "bottom": {
        "x": 88,
        "y": 415
      },
      "path": "l0,40"
    },
    "scale": 3
  },
  larger_highball_glass: {
    "bowl": {
      "top": {
        "x": 94,
        "y": 37
      },
      "bottom": {
        "x": 94,
        "y": 405
      },
      "path": "l0,368"
    },
    "base": {
      "top": {
        "x": 94,
        "y": 405
      },
      "bottom": {
        "x": 94,
        "y": 415
      },
      "path": "l0,10"
    },
    "scale": 3
  },
  wide_highball_glass: {
    "bowl": {
      "top": {
        "x": 129,
        "y": 122
      },
      "bottom": {
        "x": 129,
        "y": 360
      },
      "path": "l0,238"
    },
    "base": {
      "top": {
        "x": 129,
        "y": 360
      },
      "bottom": {
        "x": 129,
        "y": 415
      },
      "path": "l0,55"
    },
    "scale": 3
  },
  cocktail_glass: {
    "bowl": {
      "top": {
        "x": 169,
        "y": 8
      },
      "bottom": {
        "x": 19,
        "y": 228
      },
      "path": "l-150,220"
    },
    "base": {
      "top": {
        "x": 19,
        "y": 228
      },
      "bottom": {
        "x": 123,
        "y": 465
      },
      "path": "l0,210 l96,20 c5,2.5,7.5,7.5,8,7"
    },
    "scale": 3
  },
  small_cocktail_glass: {
    "bowl": {
      "top": {
        "x": 141,
        "y": 94
      },
      "bottom": {
        "x": 10,
        "y": 404
      },
      "path": "l-117,221.8125 l-14,88.1875"
    },
    "base": {
      "top": {
        "x": 10,
        "y": 404
      },
      "bottom": {
        "x": 95,
        "y": 465
      },
      "path": "l0,51 l76,1 c5,2.5,7.5,7.5,9,9"
    },
    "scale": 3
  },
  wine_glass: {
    "bowl": {
      "top": {
        "x": 99,
        "y": 36
      },
      "bottom": {
        "x": 15,
        "y": 286
      },
      "path": "c6,100,20,150,-84,250"
    },
    "base": {
      "top": {
        "x": 15,
        "y": 286
      },
      "bottom": {
        "x": 101,
        "y": 465
      },
      "path": "l2,164 l79,8 c5,2.5,7.5,7.5,5,7"
    },
    "scale": 3
  },
  cognac_glass: {
    "bowl": {
      "top": {
        "x": 69,
        "y": 140
      },
      "bottom": {
        "x": 19,
        "y": 376
      },
      "path": "l49,133.8125 c12,40,-30,85,-99,102.1875"
    },
    "base": {
      "top": {
        "x": 19,
        "y": 376
      },
      "bottom": {
        "x": 101,
        "y": 465
      },
      "path": "l0,70 l77,9 c5,2.5,7.5,7.5,5,10"},
      "scale": 3
  },
  beer_glass: {
    "bowl": {
      "top": {
        "x": 108,
        "y": 122
      },
      "bottom": {
        "x": 71,
        "y": 459
      },
      "path": "l1,100.8125 c0,15,-10,15,-18,33 l-20,203.1875"
    },
    "base": {
      "top": {
        "x": 71,
        "y": 459
      },
      "bottom": {
        "x": 71,
        "y": 465
      },
      "path": "l0,6"
    },
    "scale": 3
  },
  vase: {
    "bowl": {
      "top": {
        "x": 53,
        "y": 227
      },
      "bottom": {
        "x": 119,
        "y": 456
      },
      "path": "l0,95.96875 l66,1 l0,132.03125"
    },
    "base": {
      "top": {
        "x": 119,
        "y": 456
      },
      "bottom": {
        "x": 119,
        "y": 465
      },
      "path": "l0,9"
    },
    "scale": 3
  }
};

module.exports = function(name, flow_rate) {
  return glass_model(name, {
    name: name,
    shape: glass_specifications[name],
    flow_rate: flow_rate
  });
};

},{"./models/glass":6}],11:[function(require,module,exports){
/*
 * Copyright 2016 Huub de Beer <Huub@heerdebeer.org>
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
const flaskfiller = require("./flaskfiller.js");

// Get translations
const LANGUAGES = {
  "en": require("./i18n/en.js"),
  "nl": require("./i18n/nl.js")
};

window.I18N = LANGUAGES[document.documentElement.lang || "en"];

const models = [
{
  name: "highball_glass",
  type: "predefined",
  register: false
}, {
  name: "cocktail_glass",
  type: "predefined",
  register: true
}, {
  name: "wine_glass",
  type: "predefined",
  register: false
}, {
  name: "cognac_glass",
  type: "predefined",
  register: false
}, {
  name: "beer_glass",
  type: "predefined",
  register: false
}, {
  name: "extensible_highball_glass",
  prefix: "extensible",
  extensible: true,
  type: "highball",
  radius: 1.1,
  height: 5.8,
  register: false,
  multiple: true
}
];

const showReloadMessage = function () {
  $("#reload-message").removeClass("invisible");
};

const toggleButton = function (settingElt, buttonName) {
    const setting = $(settingElt);
    const button = $("button.action[data-action='" + buttonName + "']");
    if (setting.prop("checked")) {
      button.show();
    } else {
      button.hide();
    }
};

const toggleComponent = function (settingElt, componentName) {
    const setting = $(settingElt);
    const component = $("#" + componentName);
    if (setting.prop("checked")) {
      component.show();
    } else {
      component.hide();
    }
};
  
const toggleColumn = function (col) {
  return function () {
    const setting = $(this);
    const column = $("#table td[data-quantity='" + col + "'], #table th[data-quantity='" + col + "']");
    if (setting.prop("checked")) {
      column.show();
    } else {
      column.hide();
    }
  };
};

const SETTINGS = [{
  name: "components.simulation",
  selector: "input[name='components'][value='simulation']",
  type: "checkbox",
  onChange: function () {
    toggleComponent(this, "simulation");
  }
},{
  name: "components.graph",
  selector: "input[name='components'][value='graph']",
  type: "checkbox",
  onChange: function () {
    toggleComponent(this, "graph");
  }
},{
  name: "components.table",
  selector: "input[name='components'][value='table']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const table = $("#table");
    const header = table.find("th[data-quantity]");
    const body = table.find("td[data-quantity]");
    if (setting.prop("checked")) {
      header.show();
      body.show();
    } else {
      header.hide();
      body.hide();
    }
  }
},{
  name: "components.control",
  selector: "input[name='components'][value='control']",
  type: "checkbox",
  onChange: function () {
    toggleComponent(this, "table");
  }
},{
  name: "components.designer",
  selector: "input[name='components'][value='designer']",
  type: "checkbox",
  onChange: function () {
    toggleComponent(this, "designer");
  }
},{
  name: "simulation.world-height",
  selector: "input[name='world-height']",
  type: "input",
  reload: true
},{
  name: "graph.axis.horizontal",
  selector: "select[name='horizontal-axis']",
  type: "select"
},{
  name: "graph.axis.vertical",
  selector: "select[name='vertical-axis']",
  type: "select"
},{
  name: "graph.types.arrow",
  selector: "input[name='graph-types'][value='arrow']",
  type: "checkbox",
  onChange: function () {
    toggleButton(this, "toggle_arrows");
  }
},{
  name: "graph.types.bar",
  selector: "input[name='graph-types'][value='bar']",
  type: "checkbox",
  onChange: function () {
    toggleButton(this, "toggle_tailpoints");
  }
},{
  name: "graph.types.line",
  selector: "input[name='graph-types'][value='line']",
  type: "checkbox",
  onChange: function () {
    toggleButton(this, "toggle_line");
  }
},{
  name: "graph.options.coordinates",
  selector: "input[name='graph-options'][value='coordinates']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const tooltip = $("div.tooltip");
    if (setting.prop("checked")) {
      tooltip.removeClass("disabled");
    } else {
      tooltip.addClass("disabled");
    }
  }
},{
  name: "graph.options.speed",
  selector: "input[name='graph-options'][value='speed']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const tooltip = $("div.speed_tooltip");
    if (setting.prop("checked")) {
      tooltip.removeClass("disabled");
    } else {
      tooltip.addClass("disabled");
    }
  }
},{
  name: "graph.options.tangent-line",
  selector: "input[name='graph-options'][value='tangent-line']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const tangent = $("#graph g.tangent_triangle");
    if (setting.prop("checked")) {
      tangent.removeClass("disabled");
      tangent.show();
    } else {
      tangent.addClass("disabled");
      tangent.hide();
    }
  }
},{
  name: "graph.options.step",
  selector: "input[name='graph-options'][value='step']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const slider = $("input[data-action='step_size']");
    if (setting.prop("checked")) {
      slider.show();
    } else {
      slider.hide();
    }
  }
},{
  name: "graph.options.move-highball",
  selector: "input[name='graph-options'][value='move-highball']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const moveHandles = $("#graph circle.drag-handle");
    if (setting.prop("checked")) {
      moveHandles.show();
    } else {
      moveHandles.hide();
    }
  }
},{
  name: "table.quantities.height",
  selector: "input[name='table-quantities'][value='height']",
  type: "checkbox",
  onChange: toggleColumn("height"),
  reload: true
},{
  name: "table.quantities.volume",
  selector: "input[name='table-quantities'][value='volume']",
  type: "checkbox",
  onChange: toggleColumn("volume"),
  reloas: true
},{
  name: "table.quantities.time",
  selector: "input[name='table-quantities'][value='time']",
  type: "checkbox",
  onChange: toggleColumn("time"),
  reload: true
},{
  name: "table.quantities.speed",
  selector: "input[name='table-quantities'][value='speed']",
  type: "checkbox",
  onChange: toggleColumn("speed"),
  reload: true
},{
  name: "table.glass.name",
  selector: "input[name='table-glass-name'][value='hide-glass-name']",
  type: "checkbox",
  onChange: function () {
    const setting = $(this);
    const nameColumn = $("td.glass-name");
    if (setting.prop("checked")) {
      nameColumn.hide();
    } else {
      nameColumn.show();
    }
  }
},{
  name: "glasses.cocktail",
  selector: "input[name='glasses'][value='cocktail']",
  type: "checkbox",
  reload: true
},{
  name: "glasses.highball",
  selector: "input[name='glasses'][value='highball']",
  type: "checkbox",
  reload: true
},{
  name: "glasses.extensible-highball",
  selector: "input[name='glasses'][value='extensible-highball']",
  type: "checkbox",
  reload: true
},{
  name: "glasses.wine",
  selector: "input[name='glasses'][value='wine']",
  type: "checkbox",
  reload: true
},{
  name: "glasses.cognac",
  selector: "input[name='glasses'][value='cognac']",
  type: "checkbox",
  reload: true
},{
  name: "glasses.beer",
  selector: "input[name='glasses'][value='beer']",
  type: "checkbox",
  reload: true
}
];

const getConfigForm = function () {
  return $("#configuration-form");
};

const saveSetting = function (setting) {
  let val;
  const elt = getConfigForm().find(setting.selector);
  switch (setting.type) {
    case "checkbox": {
      val = elt.prop("checked");
      break;
    }
    default: {
      val = elt.val();
    }
  }
  if (val !== undefined && val !== null) {
    localStorage.setItem(setting.name, val);
    console.log("Saving " + setting.name + ": '" + val + "'");
  } else {
    console.log("Unable to save " + setting.name + ": '" + val + "'");
  } 
};

const restoreSetting = function (setting) {
  const val = localStorage.getItem(setting.name);
  if (val && "undefined" !== val) {
    const elt = getConfigForm().find(setting.selector);
    switch (setting.type) {
      case "checkbox": {
        elt.prop("checked", val === "true");
        break;
      }
      default: {
        elt.val(val);
      }
    }
    console.log("Restoring " + setting.name + ": " + val);
  } else {
    console.log("Unable to restore " + setting.name + ": '" + val + "'");
  }
};

const saveBeforeUnload = function () {
  SETTINGS.forEach(function (setting) {
    try {
      saveSetting(setting);
    } catch (e) {
      console.error("Failed to save " + setting.name, e);
    }
  });
};

const restoreOnLoad = function () {
  SETTINGS.forEach(function (setting) {
    try {
      restoreSetting(setting);
    } catch (e) {
      console.error("Failed to restore " + setting.name, e);
    }
  });
};

const getCheckBoxGroupValuesAsArray = function (groupName) {
  const checkboxToValue = function (_, element) {
    return $(element).attr("value");
  };
  return getConfigForm()
    .find("input[name='" + groupName + "']:checked")
    .map(checkboxToValue)
    .toArray();
};

const getWorldHeight = function () {
  return parseInt(getConfigForm().find("input[name='world-height']").val() || 20);
};

const getAxis = function (orientation) {
  if ("horizontal" !== orientation && "vertical" !== orientation) {
    throw new Error("getAxis expects one parameter, 'orientation'" +
        " which should be one of 'horizontal' or 'vertical'");
  }

  return getConfigForm().find("select[name='" + orientation + "-axis']").val();
};

const getGraphTypes = function () {
  return getCheckBoxGroupValuesAsArray("graph-types");
};

const getGraphOptions = function () {
  return getCheckBoxGroupValuesAsArray("graph-options");
};

const getTableQuantities = function () {
  return getCheckBoxGroupValuesAsArray("table-quantities");
};

const getGlasses = function () {
  return getCheckBoxGroupValuesAsArray("glasses");
};

const getModels = function (glasses) {
  const nameMap = {
    "cocktail": "cocktail_glass",
    "highball": "highball_glass",
    "extensible-highball": "extensible_highball_glass",
    "erlenmeyer": "erlenmeyer_flask",
    "wine": "wine_glass",
    "cognac": "cognac_glass",
    "beer": "beer_glass",
    "round-bottom": "round_bottom_flask"
  };
  const findModel = function (glassName) {
    return models.filter(function (model) {
      return model.name === nameMap[glassName];
    })[0];
  };
  return glasses.map(findModel);
};

const quantitiesNotInTable = function (quantitiesToAdd) {
  const quantities = ["height", "time", "volume", "speed"];
  const skipAdded = function (quantity) {
    return quantitiesToAdd.indexOf(quantity) < 0;
  };
  return quantities.filter(skipAdded);
};

const determineDimensions = function () {
  const PADDING = 50;
  const screenWidth = $(window).width();
  const widthUnit = (screenWidth - PADDING) / (screenWidth >= 600 ? 5 : 1);
  const screenHeight = $(window).height();
  const heightUnit = (screenHeight - PADDING) / (screenHeight >= 400 ? 5 : 3);

  return {
    simulation: 2 * widthUnit,
    graph: 3 * widthUnit,
    height: 3 * heightUnit
  };
};

const getConfiguration = function () {
  const config = {
    scale: 2,
    models: getModels(getGlasses()),
    world_height: getWorldHeight(),
    not_in_table: quantitiesNotInTable(getTableQuantities()) 
  };

  const dimension = determineDimensions();

  config.simulation = {
    id: "simulation",
    width: dimension.simulation,
    height: dimension.height
  };

  config.graph = {
    id: "graph",
    width: dimension.graph,
    height: dimension.height,
    axes: {
      horizontal: getAxis("horizontal") || "time",
      vertical: getAxis("vertical") || "vertical"
    },
    types: getGraphTypes(),
    options: getGraphOptions()
  };

  config.table = {
    id: "table"
  };

  config.designer = {
    id: "designer"
  };

  return config;
};

const initializeSettingsChangeHandlers = function () {
  const initializeChangeHandler = function (setting) {
    if (setting.onChange) {
      const elt = getConfigForm().find(setting.selector);
      elt.on("change", setting.onChange);
      // Handle the current setting.
      setting.onChange.call(elt);
    }
    if (setting.reload && setting.reload === true) {
      const elt = getConfigForm().find(setting.selector);
      elt.on("change", showReloadMessage);
    }

  };
  SETTINGS.forEach(initializeChangeHandler);
};

const runFlaskFiller = function () {
  restoreOnLoad();
  const config = getConfiguration();
  config.afterRegister = initializeSettingsChangeHandlers;
  flaskfiller(config);
  initializeSettingsChangeHandlers();
};

$(document).ready(runFlaskFiller);
$(window).on("beforeunload", function () {
  saveBeforeUnload();
  console.log(I18N);
});

},{"./flaskfiller.js":3,"./i18n/en.js":4,"./i18n/nl.js":5}],12:[function(require,module,exports){
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

},{"../../path":9}],13:[function(require,module,exports){
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
const highball = require("./highball_glass");
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
        if (model.type === "highball") {
            glass = highball(canvas, model, scale, snap_values);
        } else {
            glass = various_glass(canvas, model, scale, snap_values);
        }
        glass.toFront();

        return glass;
    }

    function update_glass(glass) {
        glass.update_color();        
        glass.update();
        glass.set_snap_value();
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

},{"../../dom":2,"../view":20,"./glass":14,"./highball_glass":16,"./ruler":17}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"../../dom":2,"./contour_line":12,"./ruler":17}],16:[function(require,module,exports){
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

},{"./glass":14}],17:[function(require,module,exports){
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
var ruler = function(canvas, config, MEASURE_LINE_WIDTH_) {
    var _ruler = canvas.set();

    var MEASURE_LINE_WIDTH = MEASURE_LINE_WIDTH_;
    if (config.reverse) {
        MEASURE_LINE_WIDTH = -MEASURE_LINE_WIDTH_;
    }
        

    var x = config.x || 0,
        y = config.y || 0,
        width = config.width || 50,
        height = config.height || 500,
        scale = config.scale || 2,
        orientation = config.orientation || "vertical";

    var background,
        ticks,
        labels,
        measure_line,
        glass_pane;

    draw();
    style({
        background: "yellow",
        stroke: "dimgray",
        stroke_width: 2,
        font_size: "12pt"
    });


    function move_measuring_line(e, x_, y_) {
        var path;

        var svgbb = canvas.canvas.getBoundingClientRect(),
            plus_left = svgbb.left +  window.pageXOffset,
            plus_top = svgbb.top + window.pageYOffset;

        if (orientation === "horizontal") {
            path = "M" + (x_ - plus_left) + "," + (y + height) + "v-" + MEASURE_LINE_WIDTH;
        } else {
            path = "M" + x + "," + (y_ - plus_top) + "h" + MEASURE_LINE_WIDTH;
        }
        measure_line.attr({
            "path": path
        });
    }

    function show_measuring_line() {
        glass_pane.mousemove(move_measuring_line);
        measure_line.show();
    }

    function hide_measuring_line() {
        glass_pane.unmousemove(move_measuring_line);
        measure_line.hide();
    }

    
    function draw() {
        background = canvas.rect(x, y, width, height);
        _ruler.push(background);
        _ruler.push(draw_ticks());
        _ruler.push(draw_labels());
        measure_line = canvas.path("M0,0");
        measure_line.attr({
            stroke: "crimson",
            "stroke-width": 2,
            "stroke-opacity": 0.5
        });
        _ruler.push(measure_line);
        measure_line.hide();
        glass_pane = canvas.rect(x, y, width, height);
        glass_pane.attr({
            fill: "white",
            opacity: 0,
            stroke: "white",
            "stroke-opacity": 0
        });
        _ruler.push(glass_pane);

        glass_pane.mouseover(show_measuring_line);
        glass_pane.mouseout(hide_measuring_line);

        function draw_labels() {
            labels = canvas.set();
            
            var ONE_CM_IN_PX = scale * 10,
                cm = 0;

            if (orientation === "vertical") {
                var h = y + height,
                    y_end = y + ONE_CM_IN_PX,
                    x_start = x + (width/4);

                while (h > y_end) {
                    h = h - ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(x_start, h, cm));
                }
            } else {
                var w = x,
                    x_end = x + width - ONE_CM_IN_PX,
                    y_start = y + (height/(4/3));

                while (w < x_end) {
                    w = w + ONE_CM_IN_PX;
                    cm++;
                    labels.push(canvas.text(w, y_start, cm));
                }
            }


            return labels;
        }

        function draw_ticks() {
            var CM_SIZE = 13,
                HALF_CM_SIZE = 8,
                MM_SIZE = 5,
                cm_ticks = canvas.path(create_ticks_path(0, CM_SIZE)),
                half_cm_ticks = canvas.path(create_ticks_path(scale*5, HALF_CM_SIZE));

            ticks = canvas.set();
            cm_ticks.attr("stroke-width", 1);
            ticks.push(cm_ticks);
            half_cm_ticks.attr("stroke-width", 1);
            ticks.push(half_cm_ticks);
            [1, 2, 3, 4, 6, 7, 8, 9].forEach(draw_mm_ticks);

            function draw_mm_ticks(step) {
                  var mm_ticks = canvas.path(create_ticks_path(scale*step, MM_SIZE));
                  mm_ticks.attr("stroke-width", 0.5);
                  ticks.push(mm_ticks);
            }

            function create_ticks_path(step, size) {
                var ONE_CM_IN_PX = scale * 10,
                    ticks_path;
                if (orientation === "vertical") {
                    var h = y + height + step,
                        y_end = y + ONE_CM_IN_PX,
                        x_start = x + width;

                    while (h > y_end) {
                        h = h - ONE_CM_IN_PX;
                        ticks_path += "M" + x_start + "," + h + "h-" + size;
                    }
                } else {
                    var w = x - step,
                        x_end = x + width - ONE_CM_IN_PX,
                        y_start = y;

                    while (w < x_end) {
                        w = w + ONE_CM_IN_PX;
                        ticks_path += "M" + w + "," + y_start + "v" + size;
                    }
                }

                return ticks_path;
            }

            return ticks;
        }

    }

    function style(config) {
        if (config.background) {
            background.attr("fill", config.background);
        }
        if (config.stroke) {
            background.attr("stroke", config.stroke);
            ticks.attr("stroke", config.stroke);

        }
        if (config.stroke_width) {
            background.attr("stroke-width", config.stroke_width);
        }
        if (config.font_size) {
            labels.attr("font-size", config.font_size);
        }
        if (config.font_family) {
            labels.attr("font-family", config.font_family);
        }

        return _ruler;
    }

    _ruler.style = style;

    return _ruler;

};

module.exports = ruler;

},{}],18:[function(require,module,exports){
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
    const select = $(elt);
    const value = select.val();

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

    const graph_lines = lines
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
            .on("mouseout.tangent_triangle", remove_tangent_triangle(model_name));

    // Do not show the tangent line on an extensible highball glass' graph
    // because they can be moved and then they can be out of sync.
    if (!model.extensible) {
      graph_lines
        .on("mouseover.tangent_triangle", add_tangent_triangle(model_name))
        .on("mousemove.tangent_triangle", add_tangent_triangle(model_name));
    }

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
      if ("height" === quantity_name && config.world_height) {
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

},{"../dom":2,"./view":20}],19:[function(require,module,exports){
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
const dom = require("../dom");

const table = function(config) {
  const _table = require("./view")(config);

  let model_specs = config.models;

  const hide_actions = config.hide_actions || [];
  function show_this_action(action_name) {
    return hide_actions.indexOf(action_name) === -1;
  }

  function remove_action() {
    return {
      name: "remove",
      group: "edit",
      icon: "fa-remove",
      tooltip: I18N.remove_this_model,
      enabled: true,
      callback: function(model) {
        return function() {
          model.action("reset").callback(model)();
          config.microworld.unregister(model.name);
        };
      }
    };
  }

  function add_model() {
    return function() {
      if (this.selectedIndex > 0) {
        const selected_option = this.options[this.selectedIndex].value;
        const model = model_specs[selected_option];
        config.microworld.register(model);
        this.selectedIndex = 0;
      }
    };
  }

  const table_fragment = document
    .createDocumentFragment()
    .appendChild(dom.create({
      name: "table"
    }));

  function create_model_option_list(list) {
    function create_option(model, index) {
      return {
        name: "option",
        text: I18N[model.name],
        attributes: {
          value: index
        }
      };
    }

    return {
      name: "select",
      attributes: {
        "class": "model_list form-control"
      },
      children: [{
        name: "option",
        text: I18N.add_a_model + "…",
        value: -1
      }].concat(list.map(create_option)),
      on: {
        type: "change",
        callback: add_model()
      }
    };
  }

  const create_foot = function() {
    const table_foot = table_fragment
      .appendChild(dom.create({name: "tfoot"}));

    table_foot.appendChild(dom.create({
      name: "tr",
      children: [
      {
        name: "th",
        attributes: {
          "data-list": true
        },
        children: [create_model_option_list(config.models)]
      }, {
        name: "th",
        attributes: {
          "class": "corner",
          "colspan": Object.keys(_table.quantities).length + 2
        }
      }
      ]
    }));

  };
  create_foot();

  _table.add_models_to_list = function(new_model_specs) {
    const list = model_specs.concat(new_model_specs);

    const model_list_select = table_fragment.querySelector("select.model_list");
    if (model_list_select) {
      const parent = model_list_select.parentNode;
      parent.removeChild(model_list_select);
      parent.appendChild(dom.create(create_model_option_list(list)));
    }

    model_specs = list;
  };


  const create_head = function() {
    const table_head = table_fragment.appendChild(dom.create({name: "thead"}));
    const head = table_head.appendChild(dom.create({name: "tr"}));

    // name column
    head.appendChild(dom.create({
      name: "th",
      attributes: { 
        "class": "corner",
        "colspan": 2
      }
    }));

    // quantities, if any
    const number_of_quantities = Object.keys(_table.quantities)
      .filter(function(q) {return !_table.quantities[q].not_in_table;})
      .length;
    if (number_of_quantities > 0) {
      const add_cell = function(q) {
        const quantity = _table.quantities[q];

        head.appendChild( dom.create({
          name: "th",
          value: I18N[quantity.name],
          attributes: {
            "data-quantity": quantity.name
          }
        }));
      };                            

      Object.keys(_table.quantities)
        .filter(function(q) {return !_table.quantities[q].not_in_table;})
        .forEach(add_cell);
    }

    // actions, if any
    head.appendChild(
        dom.create({
          name: "th",
          attributes: {
            "class": "corner"
          }
        })
        );
  };
  create_head();

  // create body
  const table_body = table_fragment.appendChild(dom.create({name: "tbody"}));

  const add_row = function(model) {
    let row;

    const create_quantity_elt = function(q) {

      const quantity = _table.quantities[q];
      const cell = {
        name: "td",
        attributes: {
          "data-quantity": q
        }
      };

      if (quantity.monotone) {
        cell.children = [{
          name: "input",
          attributes: {
            "type": "text",                        
            "pattern": "(\\+|-)?\\d*((\\.|,)\\d+)?",
            "title": I18N.change + " " + I18N[q]
          },
          on: {
            type: "change",
            callback: function() {
              const value = this.value;
              if (value < model.get_minimum(q)) {
                model.reset();
              } else if (model.get_maximum(q) < value) {
                model.finish();
              } else {
                model.set( q, value );
              }
            }
          }

        }];
      } else {
        cell.children = [{
          name: "span",
          attributes: { "class": "measurement" }
        }];
      }

      if (quantity.unit) {
        cell.children.push({
          name: "span",
          attributes: {
            "class": "unit" },
            value: quantity.unit
        });
      }
      return cell;
    },
    quantity_elts = Object.keys(_table.quantities)
      .filter(function(q) {
        return !_table.quantities[q].not_in_table;
      })
    .map(create_quantity_elt);

    let group;
    const create_action_elt = function(action_name) {
      const action = model.action(action_name);
      let classes = "action";
      if (group && group !== action.group) {
        group = action.group;
        classes += " left-separator";
      } else {
        group = action.group;
      }

      const attributes = {
        "class": classes,
        "data-action": action_name
      };

      if (action.type && action.type === "slider") {
        attributes.type = "range";
        attributes.min = 1;
        attributes.max = 4 * model.step_size();
        attributes.step = 1;
        attributes.value = model.step_size() * 2;
        attributes.title = action.tooltip;

        return {
          name: "input",
          attributes: attributes,
          on: {
            type: "change",
            callback: action.install()
          }

        };
      } else {
        attributes["class"] = attributes["class"] + " btn";
        if (action.toggled) {
          attributes["data-toggled"] = true;
        }
        attributes.title = action.tooltip;
        return {
          name: "button",
          attributes: attributes,
          children: [{
            name: "i",
            attributes: {
              "class": "fa " + action.icon
            }
          }],
          on: {
            type: "click",
            callback: action.install()
          }

        };
      }
    };


    model.add_action(remove_action());
    const actions_elts = Object.keys(model.actions).filter(show_this_action).map(create_action_elt);

    let translated_name = "";
    if (model.extensible) {
      // Extensible models have a special name
      translated_name = I18N.extensible_highball_glass + " " + model.name.split("_").pop();
    } else {
      translated_name = I18N[model.name];
    }

    row = table_body.appendChild(
        dom.create( {
          name: "tr",
          attributes: {
            "id": model.name
          },
          children: [{
            name: "td",
            value: translated_name,
            attributes: { "class": "glass-name " + model.name }
          },{
            name: "td",
            attributes: {
              "class": "color",
              "title": I18N.click_to_change_color
            },
            children: [{
              name: "span",
              value: "",
              on: {
                type: "click",
                callback: function() {
                  model.color("random");
                  model.update_views();
                }
              },
              style: {
                width: "15px",
                height: "15px",
                border: "1px solid dimgray",
                "background": model.color(),
                display: "block"
              }
            }]
          }].concat(quantity_elts).concat([{
            name: "td",
            children: actions_elts
          }])
        }));

    return row;


  };

  const update_row = function(row, model) {

    const color_cell = row.querySelector(".color span");
    if (color_cell) {
      color_cell.style.background = model.color();
    }

    const moment = model.current_moment(),
    update_quantity = function(q) {
      const quantity = _table.quantities[q];
      if (quantity && !quantity.not_in_table) {
        const query = "[data-quantity='" + q + "']",
          cell = row.querySelector(query);

        if (quantity.monotone) {
          cell.children[0].value = moment[q].toFixed(quantity.precision || 0);
        } else {
          // Hack to get locale decimal seperator in Chrome.
          // Does not work nicely in other browsers as Chrome
          // makes the input type=number automatically
          // localized
          const FLOATING_EXAMPLE = 1.1;
          const dec_sep = FLOATING_EXAMPLE.toLocaleString()[1] || ".";
          cell.children[0].innerHTML = moment[q].toFixed(quantity.precision || 0).replace(/\./, dec_sep);
        }
      }
    };


    Object.keys(moment)
      .forEach(update_quantity);

    const update_action =  function(action_name) {
      const query = "button[data-action='" + action_name + "']",
      button = row.querySelector(query);

      if (button) {
        const action = model.action(action_name);
        if (action.enabled) {
          button.removeAttribute("disabled");
        } else {
          button.setAttribute("disabled", true);
        }

      }

    };

    Object.keys(model.actions).forEach(update_action);
  };

  _table.remove = function(model_name) {
    const row = table_body.querySelector("tr#" + model_name);
    if (row) {
      table_body.removeChild(row);
    }
  };

  _table.update = function(model_name) {
    const model = _table.get_model(model_name);

    if (!model.row) {
      model.row = add_row(model.model);
    }

    update_row(model.row, model.model);
  };

  _table.fragment = table_fragment;
  return _table;
};

module.exports = table;

},{"../dom":2,"./view":20}],20:[function(require,module,exports){
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
const view = function(config) {
  const _view = {};
  _view.snap_values = {};

  // Quantities to show
  const show = function(quantity) {
    return !config.quantities[quantity].hidden;
  },
  quantities = {},
  add_quantity = function(q) {
    const quantity = config.quantities[q];
    quantities[quantity.name] = Object.create(quantity);
  };
  Object.keys(config.quantities).filter(show).forEach(add_quantity);
  _view.quantities = quantities;


  // Observer pattern

  const models = {};

  _view.compute_extrema = function() {
    // WARNING SOMEHOW CHANGES THE QUANTITIES OF THE MODELS ...
    const compute_maximum = function(quantity_name){
      return function(max, model_name) {
        const model = models[model_name].model;
        return Math.max(max, model.get_maximum(quantity_name));
      };
    },
    compute_minimum = function(quantity_name){
      return function(min, model_name) {
        const model = models[model_name].model;
        return Math.min(min, model.get_minimum(quantity_name));
      };
    },
    compute_quantity_extrema = function(quantity_name) {
      const quantity = _view.quantities[quantity_name];

      quantity.minimum = Object.keys(models)
        .reduce(compute_minimum(quantity_name), Infinity);
      quantity.maximum = Object.keys(models)
        .reduce(compute_maximum(quantity_name), -Infinity);
    };

    Object.keys(_view.quantities)
      .forEach(compute_quantity_extrema);
  };

  _view.register = function(model) {
    const model_found = Object.keys(models).indexOf(model.name);
    if (model_found === -1) {
      models[model.name] = {
        model: model
      };
      model.register(_view);
    }
  };

  _view.unregister = function(model_name) {
    if (models[model_name]) {
      models[model_name].model.unregister(_view);
      _view.remove(model_name);
      delete models[model_name];
      _view.compute_extrema();
      _view.update_all();
    }
  };

  _view.get_model = function(model_name) {
    return models[model_name];
  };

  _view.remove = function(/*model_name*/) {
    // implement in specialized view; called by unregister
  };

  _view.update_all = function() {
    Object.keys(models).forEach(_view.update);
  };

  _view.update = function(/*model_name*/) {
    // implement in specialized view; called by registered model on
    // change
  };
  _view.models = models;

  _view.type = config.type || "view";

  return _view;    
};

module.exports = view;

},{}]},{},[11]);
