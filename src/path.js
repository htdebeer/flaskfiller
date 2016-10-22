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
