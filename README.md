jquery.comicviewer
==================

Panel by panel viewer for web comics, ideal for viewing on mobile devices where space is limited.

Usage
-----

Add a `data-panels` attribute to your image. The value of the attribute represents the position and size of each panel,
separated by semi-colons. The format for each panel is `left,top,width,height` measured in pixels. For example

```html
<img id="comic" data-panels="0,0,200,300;200,0,300,300" src="comic.png" width="500" height="300"/>
```
    
Here we have specified 2 panels the first is at left=0px, top=0px, width=200px, height=300px and the second at left=200px, top=0px, width=300px, height=300px.
More panels can be specified as desired.

There is also a shorthand syntax for a repetitive pattern of panels with format `count,countX,stepX,stepY,width,height,offsetX,offsetY`. 
These have the following meaning

* count - Number of panels in the pattern
* countX - Number of panels across before the pattern wraps to a new line
* stepX - How much to move horizontally between each panel
* stepY - How much to move vertically between each line
* width - Width of each panel
* height - Height of each panel
* offsetX - Starting x-coordinate of the pattern
* offsetY - Starting y-coordinate of the pattern

These panel definitions can be mixed using both formats in one semi-colon separated list.

To create the comic viewer, simply initialise the jquery plugin on the comic image.

```js
$('#comic').comicViewer()
```
    
Clicking on the image will now show the comic viewer, allowing you to step through the comic panel by panel.