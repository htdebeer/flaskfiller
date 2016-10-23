---
title: FlaskFiller: Educational Software to Explore Instantaneous Speed
author: Huub de Beer
keywords:
- mathematics education
- primary education
- instantaneous speed
- speed
- calculus
...

FlaskFiller is an educational tool to explore instantaneous speed
qualitatively and quantitatively in primary school. FlaskFiller is made as
part of a [research on teaching instantaneous speed in grade
5](https://heerdebeer.org/DR/). During this research, four teaching
experiments have been performed. Each experiment used a new version of the
software. After the last experiment a new more polished version of FlaskFiller
is made. You can download this latest version [here](standalone-flaskfiller.html).

FlaskFiller is [free software](https://www.gnu.org/philosophy/free-sw.en.html)
released under the [GPL version
3](https://www.gnu.org/licenses/gpl-3.0.en.html). This means that you can use,
adapt, and distribute FlaskFiller as long as these adaptations are published
under the same license. The FlaskFiller source code is released on
[github](https://github.com/htdebeer/flaskfiller).

FlaskFiller used the following libraries:

- The simulation component is build with
  [Raphaël.js](http://dmitrybaranovskiy.github.io/raphael/)
- The graphing component is build with [d3](https://d3js.org/)
- The user interface is made with
  [Bootstrap](https://v4-alpha.getbootstrap.com/) and
  [jQuery](https://blog.jquery.com/)
- The icons used are from [Font Awesome](http://fontawesome.io/)

# Installing and using FlaskFiller

FlaskFiller is released both as a [standalone HTML
file](standalone-flaskfiller.html) which can be used without an internet
connection and a [source repository](https://github.com/htdebeer/flaskfiller)
you can clone and install on your server or locally. The latter can be
accomplished on a unix-like operating system as follows:

    git clone https://github.com/htdebeer/flaskfiller.git
    cd flaskfiller
    npm install

If you change the JavaScript code, use `npm run build` to generate a new
version of the `FlaskFiller.js` base library.

To generate a standalone version of FlaskFiller or a custom version of it, a
[Bash](https://www.gnu.org/software/bash/) script is supplied:
`create_standalone.sh`. This script uses [Pandoc](http://pandoc.org) to
generate the standalone version with all the assets embedded.


