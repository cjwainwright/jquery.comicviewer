(function () {
    
    // tools
    
    var tools = [
        { id: 'select', name: 'Select' },
        { id: 'addpanel', name: 'Add Panel' },
        { id: 'preview', name: 'Preview' }
    ];

    function ToolSelector() {
        this.selectedTool = tools[0];
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
            return [panel.left, panel.top, panel.width, panel.height].join(',');;
        }).join(';');
        
        return data;
    };
    
    // model

    function PanelBuilderModel() {
        this.toolSelector = new ToolSelector();
        this.panelCollection = new PanelCollection();
        this.panelSnapper = new PanelSnapper(10);
    }
    
    // app
    
    angular
        .module('panelbuilder', [])
        .controller('MainCtrl', ['$scope', function ($scope) {
            $scope.model = new PanelBuilderModel();
        }])
        .directive('toolSelector', function () {
            return {
                templateUrl: 'templates/tool-selector.html',
                restrict: 'E',
                scope: { toolSelector: '=' },
                replace: true,
                controller: ['$scope', function ($scope) {
                    $scope.selected = function (tool) {
                        return $scope.toolSelector.selectedTool == tool ? 'selected-tool' : '';
                    };
                }]
            };
        })
        .directive('panelCollection', function () {
            return {
                templateUrl: 'templates/panel-collection.html',
                restrict: 'E',
                scope: { panelCollection: '=panels' },
                replace: false,
                controller: ['$scope', function ($scope) {
                    $scope.selected = function (panel) {
                        return $scope.panelCollection.selectedPanel == panel ? 'selected-panel' : '';
                    };
                }]
            };
        })
        .directive('panelItem', function () {
            return {
                templateUrl: 'templates/panel-item.html',
                restrict: 'E',
                scope: { panel: '=' },
                replace: true,
                controller: ['$scope', function ($scope) {
                }]
            };
        })
        .directive('panelProperties', function () {
            return {
                templateUrl: 'templates/panel-properties.html',
                restrict: 'E',
                scope: { panel: '=' },
                replace: true,
                controller: ['$scope', function ($scope) {
                }]
            };
        })
        .directive('panelSerialiser', function () {
            return {
                templateUrl: 'templates/panel-serialiser.html',
                restrict: 'E',
                scope: { panels: '=' },
                replace: true,
                controller: ['$scope', function ($scope) {
                    var serialiser = new  PanelSerialiser();
                    Object.defineProperty($scope, 'serialisedPanels', {
                        get: function () {
                            return serialiser.serialisePanels($scope.panels);
                        },
                        set: function (value) {
                        }
                    });                    
                }]
            };
        })
        .directive('panelEditor', ['$document', function ($document) {
            return {
                templateUrl: 'templates/panel-editor.html',
                restrict: 'E',
                scope: { model: '=' },
                replace: true,
                link: function ($scope, $element, $attrs) {
                    var comic = $element.find('img')[0];
                    $scope.comic = comic; //TODO - better way to get the comic width and height to the snapper

                    $element.on('dragover', function (event) { 
                        event.preventDefault(); 
                    });

                    $element.on('dragenter', function (event) { 
                        event.preventDefault(); 
                    });
                    
                    $element.on('drop', function (event) {
                        event.preventDefault();
                        
                        var file = event.dataTransfer.files[0];
                        if(file == null) {
                            error('File object not available');
                            return;
                        }

                        $scope.$apply(function(){
                            $scope.reset();
                        });
                        
                        var reader = new FileReader();
                        reader.onload = function(e) { 
                            comic.src = e.target.result;
                        }; 
                        
                        reader.readAsDataURL(file);
                    });
  
                    function getCoords(event) {
                        var rect = comic.getBoundingClientRect();
                        var x = event.clientX - rect.left;
                        var y = event.clientY - rect.top;
                        return { 
                            x: Math.round(x), 
                            y: Math.round(y) 
                        };
                    }
                    
                    $element.on('mousedown', function (event) {
                        event.preventDefault();
                        
                        var {x, y} = getCoords(event);
                        $scope.$apply(function(){
                            $scope.createPanel(x, y);
                        });
                        
                        function mouseMove(event) {
                            var {x, y} = getCoords(event);
                            $scope.$apply(function(){
                                $scope.dragPanel(x, y);
                            });
                        }

                        $document.on('mousemove', mouseMove);
                        $document.on('mouseup', function mouseUp(event) {
                            
                            mouseMove(event);
                            $scope.$apply(function(){
                                $scope.finalisePanel();
                            });
                            
                            $document.off('mousemove', mouseMove);
                            $document.off('mouseup', mouseUp);
                        });
                    });
                },
                controller: ['$scope', '$element', function ($scope, $element) {
                    $scope.reset = function () {
                        $scope.model.panelCollection.clear();
                    };
                    
                    $scope.createPanel = function (x, y) { 
                        var snapper = $scope.model.panelSnapper;
                        snapper.setPanels($scope.comic, $scope.model.panelCollection.panels);
                        
                        $scope.model.panelCollection.createPanel(snapper.snapX(x), snapper.snapY(y));
                    };
                    $scope.dragPanel = function (x, y) { 
                        var snapper = $scope.model.panelSnapper;

                        $scope.model.panelCollection.dragPanel(snapper.snapX(x), snapper.snapY(y));
                    };
                    $scope.finalisePanel = function (x, y) { 
                        var snapper = $scope.model.panelSnapper;

                        $scope.model.panelCollection.finalisePanel(snapper.snapX(x), snapper.snapY(y));
                    };
                }]
            };
        }])
        ;

})();