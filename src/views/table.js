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
      tooltip: "Remove this model",
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
        text: model.name.replace("_", " "),
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
        text: "toevoegen ...",
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
          value: quantity.name.replace("_", " "),
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
            "pattern": "(\\+|-)?\\d*((\\.|,)\\d+)?"
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

    row = table_body.appendChild(
        dom.create( {
          name: "tr",
          attributes: {
            "id": model.name
          },
          children: [{
            name: "td",
            value: model.name.split("_").join(" "),
            attributes: { "class": model.name }
          },{
            name: "td",
            attributes: {
              "class": "color"
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
