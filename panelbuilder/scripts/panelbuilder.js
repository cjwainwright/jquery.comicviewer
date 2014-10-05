angular
    .module('panelbuilder', ['extensions'])
    .controller('MainCtrl', ['$scope', function ($scope) {
        $scope.model = new panelBuilder.Model();
    }])
    .directive('toolSelector', function () {
        return {
            templateUrl: 'templates/tool-selector.html',
            restrict: 'E',
            scope: { toolSelector: '=' },
            replace: true,
            controller: ['$scope', function ($scope) {
                $scope.selected = function (tool) {
                    return $scope.toolSelector.selectedTool == tool ? 'tool-icon-selected' : '';
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
                var serialiser = new panelBuilder.Serialiser();
                
                $scope.valid = true;
                
                Object.defineProperty($scope, 'serialisedPanels', {
                    get: function () {
                        return serialiser.serialisePanels($scope.panels);
                    },
                    set: function (value) {
                        $scope.valid = serialiser.deserialisePanels(value, $scope.panels);
                    }
                });
            }]
        };
    })
    .directive('imageDrop', ['jqExt', function (jqExt) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var comic = $element.find('img')[0];
                
                function _onDrop(dataTransfer) {
                    var file = dataTransfer.files[0];
                    if(file == null) {
                        return;
                    }

                    $scope.reset();
                
                    var reader = new FileReader();
                    reader.onload = function(e) { 
                        comic.src = e.target.result;
                    }; 
                    
                    reader.readAsDataURL(file);
                }
                
                jqExt.onDrop($scope, $element, _onDrop);
            },
            controller: ['$scope', function ($scope) {
                if($scope.reset == null) {
                    $scope.reset = function () { }; // overridable reset function
                }
            }]
        }
    }])
    .directive('panelEditor', ['jqExt', function (jqExt) {
        return {
            templateUrl: 'templates/panel-editor.html',
            restrict: 'E',
            scope: { model: '=', src: '@' },
            replace: true,
            link: function ($scope, $element, $attrs) {
                var comic = $element.find('img')[0];
                comic.src = $scope.src;
                $scope.comic = comic; //TODO - better way to get the comic width and height to the snapper

                var focus = $element.find('input')[0];

                $scope.toolHandlers = {
                    'select': {
                        mouseDown: function (x, y) {
                            focus.focus();
                            $scope.selectPanel(x, y);
                        },
                        mouseMove: function (x, y) {
                        },
                        mouseUp: function (x, y) {
                        }
                    },
                    'addpanel': {
                        mouseDown: function (x, y) {
                            focus.focus();
                            $scope.createPanel(x, y);
                        },
                        mouseMove: function (x, y) {
                            $scope.dragPanel(x, y);
                        },
                        mouseUp: function (x, y) {
                            $scope.dragPanel(x, y);
                            $scope.finalisePanel();
                        }
                    },
                    'preview': {
                        mouseDown: function (x, y) {
                            $scope.preview(x, y);
                        },
                        mouseMove: function (x, y) {
                        },
                        mouseUp: function (x, y) {
                        }
                    },
                    'null': {
                        mouseDown: function (x, y) {
                        },
                        mouseMove: function (x, y) {
                        },
                        mouseUp: function (x, y) {
                        }
                    }
                };
                
                function getCoords(event) {
                    var rect = comic.getBoundingClientRect();
                    var x = event.clientX - rect.left;
                    var y = event.clientY - rect.top;
                    return { 
                        x: Math.round(x), 
                        y: Math.round(y) 
                    };
                }

                function mouseDown(event) {
                    var coords = getCoords(event);
                    $scope.getToolHandler().mouseDown(coords.x, coords.y);
                }
                
                function mouseMove(event) {
                    var coords = getCoords(event);
                    $scope.getToolHandler().mouseMove(coords.x, coords.y);
                }
                
                function mouseUp(event) {
                    var coords = getCoords(event);
                    $scope.getToolHandler().mouseUp(coords.x, coords.y);
                }
                
                jqExt.onDrag($scope, $element, mouseDown, mouseMove, mouseUp);
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                var comic = $element.find('img');

                $scope.reset = function () {
                    $scope.model.panelCollection.clear();
                    comic.removeData('panels');
                    comic.removeAttr('width');
                    comic.removeAttr('height');
                };
                
                $scope.getToolHandler = function  () {
                    var id = $scope.model.toolSelector.selectedTool.id;
                    return $scope.toolHandlers[id] || $scope.toolHandlers.null;
                };
                
                $scope.selectPanel = function (x, y) {
                    $scope.model.panelCollection.panels.forEach(function (panel) {
                        if((panel.left <= x) &&
                           (panel.top <= y) &&
                           (x <= panel.left + panel.width) &&
                           (y <= panel.top + panel.height)) {
                            $scope.model.panelCollection.selectedPanel = panel;
                        }
                    });
                };

                $scope.deselectAll = function () {
                    $scope.model.panelCollection.selectedPanel = null;
                };
                
                $scope.keyUp = function (e) {
                    if(e.which == 46) {
                        $scope.deletePanel();
                    }
                };
  
                $scope.deletePanel = function () {
                    $scope.model.panelCollection.deletePanel($scope.model.panelCollection.selectedPanel);
                }
                
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
                
                $scope.preview = function (x, y) {
                    var comic = $element.find('img');
                    
                    var serialiser = new panelBuilder.Serialiser();
                    var panelData = serialiser.serialisePanels($scope.model.panelCollection.panels);
                    comic.data('panels', panelData);
                    comic.attr('width', comic.width());
                    comic.attr('height', comic.height());

                    var viewer = comic.comicViewer();
                    viewer.show({x: x, y: y});
                };
            }]
        };
    }])
    ;
