'use strict';

/* Directives */
angular.module('popushDirectives', []).
	directive('resize', function ($window) {
	    return function (scope, element) {
	        var w = angular.element($window);
	        scope.getWindowDimensions = function () {
	            return { 'h': w[0].innerHeight, 'w': w[0].innerWidth };
	        };
	        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
	            scope.windowHeight = newValue.h;
	            scope.windowWidth = newValue.w;
	            
	            scope.style = function () {
	               var tmp = newValue.w - 260;
	               if(tmp < 650)
	                    tmp = 650;
	                if(newValue.w < 700){
	                	return{
	                		'padding-left': '10px',
	                		'width': tmp + 'px'	                		
	                	}
	                }
	                return { 
	                    'width': tmp + 'px' 
	                };
	            };

	            scope.indexSize = function() {
	                var tmp = ((newValue.h-120)/3);
	                if(tmp < 160)
	                    tmp = 160;
	                return { 
	                    'margin-top': tmp + 'px', 
	                };
	            };

	            scope.langSize = function() {
	            	var tmp = newValue.w - 200;
	            	if(newValue.w < 800){
	            		tmp  =650;
	            	}
            		return {
            			'margin-left': tmp + 'px'
            		}
	            }

	            scope.footerSize = function(){
	                var tmp = (newValue.h - 161);
	                if (450 > tmp) 
	                    tmp = 450;
	                return {
	                    'top': tmp + 'px',
	                }
	            };

	            scope.usrinfomenuSize =  function(){
	            	var tmp = (newValue.h - 75);
	            	if(tmp < 385)
	            		tmp = 385;
	            	return{
	            		'height': tmp + 'px',
	            	}
	            };

	            scope.filetreeSize = function(){
	            	var tmp = (newValue.h - 210);
	            	if(tmp < 250)
	            		tmp = 250;
	            	return{
	            		'height': tmp + 'px',
	            	}
	            };

	            scope.usrinfoSize = function(){
	            	var tmp = newValue.w - 460;
	            	if(tmp < 500)
	            		tmp = 500;
	            	return{
	            		'width': tmp + 'px',
	            	}	            
	            };

	            scope.codeResize = function(){
	                var tmp = newValue.h - 500;
	                if(tmp < 360)
	                    tmp = 360;
	                return{
	                    'height': tmp + 'px',
	                }
	            };

	            scope.filelistSize = function(){
	            	var tmp = newValue.h - 120;
	            	if(tmp < 360)
	            		tmp = 360;
	                return{
	                    'height': tmp + 'px',
	                }
	            };
	            
	        }, true);
	    
	        w.bind('resize', function () {
	            scope.$apply();
	        });
	        }
	    }).
	directive('ngEnter', function () {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function (event) {
	            if(event.which === 13) {
	                scope.$apply(function (){
	                    scope.$eval(attrs.ngEnter);
	                });

	                event.preventDefault();
	            }
	        });
	    };
	}).
    directive('ngBlur', ['$parse', function($parse) {
        return function(scope, element, attr) {
        var fn = $parse(attr['ngBlur']);
        element.bind('blur', function(event) {
            scope.$apply(function() {
            fn(scope, {$event:event});
        });
        });
     }
    }]).
    directive('focus', function() {
      return {
        link: function(scope, element, attrs) {
          scope.$watch(attrs.focus, function(value) {
            if(value === true) { 
                element[0].focus();
                scope[attrs.focus] = false;
            }
          });
        }
      };
    }).
	directive('scroll', function () {
	    return function (scope, element) {
	        var w = element;
	        scope.getScrollHeight = function () {
	            return { 'h': w[0].scrollHeight };
	        };
	        scope.$watch(scope.getScrollHeight, function (newValue, oldValue) {
	            scope.scrollHeight = newValue.h;
	            w[0].scrollTop = w[0].scrollHeight;
	            scope.bottomscroll = function () {
	                return { 
	                    'scrollTop': newValue.h + 'px' 
	                };
	            };
	            
	        }, true);
	    
	        w.bind('scroll', function () {
	            scope.$apply();
	        });
	        }
	    })
    ;
