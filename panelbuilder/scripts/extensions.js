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
                        originalEvent = event.originalEvent || event; // if using jQuery need to use original event to get data transfer
                        dropHandler(originalEvent.dataTransfer);
                    });
                });
            }
        };
    }])
    ;
