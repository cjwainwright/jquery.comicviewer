(function ($) {
    function getRawPanels(panelData) {
        var rawPanels = [];
        $.each(panelData.split(';'), function (index, value) {
            var pattern = value.split(',');
            if (pattern.length == 4) {
                rawPanels.push(pattern);
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
        return rawPanels;
    }

    $.fn.comicViewer = function () {
        var that = this;
        var currentPanel = 0;
        
        // create elements
        var $box = $('<span class="comic-viewer comic-viewer-portrait"/>'),
            $viewport =  $('<div class="comic-viewer-viewport"/>'),
            $image = $('<img class="comic-viewer-image"/>').attr('src', this.attr('src')),
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
                    $navPrev.addClass('comic-viewer-nav-disabled');
                } else {
                    $navPrev.removeClass('comic-viewer-nav-disabled');
                }
            
                if (panel == rawPanels.length - 1) {
                    $navNext.addClass('comic-viewer-nav-disabled');
                } else {
                    $navNext.removeClass('comic-viewer-nav-disabled');
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
                    scale = Math.floor(scale * 4) / 4; // optimise scaling ratios to for best image quality
                }
                                
                $viewport.css({
                    width: scale * width,
                    height: scale * height,
                    marginTop: Math.floor((availableHeight - scale * height) / 2)
                });
                
                $image.css({
                    left: -left * scale, 
                    top: -top * scale,
                    width: that.width() * scale,
                    height: that.height() * scale
                });
                currentPanel = panel;
            } else {
                destroy();
            }
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
        
        function show() {
            // add short delay to allow css transition to synchronize
            $(document).on('keydown', keydown);
            $(window)
                .on('resize', refresh)
                .on('gesturechange', center)
                .on('scroll', center)
                .on('orientationchange', rotate);

            rotate();
            $('body').append($box);
            setTimeout(refresh, 50);
        }
        
        this.click(show);
        
        return this;
    };
})(jQuery);