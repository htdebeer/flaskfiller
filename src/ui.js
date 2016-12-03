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

  /*
  config.glassgrafter = {
    id: "designer"
  };
  */

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
