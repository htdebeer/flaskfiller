#!/bin/bash 
#
##
# Generate a standalone version of the flaskfiller web application. A
# standalone version does not need the internet to run, all assets are URL
# encoded embedded in the generated HTML file.
#
# Usage:
# 
#   ./create_standalone.sh [non-standalone file or language code]
#
#   If optional argument "non-standalone file or language code" is "nl", the
#   Dutch version of the standalone flaskfiller web application is generated.
#   If it is "en" the English version is generated. Any other value is treated
#   as a file name of a non-standalone version of flaskfiller to be converted
#   to a standalone version. This allows you to create custom flaskfiller
#   applications and convert them to a standalone version.
#
#   If no argument is supplied, the English "flaskfiller.html" file is used as
#   a template.
#
# Examples:
#
#   To generate the full FlaskFiller application in Dutch:
#
#     ./create_standalone.sh nl
#
#   To generate a standalone version of a custom FlaskFiller application named
#   "graph_only.html":
#
#   ./create_standalone.sh graph_only.html
#
# Dependencies:
#
#   pandoc [http://pandoc.org/] is used to generated the standalone version
#   with all the URL encoded assets embedded in it. See pandoc's website on
#   how to install and use pandoc.
##

TEMPLATE=${1:-flaskfiller.html}

# Two default templates are defined
if [[ "$TEMPLATE" == "nl" ]]; then
  TEMPLATE="flessenvuller.html"
else 
  if [[ "$TEMPLATE" == "en" ]]; then
    TEMPLATE="flaskfiller.html"
  fi
fi 

OUT_FILE="standalone_$TEMPLATE"

echo "" | pandoc \
  --from markdown \
  --to html \
  --template $TEMPLATE \
  --standalone \
  --self-contained \
  -o $OUT_FILE
