function Map( _name )
{
	var WEIGHT = 1000 / 60;     // Draw weight, larger value, slower drawing.
	var LINECOLOR  =  'rgba(0,0,0,0.1)'; // Line Color. RGB.
	var CAMERAHIGHT = 5;        // smaller value, camera places higher.
	var width = window.innerWidth;
	var height = window.innerHeight;
	var STARTX = width / 2;     // Drawing startpoint x.
	var STARTY = height / 2;    // Drawing startpoint y.
	var canvas = document.getElementById( 'map' );
	var boids = [];
	var context = canvas.getContext( '2d' );
	var image, data;
	var convassetInterval; 
	
	this.init = function()
	{
		canvas.width = width;
		canvas.height = height;
		activeBoids();
	}

	var Boid = function ( x, y, angle ) 
	{
	
		this.x = x;
		this.y = y;
		this.angle = Math.pow( Math.random(), 30 ) + angle;
		this.dx = Math.cos( this.angle );
		this.dy = Math.sin( this.angle );
	
		this.life = Math.random() * 100 + 100;
		this.dead = false;
	
		this.update = function () {
	
			context.strokeStyle = LINECOLOR;
			context.beginPath();
			context.moveTo( this.x, this.y ); // Line Start this point
	
			this.x += this.dx * CAMERAHIGHT;
			this.y += this.dy * CAMERAHIGHT;
			this.life -= 2;
	
			context.lineTo( this.x, this.y ); // Line End this point
			context.stroke();
	
			var index = ( Math.floor( this.x ) + width * Math.floor( this.y ) ) * 4;
				if( this.life <= 0 ||
			   data[ index + 3 ] > 0 ||
			   (this.x < 0 || this.x > width ) ||
			   (this.y < 0 || this.y > height )){
			this.kill();
			}
	
		};
		this.kill = function () {
			boids.splice( boids.indexOf( this ), 1 );
			this.dead = true;
		};
		
	};  
	// Boid
	function activeBoids()
	{
		width = window.innerWidth;
		height = window.innerHeight;
		STARTX = width / 2;     // Drawing startpoint x.
		STARTY = height / 2;    // Drawing startpoint y.
		canvas.width = width;
		canvas.height = height;
		boids = [];
		
		
		boids.push( new Boid( STARTX, STARTY, Math.random() * 360 * Math.PI / 180 ) );
		convassetInterval = setInterval( function () 
		{
			image = context.getImageData( 0, 0, width, height );
			data = image.data;
			for ( var i = 0; i < boids.length; i ++ ) {
				var boid = boids[ i ];
				boid.update();
				if ( !boid.dead && Math.random() > 0.5 && boids.length < 1000 ) {
					boids.push( new Boid( boid.x, boid.y, ( Math.random() > 0.5 ? 90 : - 90 ) * Math.PI / 180 + boid.angle ) );
				}
			}
			
			
		}, WEIGHT );
	}
	
	
	$(window).resize(onResize);
	function onResize(e) 
	{
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		
		resetEvent();
		activeBoids();
	}
	
	function resetEvent() 
	{
		canvas.width = canvas.width;
		clearInterval(convassetInterval);
		boids = [];
	}
}