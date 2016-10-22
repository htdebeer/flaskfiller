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
