// Shim courtesy of Paul Irish & Jerome Etienne
window.cancelRequestAnimFrame = ( function() {
		return window.cancelAnimationFrame           ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelRequestAnimationFrame    ||
				window.oCancelRequestAnimationFrame      ||
				window.msCancelRequestAnimationFrame     ||
				clearTimeout
} )();

window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame   || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element){
						return window.setTimeout(callback, 1000 / 60);
				};
})();


function Raiz( _name )
{
	this.init = function()
	{
		var _delay = 300;
		var _temp = 300;
		$( '#containerHtml_canvas' ).css('opacity' , 0 );
		$( '#containerHtml_canvas' ).delay( 0 ).animate({  'opacity': 0.4 }, _temp, 'easeOutSine' );

		//
		Recursion.init();

	}
	
		
		
		/**
		 * --------------------
		 * SETTINGS
		 * --------------------
		 */
		
		var CONFIG  = {};
		var PRESETS = {};
		var RENDER_MODES = 
		{
			Segmented: 'segmented'
		};
	
		PRESETS['Fibrous']  = {RENDER_MODE:RENDER_MODES.Segmented,BRANCH_PROBABILITY:0.05,MAX_CONCURRENT:100,NUM_BRANCHES:4,MIN_RADIUS:0,MAX_RADIUS:0.1,MIN_WANDER_STEP:0.28,MAX_WANDER_STEP:0.7,MIN_GROWTH_RATE:5,MAX_GROWTH_RATE:19,MIN_SHRINK_RATE:0.98,MAX_SHRINK_RATE:0.99,MIN_DIVERGENCE:0.01,MAX_DIVERGENCE:0.05};
		
		function configure(settings) {
			for(var prop in settings) {
				CONFIG[prop] = settings[prop];
			}
		}
		
		configure(PRESETS['Fibrous']);
		
		/**
		 * --------------------
		 * UTILS
		 * --------------------
		 */
		
		var PI           = Math.PI;
		var TWO_PI       = Math.PI * 2;
		var HALF_PI      = Math.PI / 2;
		var BRANCHES     = [];
		
		function random(min, max) {
			return min + Math.random() * (max - min);
		}
		
		/**
		 * --------------------
		 * BRANCH
		 * --------------------
		 */
		
		var Branch = function(x, y, theta, radius, scale, generation) {
		
			this.x           = x;
			this.y           = y;
			this.ox          = x;
			this.oy          = y;
			this.x1          = NaN;
			this.x2          = NaN;
			this.y1          = NaN;
			this.y2          = NaN;
			this.scale       = scale || 1.0;
			this.theta       = theta;
			this.oTheta      = theta;
			this.radius      = radius;
			this.generation  = generation || 1;
			this.growing     = true;
			this.age         = 0;
		
			this.wanderStep  = random(CONFIG.MIN_WANDER_STEP, CONFIG.MAX_WANDER_STEP);
			this.growthRate  = random(CONFIG.MIN_GROWTH_RATE, CONFIG.MAX_GROWTH_RATE);
			this.shrinkRate  = random(CONFIG.MIN_SHRINK_RATE, CONFIG.MAX_SHRINK_RATE);
		}
		
		Branch.prototype = {
		
			update: function() {
				
				if(this.growing) {
					
					this.ox = this.x;
					this.oy = this.y;
					this.oTheta = this.theta;
		
					this.theta += random(-this.wanderStep, this.wanderStep);
		
					this.x += Math.cos(this.theta) * this.growthRate * this.scale;
					this.y += Math.sin(this.theta) * this.growthRate * this.scale;
		
					this.scale  *= this.shrinkRate;
		
					// Branch
					if(BRANCHES.length < CONFIG.MAX_CONCURRENT && Math.random() < CONFIG.BRANCH_PROBABILITY) {
						
						var offset = random(CONFIG.MIN_DIVERGENCE, CONFIG.MAX_DIVERGENCE);
						var theta  = this.theta + offset * (Math.random() < 0.5 ? 1 : -1);
						var scale  = this.scale * 0.95;
						var radius = this.radius * scale;
						var branch = new Branch(this.x, this.y, theta, radius, scale);
		
						branch.generation = this.generation + 1;
		
						BRANCHES.push(branch);
					}
		
					// Limit
					if(this.radius * this.scale <= CONFIG.MIN_RADIUS) {
						this.growing = false;
					}
		
					this.age++;
				}
			},
		
			render: function(context) {
		
				if(this.growing) {
		
					var x1, x2, y1, y2;
					var scale = this.scale;
					var radius = this.radius * scale;
		
					context.save();
		
					switch(CONFIG.RENDER_MODE) {
		
						case RENDER_MODES.Segmented :
		
							// Draw outline
							context.beginPath();
							context.moveTo(this.ox, this.oy);
							context.lineTo(this.x, this.y);
							
							if(radius > 5.0) {
								context.shadowOffsetX = 1;
								context.shadowOffsetY = 1;
								context.shadowBlur    = scale;
								context.shadowColor   = 'rgba(0,0,0,0.05)';	
							}
							
							context.lineWidth = radius + scale;
							context.strokeStyle = '#000';
							context.lineCap = 'round';
							context.stroke();
							context.closePath();
							
							// Draw fill
							context.beginPath();
							context.moveTo(this.ox, this.oy);
							context.lineTo(this.x, this.y);
		
							context.lineWidth = radius;
							context.strokeStyle = '#FFF';
							context.lineCap = 'round';
							context.stroke();
		
							context.closePath();
		
							break;
						
						
					}
					
					context.restore();
				}
			},
		
			destroy: function() {
				
				canvas.width = canvas.width;
			}
		};
		
		
		/**
		 * --------------------
		 * SKETCH
		 * --------------------
		 */
		
		var Recursion = new function() {
		
			var started      = false;
			var $canvas      = $('#canvas');
			var canvas       = $canvas[0];
			var context      = canvas.getContext('2d');
		
			function spawn(x, y) {
		
				var theta, radius;
		
				for(var i = 0; i < CONFIG.NUM_BRANCHES; i++) 
				{
					theta = (i / CONFIG.NUM_BRANCHES) * TWO_PI;
					radius = CONFIG.MAX_RADIUS;
					BRANCHES.push(new Branch(x, y, theta - HALF_PI, radius));
				}
				
				//window.setTimeout( function(){ BRANCHES.push( new Branch2( 0,  0,  0, CONFIG.MAX_RADIUS) ) ;   }, 1000 * 1 );
				//window.setTimeout( function(){ BRANCHES.push( new Branch3( x,  y,  0, CONFIG.MAX_RADIUS) ) ;   }, 1000 * 1 );
			}
		
			function update() {
		
				//cancelRequestAnimFrame(update);
				requestAnimFrame(update);
				
				var i, n, branch;
		
				for(i = 0, n = BRANCHES.length; i < n; i++) {
					branch = BRANCHES[i];
					branch.update();
					branch.render(context);
				}
		
				// Strip dead branches
				for(i = BRANCHES.length - 1; i >= 0; i--) {
					if(!BRANCHES[i].growing) {
						BRANCHES.splice(i,1);
					}
				}
		
				var count = BRANCHES.length.toString();
				while(count.length < 3) { count = '0' + count; };
			}
			
			function onClick(e) {
		
				Recursion.reset();
				spawn(e.offsetX, e.offsetY);
			}
		
			
			function onResize(e) 
			{
				canvas.width  = window.innerWidth;
				canvas.height = window.innerHeight;
		
				Recursion.reset();
				//spawn(  0 , 0 );  //pos Top linhas	
				//spawn(   canvas.width , canvas.height );  //pos Botton linhas	
				spawn( canvas.width/2  , canvas.height/2  );  //pos de onde sai as linhas
				
			}
		
			return {
		
				init: function() 
				{
					onResize();
		
					if(!started) {
						started = true;
						$(window).resize(onResize);
						//$canvas.click(onClick);
						update();
					}
				},
		
				reset: function() 
				{
		
					for(var i = 0, n = BRANCHES.length; i < n; i++) {
						BRANCHES[i].destroy();
					}
		
					BRANCHES = [];
				},
		
			
		
				clear: function() 
				{
					canvas.width = canvas.width;
				}
			};
		}
}
