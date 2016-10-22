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
const longdrink_model = require("./models/longdrink_glass");
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
    hoogte: {
      name: "hoogte",
      minimum: 0,
      maximum: 10,
      value: 0,
      label: "hoogte in cm",
      unit: "cm",
      stepsize: 0.01,
      precision: 2,
      monotone: true
    },
    tijd: {
      name: "tijd",
      minimum: 0,
      maximum: 100,
      value: 0,
      label: "tijd in sec",
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
      label: "volume in ml",
      unit: "ml",
      stepsize: 0.01,
      precision: 2,
      monotone: true
    },
    stijgsnelheid: {
      minimum: 0,
      maximum: 0,
      value: 0,
      unit: 'cm/sec',
      name: 'stijgsnelheid',
      label: 'stijgsnelheid in cm/sec',
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
      horizontal: "tijd",
      vertical: "hoogte",
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

  if (config.glassgrafter) {
    const gg = glassgrafter(config.glassgrafter);
    const elt = document.getElementById(config.glassgrafter.id);
    if (!elt) {
      throw new Error("Unable to find element with id=" + config.glassgrafter.id);
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
      case "longdrink":
        model = longdrink_model(model_spec.name, {
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
