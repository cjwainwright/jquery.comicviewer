(function () {
    function error(message) {
        console && console.error(message);
    }

    var workspace = document.getElementById('workspace');
    var comic = document.getElementById('comic');
    var output = document.getElementById('output');
    
    workspace.addEventListener('dragover', function (event) { 
        event.preventDefault(); 
    });

    workspace.addEventListener('dragenter', function (event) { 
        event.preventDefault(); 
    });
    
    
    workspace.addEventListener('drop', function (event) {
        event.preventDefault();
        
        var file = event.dataTransfer.files[0];
        if(file == null) {
            error('File object not available');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) { 
            comic.src = e.target.result;
        }; 
        
        reader.readAsDataURL(file);
    });
    
    var panels = [];
    var panel = null;
    
    var snapXPoints = [];
    var snapYPoints = [];
    
    var snapTolerance = 10;
    
    function populateSnapPoints() {
        snapXPoints.length = 0;
        snapYPoints.length = 0;
        Array.prototype.push.apply(snapXPoints, [0, comic.width]);
        Array.prototype.push.apply(snapYPoints, [0, comic.height]);
        
        panels.forEach(function (panel) {
            snapXPoints.push(panel.x)
            snapXPoints.push(panel.x + panel.width);

            snapYPoints.push(panel.y)
            snapYPoints.push(panel.y + panel.height);
        });
    }
    
    function snapX(x) {
        return snap(x, snapXPoints);
    }

    function snapY(y) {
        return snap(y, snapYPoints);
    }
    
    function snap(pos, snapPoints) {
        var bound = snapTolerance;
        var snapPoint;
        snapPoints.forEach(function (point) {
            var distance = Math.abs(point - pos);
            if(distance < bound) {
                bound = distance;
                snapPoint = point;
            }
        });
        
        if(snapPoint !== undefined) {
            return snapPoint;
        }
        
        return Math.round(pos);
    }
    
    function getCoords(event) {
        var rect = comic.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return {x: snapX(x), y: snapY(y)};
    }
    
    function createPanel(x, y) {
        panel = {
            x: x, 
            y: y,
            width: 0,
            height: 0,
            el: createPanelEl(x, y, panels.length + 1)
        };
        panels.push(panel);
    }
    
    function createPanelEl(x, y, index) {
        var panelEl = document.createElement('div');
        panelEl.className = 'panel';
        panelEl.style.left = x + 'px';
        panelEl.style.top = y + 'px';
        
        panelEl.appendChild(document.createTextNode(index));
        
        workspace.appendChild(panelEl);
        return panelEl;
    }
    
    function dragPanel(x, y) {
        panel.width = (x - panel.x);
        panel.height = (y - panel.y);
        panel.el.style.width = panel.width + 'px';
        panel.el.style.height = panel.height + 'px';
    }
    
    function finalise() {
        var data = panels.map(function (panel) {
            return [panel.x, panel.y, panel.width, panel.height].join(',');;
        }).join(';');
        
        output.value = data;
    }
    
    workspace.addEventListener('mousedown', function (event) {
        event.preventDefault();
        
        populateSnapPoints();
        
        var {x, y} = getCoords(event);
        createPanel(x, y);
        
        function mouseMove(event) {
            var {x, y} = getCoords(event);
            dragPanel(x, y);
        }

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', function mouseUp(event) {
            mouseMove(event);
            finalise();
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        });
        
    });
    
    
    
    
    
})();