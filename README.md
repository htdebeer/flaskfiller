# FlaskFiller—Educational Software to Explore Instantaneous Speed

## Introcuction

FlaskFiller is a learning tool to explore instantaneous speed in primary
school. It has been made as part of a [research on teaching instantaneous
speed in grade 5](https://heerdebeer.org/DR/). During this research, four
teaching experiments have been performed and in each experiment used a new
version of the software has been developed and used. After the last experiment
a more polished version of FlaskFiller has been developed. You can download
and use this latest and greatest version of FlaskFiller
[here](standalone_flaskfiller.html)!

## Using FlaskFiller

[![Figure 1. Using FlaskFiller to explore filling a cocktail glass and a beer
glass.](flaskfiller.png)](standalone_flaskfiller.html)

### Getting FlaskFiller

The easiest way to use FlaskFiller is to [open](standalone_flaskfiller.html)
it in your web browser. You then can save FlaskFiller to a folder on your
computer and use it without an internet connection, send it to others by
email, putting it on your own website, and so on. All you need to use
FlaskFiller is a [FlaskFiller HTML file](standalone_flaskfiller.html) and a
modern web browser, such as
[Firefox](https://www.mozilla.org/en-US/firefox/new/) or
[Chromium](https://www.chromium.org/).

Because FlaskFiller is [free
software](https://www.gnu.org/philosophy/free-sw.en.html) you can download its
source code and adapt it to your liking. See [the section on adapting
FlaskFiller](#adapting-flaskfiller) for more information on creating your own
FlaskFiller.

### Exploring filling glassware with FlaskFiller

FlaskFiller consists of four configurable components (see Figure 1) that
interact with each other:

1.  In Figure 1, you see the simulation of filling a cocktail glass with a
    greenish liquid and a beer glass with a purple liquid.  To start the
    simulation of filling a glass, double-click on a glass or use the control
    (see the last component).  Clicking on a glass that is being filled,
    pauses the simulation. Changes in the simulation are reflected in the
    other three components (and vice versa).

    You can drag glasses around in the simulation. When you drag a glass over
    another glass, it snaps to that other glass' center line. This makes it
    easier to align different glasses.

    Do note that the glass' position in the simulation has no effect on the
    other components. As you can see in Figure 1, the beer glass have been
    moved about 2cm, yet its graph still starts at 0cm. This is intentional.

    When you move your mouse pointer over a ruler, a red helper line will
    show.

2.  In the graph component you see a line graph of the cocktail glass and a
    bar chart of the beer glass. FlaskFiller also has a third type of graph,
    the arrow graph. You can enable the arrow chart via the settings tab
    (which is discussed in the [next section: Configuring
    FlaskFiller](#configuring-flaskfiller)) to explore what it does.

    In Figure 1 the mouse cursor hovers over the cocktail glass' line graph at
    the point (1.31s, 12.19cm). You can configure FlaskFiller to show
    different aspects of the situation described by a point on a line graph.
    Furthermore, you can choose which quantities to plot on the axes.
    FlaskFiller supports quantities time, height, volume, and the rising
    speed. 

3.  On the bottom you see the control component combined with the table (more
    about that later). Using the control you can start, pause, restart or
    finish the simulation. You can also show or hide graphs, change the
    step-size of a bar chart and arrow graph. To change the color of a glass'
    liquid, you click on its colored square. A random color will be chosen.
   
    Furthermore, through the control component you can add and remove a glass.
    Note the option to add an extensible highball glass. The extensible
    highball glass is the only glass that can be added multiple times. And you
    can change its size by dragging its handle at the upper-right corner of
    the glass.

4.  Finally, the situation of filling glassware is described quantitatively by
    a table. The table component is combined with the control component.  You
    can configure what quantities to show in the table component, if any.
    Furthermore, the values in the quantities' columns can be edited. For
    example, if you would change the cocktail glass' volume to 100ml and press
    Enter, the table, simulation, and graph components will be updated to
    reflect that change.

Each component but the control can be hidden.  If your web browser window is
too small, the graph component will be shown below the simulation instead of
alongside it. If you change the browser window's size, reload the page to have
it resize properly.

### Configuring FlaskFiller

FlaskFiller is highly configurable. Settings are stored in the web browser.
When you open FlaskFiller again in the same web browser, it will use the same
settings as you had when you had last time you used FlaskFiller.

Open the Settings tab to configure the following aspects of FlaskFiller:

-   **General**: select which components you want to show in FlaskFiller. By
    default the *simulation*, *graph*, *table*, and *control* components are
    selected.  You cannot deselect the *control* component.

-   **Simulation**: change the *height of the simulated world*. After changing
    the *height*, the FlaskFiller application needs to be reloaded.

-   **Graph**:
  
    -   Select the *horizontal axis' quantity*, which is one of height, time,
        volume, or rising speed.
    -   Select the *vertical axis' quantity*, which is one of height, time,
        volume, or rising speed. Note that you can select the same quantity
        for both axes, which can make for an interesting topic of discussion.
    -   Select which *graph types* can be shown. The supported graph types
        are:
    
        - *line graph*
        - *bar graph*
        - *arrow graph*

    You can show or hide a graph of a particular glass by toggling its
    corresponding icon in the control component.

    -   Various *options*:

        -   *Show the coordinates* of the point on a line graph the mouse
            points at.
        -   *Show the rising speed* in the point on a line graph the mouse
            points at.
        -   *Show the tangent line* to the point on a line graph the mouse
            points at.
        -   *Show a slider to change the step-size* between the subsequent
            bars in a bar graph or the arrows in an arrow graph.
        -   *Make the line graphs of the extensible highball glass moveable*.
            This allows you to move these line graphs over other graphs to
            explore the idea of a tangent line.

-   **Table**: select which quantities to show. You can enable each of
    *height*, *time*, *volume*, and *rising speed*.

-   **Control**: select which glasses can be added in FlaskFiller. You can
    select the following glasses:

    -   *cocktail glass*, which will be shown by default if selected
    -   *highball glass*
    -   *extensible highball glass*, which can be added multiple times
    -   *wine glass*
    -   *cognac glass*
    -   *beer glass*.

When FlaskFiller needs to be reloaded for the changes to take effect, you will
see a message on top of the settings tab.

## Adapting FlaskFiller

### FlaskFiller is free software

FlaskFiller is [free
software](https://www.gnu.org/philosophy/free-sw.en.html); FlaskFiller is
released under the [GPL version
3](https://www.gnu.org/licenses/gpl-3.0.en.html). This means that you can use,
adapt, and distribute FlaskFiller as long as these adaptations are published
under the same free license. The FlaskFiller source code is released on
[github](https://github.com/htdebeer/flaskfiller).

Furthermore, FlaskFiller is build using the following free and/or open source
libraries:

-   The simulation component is build with
    [Raphaël.js](http://dmitrybaranovskiy.github.io/raphael/)
-   The graphing component is build with [d3](https://d3js.org/)
-   The user interface is made with
    [Bootstrap](https://v4-alpha.getbootstrap.com/) and
    [jQuery](https://blog.jquery.com/)
-   The icons used are from [Font Awesome](http://fontawesome.io/)

## Adapting FlaskFiller to suit your needs

You can download FlaskFiller's [source repository](https://github.com/htdebeer/flaskfiller)
by cloning it to your hard drive and install it as follows (on an UNIX-like operating system):

~~~{.bash}
git clone https://github.com/htdebeer/flaskfiller.git
cd flaskfiller
npm install
~~~

If you change the JavaScript code, use `npm run build` to generate a new
version of the `FlaskFiller.js` base library.

To generate a standalone version of FlaskFiller or a custom version of it, a
[Bash](https://www.gnu.org/software/bash/) script is supplied:
`create_standalone.sh`. This script uses [Pandoc](http://pandoc.org) to
generate the standalone version with all the assets embedded.
