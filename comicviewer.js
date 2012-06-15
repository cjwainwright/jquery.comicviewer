(function ($) {
    function getRawPanels(panelData) {
        var rawPanels = [];
        $.each(panelData.split(';'), function (index, value) {
            var pattern = value.split(',');
            if (pattern.length == 4) {
                rawPanels.push(pattern);
            } else if (pattern.length == 6) {
                var count = pattern[0],
                    countX = pattern[1],
                    stepX = pattern[2],
                    stepY = pattern[3],
                    width = pattern[4],
                    height = pattern[5];
                for(var n = 0; n < count; n++) {
                    rawPanels.push([stepX * (n % countX), stepY * Math.floor(n / countX), width, height]);
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
                
                scale = Math.floor(scale * 0.9);
                
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
        
        setTimeout(function () {
            setPanel(currentPanel);
        }, 50);
        return this;
    };
})(jQuery);