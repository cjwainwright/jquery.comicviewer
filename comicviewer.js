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
        var $frame = $('<div class="comic-viewer-frame"/>'),
            $viewport = $('<div class="comic-viewer-viewport"/>'),
            $image = $('<img class="comic-viewer-image"/>').attr('src', this.attr('src'));
        $('body').append($frame.append($viewport.append($image)));

        var rawPanels = getRawPanels(this.data('panels'));

        function setPanel(panel) {
            var rawPanel = rawPanels[panel];
            if(rawPanel) {
                var left = rawPanel[0],
                    top = rawPanel[1],
                    width = rawPanel[2],
                    height = rawPanel[3];
                
                // choose the smallest scale factor
                var scale;
                if (window.innerWidth / width > window.innerHeight / height) {
                    scale = window.innerHeight / height;
                } else {
                    scale = window.innerWidth / width;
                }
                
                scale *= 0.9;
                if(scale > 1) {
                    scale = Math.floor(scale); // optimise scaling ratios to be integer for best image quality
                }
                
                $viewport.css({
                    width: scale * width,
                    height: scale * height,
                    marginTop: -scale * height/2
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
            $frame.remove();
            $(document).unbind('keydown', keydown)
        }
        
        $(document).bind('keydown', keydown)
        
        $viewport.click(function (event) {
            if (event.which == 1) {
                setPanel(currentPanel + (event.shiftKey ? -1 : 1)); 
            }
            event.stopPropagation();
        });
        
        $frame.click(function () {
            destroy();
        });
        
        // add short delay to allow css transition to synchronize
        setTimeout(function () {
            setPanel(currentPanel);
        }, 50);
        return this;
    };
})(jQuery);