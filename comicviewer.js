(function ($) {
    $.fn.comicViewer = function () {
        var that = this;
        var currentPanel = 0;
        var $frame = $('<div class="comic-viewer-frame"/>'),
            $viewport = $('<div class="comic-viewer-viewport"/>'),
            $image = $('<img class="comic-viewer-image"/>').attr('src', this.attr('src'));
        
        $frame.append($viewport.append($image));
        $('body').append($frame);
        var rawPanels = this.data('panels').split(';');

        function setPanel(panel) {
            var rawPanel = rawPanels[panel];
            if(rawPanel) {
                rawPanel = rawPanel.split(',');
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
                
                scale *= 0.9; //TODO - adjust scale such that image is never zoomed more than 100% in terms of screen pixels
                
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