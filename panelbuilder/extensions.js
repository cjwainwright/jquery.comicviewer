angular
    .module('extensions', [])
    .factory('jqExt', ['$document', function ($document) {
        return {
            onDrag: function ($scope, $element, mouseDown, mouseMove, mouseUp) {
                $element.on('mousedown', function (event) {
                    event.preventDefault();
                        
                    $scope.$apply(function(){
                        mouseDown(event);
                    });
                    
                    function _mouseMove(event) {
                        $scope.$apply(function(){
                            mouseMove(event);
                        });
                    }
                    
                    function _mouseUp(event) {
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
    }]);