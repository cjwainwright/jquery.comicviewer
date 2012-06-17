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
        var $back = $('<div class="comic-viewer-back"/>'),
            $center = $('<div class="comic-viewer-center"/>'),
            $box = $('<span class="comic-viewer-box"/>'),
            $viewport =  $('<div class="comic-viewer-viewport"/>'),
            $image = $('<img class="comic-viewer-image"/>').attr('src', this.attr('src')),
            $navPrev = $('<a class="comic-viewer-nav-prev"/>'),
            $navNext = $('<a class="comic-viewer-nav-next"/>');
        
        // build dom structure
        $back.append(
            $center.append(
                $box.append(
                    $viewport.append(
                        $image
                    ),
                    $navPrev,
                    $navNext
                )
            )
        );
        
        // append to document
        $('body').append($back);

        function setLandscape(landscape) {
            if(landscape) {
                $box.removeClass('comic-viewer-box-portrait').addClass('comic-viewer-box-landscape');
            } else {
                $box.removeClass('comic-viewer-box-landscape').addClass('comic-viewer-box-portrait');
            }
        }
        
        var rawPanels = getRawPanels(this.data('panels'));

        function setPanel(panel) {
            var rawPanel = rawPanels[panel];
            if(rawPanel) {
                var left = rawPanel[0],
                    top = rawPanel[1],
                    width = rawPanel[2],
                    height = rawPanel[3];
         
                var landscape = window.innerWidth > window.innerHeight;
                setLandscape(landscape);
                
                var availableWindowWidth = window.innerWidth - 64 - (landscape ? 64 : 0);
                var availableWindowHeight = window.innerHeight - 64 - (landscape ? 0 : 48);
         
                // choose the smallest scale factor
                var scale;
                if (availableWindowWidth / width > availableWindowHeight / height) {
                    scale = availableWindowHeight / height;
                } else {
                    scale = availableWindowWidth / width;
                }
                
                if(scale > 1) {
                    scale = Math.floor(scale * 4) / 4; // optimise scaling ratios to for best image quality
                }
                
                $viewport.css({
                    width: scale * width,
                    height: scale * height,
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
        
        function refreshPanel() {
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
        
        function destroy() {
            $back.remove();
            $(document).unbind('keydown', keydown);
            $(window).unbind('resize', refreshPanel);
        }
        
        $(document).bind('keydown', keydown);
        $(window).bind('resize', refreshPanel);
        
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
        
        $center.click(function (event) {
            if(event.target == this) {
                destroy();
            }
        });
        
        // add short delay to allow css transition to synchronize
        setTimeout(refreshPanel, 50);
        return this;
    };
})(jQuery);