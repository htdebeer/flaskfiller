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
