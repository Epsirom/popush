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
	                var tmp = newValue.h - 100;
	                if(tmp < 500)
	                    tmp = 500;
	                return{
	                    'height': tmp + 'px',
	                }
	            }
	            
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
	directive('focus', function () {
	  return function (scope, element, attrs) {
	    attrs.$observe('focus', function (newValue) {
	      newValue === 'true' && element[0].focus();
	    });
	  }
	});
