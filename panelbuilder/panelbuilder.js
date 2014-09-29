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
                var serialiser = new  panelBuilder.Serialiser();
                Object.defineProperty($scope, 'serialisedPanels', {
                    get: function () {
                        return serialiser.serialisePanels($scope.panels);
                    },
                    set: function (value) {
                        serialiser.deserialisePanels(value, $scope.panels);
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
                
                function _onDrop(event) {
                    var file = event.dataTransfer.files[0];
                    if(file == null) {
                        error('File object not available');
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
            }]
        }
    }])
    .directive('panelEditor', ['jqExt', function (jqExt) {
        return {
            templateUrl: 'templates/panel-editor.html',
            restrict: 'E',
            scope: { model: '=' },
            replace: true,
            link: function ($scope, $element, $attrs) {
                var comic = $element.find('img')[0];
                $scope.comic = comic; //TODO - better way to get the comic width and height to the snapper

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
                    var {x, y} = getCoords(event);
                    $scope.createPanel(x, y);
                }
                
                function mouseMove(event) {
                    var {x, y} = getCoords(event);
                    $scope.dragPanel(x, y);
                }
                
                function mouseUp(event) {
                    mouseMove(event);
                    $scope.finalisePanel();
                }
                
                jqExt.onDrag($scope, $element, mouseDown, mouseMove, mouseUp);
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
