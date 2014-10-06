jquery.comicviewer
==================

Panel by panel viewer for web comics, ideal for viewing on mobile devices where space is limited.

Usage
-----

Simply add a `data-panels` attribute to your image. The value of the attribute represents the position and size of each panel,
separated by semi-colons. The format for each panel is `left,top,width,height` measured in pixels. For example

```html
<img id="comic" data-panels="0,0,200,300;200,0,300,300" src="comic.png" />
```
    
Here we have specified 2 panels the first is at `left: 0px; top: 0px; width: 200px; height: 300px` and the second at `left: 200px; top: 0px; width: 300px; height: 300px`.
More panels can be specified as desired.

Note, panel pixel sizes should be specified in terms of the natural, unstyled, size of the image.

There is also a shorthand syntax for a repetitive pattern of panels with format `count,countX,stepX,stepY,width,height,offsetX,offsetY`. 
These have the following meaning

* `count` - Number of panels in the pattern
* `countX` - Number of panels across before the pattern wraps to a new line
* `stepX` - How much to move horizontally between each panel
* `stepY` - How much to move vertically between each line
* `width` - Width of each panel
* `height` - Height of each panel
* `offsetX` - Starting x-coordinate of the pattern
* `offsetY` - Starting y-coordinate of the pattern

These panel definitions can be mixed using both formats in one semi-colon separated list.

To create the comic viewer, simply initialise the jquery plugin on the comic image and call the `show` method, for example:

```js
var viewer = $('#comic').comicViewer();
$('#launcher').click(function(){
    viewer.show();
});
```

Panel Builder
-------------

To easily construction of the data-panels attribute you can make use of the panel builder tool.
Simply drop your comic image onto the workspace and use the GUI to define your panels.
Dragging conveniently snaps to the edges of your image and the edges of other panels you've created.
You can use the preview tool as you go along to check how it'll look in the comic viewer.
Once you're happy copy the output data and paste it into your html data-panels attribute.

[Try the Panel Builder.](https://rawgit.com/cjwainwright/jquery.comicviewer/master/panelbuilder/index.html)

