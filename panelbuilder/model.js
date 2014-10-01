var panelBuilder = (function () {

    // tools
    
    var tools = [
        { id: 'select', name: 'Select' },
        { id: 'addpanel', name: 'Add Panel' },
        { id: 'preview', name: 'Preview' }
    ];

    function ToolSelector() {
        this.selectedTool = tools[1];
    }
    
    ToolSelector.prototype.tools = tools;

    ToolSelector.prototype.selectTool = function (tool) {
        this.selectedTool = tool;
        console.log(tool);
    };
    
    // panels
    
    function PanelCollection() {
        this.panels = [];
        this.selectedPanel = this.panels[0];
    }
    
    PanelCollection.prototype.selectPanel = function (panel) {
        this.selectedPanel = panel;
    };
    
    PanelCollection.prototype.createPanel = function (x, y) {
        var panel = {
            left: x, 
            top: y,
            width: 0,
            height: 0,
        };
        
        this.selectedPanel = panel;
        this.panels.push(panel);
    };
    
    PanelCollection.prototype.deletePanel = function (panel) {
        var index = this.panels.indexOf(panel);
        if(index >= 0) {
            this.panels.splice(index, 1);
            if(panel == this.selectedPanel) {
                index = Math.min(index, this.panels.length - 1);
                this.selectedPanel = this.panels[index] || null;
            }
        }
    }
    
    PanelCollection.prototype.dragPanel = function (x, y) {
        this.selectedPanel.width = (x - this.selectedPanel.left);
        this.selectedPanel.height = (y - this.selectedPanel.top);
    };
    
    PanelCollection.prototype.finalisePanel = function (x, y) {
    };
    
    PanelCollection.prototype.clear = function () {
        this.selectedPanel = null;
        this.panels.length = 0;
    };

    // snapper
    
    function PanelSnapper(snapTolerance) {
        this._snapXPoints = [];
        this._snapYPoints = [];
        this.snapTolerance = snapTolerance;
    }
    
    PanelSnapper.prototype.setPanels = function (element, panels) {
        this._snapXPoints.length = 0;
        this._snapYPoints.length = 0;
        
        Array.prototype.push.apply(this._snapXPoints, [0, element.width]);
        Array.prototype.push.apply(this._snapYPoints, [0, element.height]);
        
        panels.forEach(function (panel) {
            this._snapXPoints.push(panel.left)
            this._snapXPoints.push(panel.left + panel.width);

            this._snapYPoints.push(panel.top)
            this._snapYPoints.push(panel.top + panel.height);
        }, this);
    };
    
    PanelSnapper.prototype.snapX = function (x) {
        return this._snap(x, this._snapXPoints);
    };
    
    PanelSnapper.prototype.snapY = function (y) {
        return this._snap(y, this._snapYPoints);
    };
    
    PanelSnapper.prototype._snap = function (pos, snapPoints) {
        var bound = this.snapTolerance;
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
        
        return pos;
    };
    
    // serialiser
    
    function PanelSerialiser () {
    }
    
    PanelSerialiser.prototype.serialisePanels = function (panels) {
        var data = panels.map(function (panel) {
            return [panel.left, panel.top, panel.width, panel.height].join(',');
        }).join(';');
        
        return data;
    };
    
    PanelSerialiser.prototype.deserialisePanels = function (data, currentPanels) {
        if(data == '') {
            currentPanels.length = 0;
            return true;
        }        

        var valid = true;
        var panels = data.split(';').map(function (panelData) {
            var panelDataItems = panelData.split(',');
            if(panelDataItems.length != 4) {
                valid = false;
                return [0,0,0,0];
            }
            return panelDataItems.map(function (val) {
                if(val+'' === (val|0)+'') {
                    return val;
                }
                valid = false;
                return 0;
            });
        });
        
        if(valid) {
            currentPanels.length = panels.length;
            panels.forEach(function (panel, index) {
                var currentPanel = currentPanels[index];
                if(currentPanel == null) {
                    currentPanel = {};
                    currentPanels[index] = currentPanel;
                }
                currentPanel.left = panel[0];
                currentPanel.top = panel[1];
                currentPanel.width = panel[2];
                currentPanel.height = panel[3];
            });
        }
        
        return valid;
    };
    
    // model

    function PanelBuilderModel() {
        this.toolSelector = new ToolSelector();
        this.panelCollection = new PanelCollection();
        this.panelSnapper = new PanelSnapper(10);
    }
    
    return {
        Model: PanelBuilderModel,
        Serialiser: PanelSerialiser
    }
    
})();