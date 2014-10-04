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
            if(panel.invalidValue != null) {
                return panel.invalidValue;
            } else {
                return [panel.left, panel.top, panel.width, panel.height].join(',');
            }
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
                return {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    invalidValue: panelData
                };
            }
            
            var isInt = function (val) {
                return (val + '' === (val|0) + '');
            };
            
            var validPanel = true;
            var toInt = function (val) {
                return isInt(val) ? val|0 : (validPanel = false, 0);
            };
            
            var left = toInt(panelDataItems[0]);
            var top = toInt(panelDataItems[1]);
            var width = toInt(panelDataItems[2]);
            var height = toInt(panelDataItems[3]);
            var invalidValue = validPanel ? null : panelData;
            
            valid &= validPanel;
            
            return {
                left: left,
                top: top,
                width: width,
                height: height,
                invalidValue: invalidValue
            };
        });
        
        currentPanels.length = panels.length;
        panels.forEach(function (panel, index) {
            var currentPanel = currentPanels[index];
            if(currentPanel == null) {
                currentPanel = {};
                currentPanels[index] = currentPanel;
            }
            currentPanel.left = panel.left;
            currentPanel.top = panel.top;
            currentPanel.width = panel.width;
            currentPanel.height = panel.height;
            currentPanel.invalidValue = panel.invalidValue;
        });
        
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