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
