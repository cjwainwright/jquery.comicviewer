﻿angular
    .module('extensions', [])
    .factory('jqExt', ['$document', function ($document) {
        return {
            onDrag: function ($scope, $element, mouseDown, mouseMove, mouseUp) {
                $element.on('mousedown', function (event) {
                    if(event.which != 1) {
                        return;
                    }
                    
                    event.preventDefault();
                        
                    $scope.$apply(function(){
                        mouseDown(event);
                    });
                    
                    function _mouseMove(event) {
                        if(event.which != 1) {
                            return;
                        }

                        $scope.$apply(function(){
                            mouseMove(event);
                        });
                    }
                    
                    function _mouseUp(event) {
                        if(event.which != 1) {
                            return;
                        }

                        $scope.$apply(function(){
                            mouseUp(event);
                        });
                        
                        $document.off('mousemove', _mouseMove);
                        $document.off('mouseup', _mouseUp);
                    }
                    
                    $document.on('mousemove', _mouseMove);
                    $document.on('mouseup', _mouseUp);
                });
            },
            onDrop: function ($scope, $element, dropHandler) {
                $element.on('dragover', function (event) { 
                    event.preventDefault(); 
                });

                $element.on('dragenter', function (event) { 
                    event.preventDefault(); 
                });
                
                $element.on('drop', function (event) {
                    event.preventDefault();
                    $scope.$apply(function(){
                        dropHandler(event);
                    });
                });
            }
        };
    }])
    .directive('keyEvents', ['$document', '$rootScope', function($document, $rootScope) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                var categories = $element.attr('key-events-categories').split(',');
                $document.bind('keyup', function(e) {
                    var broadcast = true;
                    if((e.keySourceCategory) &&
                       (categories.length > 0)) {
                        broadcast = categories.some(function (category) {
                            return category == e.keySourceCategory;
                        });
                    }
                    
                    if(broadcast) {
                        $rootScope.$broadcast('keyup', e);
                        $rootScope.$broadcast('keyup:' + e.which, e);
                    }
                });
            }
        };
    }])
    .directive('keySource', [function() {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                var keySourceCategory = $element.attr('key-source-category');
                $element.on('keyup', function (e) {
                    e.keySourceCategory = keySourceCategory;
                })
            }
        };
    }])
    ;
