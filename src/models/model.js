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
    if (arguments.length===0) {
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
    if (arguments.length===0) {
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
