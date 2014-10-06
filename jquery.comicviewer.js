/*!
Copyright (c) 2012, C J Wainwright, http://cjwainwright.co.uk

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function ($) {
    function getRawPanels(panelData) {
        var rawPanels = [];
        if(panelData)
        {
            $.each(panelData.split(';'), function (index, value) {
                var pattern = value.split(',');
                if (pattern.length == 4) {
                    rawPanels.push($.map(pattern, function (v) { return v - 0; }));
                } else if (pattern.length == 8) {
                    var count = pattern[0] - 0,
                        countX = pattern[1] - 0,
                        stepX = pattern[2] - 0,
                        stepY = pattern[3] - 0,
                        width = pattern[4] - 0,
                        height = pattern[5] - 0,
                        offsetX = pattern[6] - 0,
                        offsetY = pattern[7] - 0;
                    for(var n = 0; n < count; n++) {
                        rawPanels.push([stepX * (n % countX) + offsetX, stepY * Math.floor(n / countX) + offsetY, width, height]);
                    }
                }
            });
        }
        return rawPanels;
    }
    
    function within(value, min, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        }
        return value;
    }
    
    function index(arr, fn) {
        for (var i = 0, c = arr.length; i < c; i++) {
            if (fn(arr[i])) {
                return i;
            }
        }
        return -1;
    }
    
    function findPanelByCoord(rawPanels, x, y) {
        return index(rawPanels, function (panel) {
            return ((panel[0] <= x) && (panel[1] <= y) && (x <= panel[0] + panel[2]) && (y <= panel[1] + panel[3]));
        });
    }
    
    function imageReady($img, callback) {
        if($img[0].complete) {
            setTimeout(callback, 0);
        } else {
            $img.load(callback);
        }
    }
        
    function getNaturalSize($img, callback) {
        var img = $img[0];
        if('naturalWidth' in img) {
            imageReady($img, function () {
                callback(img.naturalWidth, img.naturalHeight);
            });
        } else {
            var $image = $('<img />').attr('src', $img.attr('src'));
            imageReady($image, function () {
                var $frame = $('<iframe src="javascript:<html></html>;"/>');
                $('body').append($frame);
                $frame.contents().find('body').append($image);
                callback($image.width(), $image.height());
                $frame.detach();
            });
        }
    }
    
    $.fn.comicViewer = function () {
        var that = this;
        var currentPanel = 0;
        
        // create elements
        var $box = $('<span class="comic-viewer comic-viewer-portrait"/>'),
            $viewport =  $('<div class="comic-viewer-viewport"/>'),
            $image = $('<img class="comic-viewer-image"/>').attr('src', this.attr('src')), // note we override any global styles on images which affect their width/height by setting them back to auto
            $nav = $('<div class="comic-viewer-nav"/>'),
            $navPrev = $('<a class="comic-viewer-nav-prev"><span class="comic-viewer-arrow-prev"/></a>'),
            $navNext = $('<a class="comic-viewer-nav-next"><span class="comic-viewer-arrow-next"/></a>');
            
        // build dom structure
        $box.append(
            $nav.append(
                $navPrev,
                $navNext
            ),
            $viewport.append(
                $image
            )
        );
        
        var rawPanels = getRawPanels(this.data('panels'));

        function center() {
            $box.css({
                top: window.pageYOffset,
                left: window.pageXOffset,
                height: window.innerHeight,
                width: window.innerWidth
            });
        }

        function rotate() {
            var orientation = window.orientation;
            if ((orientation == 90) || (orientation == -90)) {
                $box.removeClass('comic-viewer-portrait').addClass('comic-viewer-landscape');
            } else {
                $box.removeClass('comic-viewer-landscape').addClass('comic-viewer-portrait');
            }
        }
                
        function setPanel(panel) {
            var rawPanel = rawPanels[panel];
            if(rawPanel) {
                if (panel == 0) {
                    $navPrev.addClass('comic-viewer-nav-end');
                } else {
                    $navPrev.removeClass('comic-viewer-nav-end');
                }
            
                if (panel == rawPanels.length - 1) {
                    $navNext.addClass('comic-viewer-nav-end');
                } else {
                    $navNext.removeClass('comic-viewer-nav-end');
                }
                
                var left = rawPanel[0],
                    top = rawPanel[1],
                    width = rawPanel[2],
                    height = rawPanel[3];
         
             
                var landscape = $box.hasClass('comic-viewer-landscape');
                var availableWidth = $box.width() * (landscape ? 0.8 : 1); // These factors match those in the stylesheet
                var availableHeight = $box.height() * (landscape ? 1 : 0.85);
         
                // choose the smallest scale factor
                var scale;
                if (availableWidth / width > availableHeight / height) {
                    scale = availableHeight / height;
                } else {
                    scale = availableWidth / width;
                }

                var paddingFactor = 0.9;
                scale *= paddingFactor;
                if(scale > 1) {
                    scale = Math.floor(scale * 4) / 4; // TODO - optimise scaling ratios for best image quality
                }
                                
                $viewport.css({
                    width: scale * width,
                    height: scale * height,
                    marginTop: Math.floor((availableHeight - scale * height) / 2)
                });
                
                getNaturalSize(that, function (naturalWidth, naturalHeight) {
                    $image.css({
                        left: -left * scale, 
                        top: -top * scale,
                        width: naturalWidth * scale,
                        height: naturalHeight * scale
                    });
                });
                
                currentPanel = panel;
            } else {
                destroy();
            }
        }
        
        function getPanel(data) {
            if (data) {
                if (data.panel != null) {
                    return within(data.panel, 0, rawPanels.length - 1);
                } else if ((data.x != null) && (data.y != null)) {
                    var panel = findPanelByCoord(rawPanels, data.x, data.y);
                    if (panel >= 0) {
                        return panel;
                    }
                }
            }
            return 0;
        }
        
        function refresh() {
            center();
            setPanel(currentPanel);
        }
        
        function keydown(event) {
            switch(event.which) {
                case 27: //escape
                    destroy();
                    break;
                case 37: //left
                    event.preventDefault();
                    setPanel(currentPanel - 1); 
                    break;
                case 39: //right
                    event.preventDefault();
                    setPanel(currentPanel + 1); 
                    break;
            }
        }
        
        $viewport.click(function (event) {
            if (event.which == 1) {
                setPanel(currentPanel + (event.shiftKey ? -1 : 1)); 
            }
        });
        
        $navPrev.click(function (event) {
            setPanel(currentPanel - 1);
        });

        $navNext.click(function (event) {
            setPanel(currentPanel + 1);
        });
        
        $box.click(function (event) {
            if(event.target == this) {
                destroy();
            }
        });

        function destroy() {
            currentPanel = 0;
            $box.detach();
            $(document).off('keydown', keydown);
            $(window)
                .off('resize', refresh)
                .off('gesturechange', center)
                .off('scroll', center)
                .off('orientationchange', rotate);
        }
                
        function show(init) {
            currentPanel = getPanel(init);
            
            $(document).on('keydown', keydown);
            $(window)
                .on('resize', refresh)
                .on('gesturechange', center)
                .on('scroll', center)
                .on('orientationchange', rotate);

            rotate();
            $('body').append($box);

            // add short delay before refreshing to allow css transition to synchronize
            setTimeout(refresh, 50);
        }
        
        return {
            show: show
        };
    };
})(jQuery);