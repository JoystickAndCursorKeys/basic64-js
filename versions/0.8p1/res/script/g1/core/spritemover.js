var CollisionBoxFactory_Debug_a260592cbef84c018c6f3f4eff1037a0 = false;


class CollisionBoxFactory {
	constructor( canvas, xfidelity, yfidelity ) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');//,{ alpha: false, desynchronized: true }

		var boxes = [];

		/* debug colors */
		var cols = [];
		cols[ 0 ] = "#ff0000";
		cols[ 1 ] = "#00ff00";
		cols[ 2 ] = "#0000ff";
		cols[ 3 ] = "#ff00ff";
		cols[ 4 ] = "#00ffff";
		cols[ 5 ] = "#ffff00";

		/* Set up initial collision boxes, with resolution xfidelity * yfidelity */
		this.groupid = 0;
		var MAXXI = 0;
		var MAXYI = 0;
		var XI = 0;
		for( var x0=0; x0<canvas.width; x0+=xfidelity ) {
			var x1 = x0 + (xfidelity -1 );
			if( x1 > canvas.width-1) {
				x1 = canvas.width-1;
			}

			var YI = 0;
			for( var y0=0; y0<canvas.height; y0+=xfidelity ) {
				var y1 = y0 + (yfidelity -1 );
				if( y1 > canvas.height-1) {
					y1 = canvas.height-1;
				}

				boxes.push( { x0:x0, x1: x1, y0: y0, y1: y1, xi:XI, yi: YI } );

				YI++;
				if( YI > MAXYI ) {
					MAXYI = YI;
				}
			}

			XI++;
			if( XI > MAXXI ) {
				MAXXI = XI;
			}
		}

		/*
			only keep boxes that have pixel content AND
			make the boxes adressable in x_index, y_index coordinates (fullBoxes array)
		*/
		var fullBoxes = [];
		var flip = 0;

		for( var i=0; i<boxes.length; i++ ) {
			var b = boxes[ i ];

			b.group = null;
			if( this.containsMostlyVisiblePixels( b ) ) {

				fullBoxes[ b.xi + "_" + b.yi ] = b;
			}
		}

		/* Find boxes that can be merged, and mark them with same groupId */
		for( var yi=0; yi<=MAXYI; yi++ ) {
			for( var xi=0; xi<=MAXXI; xi++ ) {
				var index = xi + "_" + yi;
				var b=fullBoxes[ index ];
				if( b != undefined ) {
					if( b.group == null ) {

						b.group = this.groupid;
						this.groupid++;

						this.markGroupsForMerge(
							{
								group: b.group,
								left: xi,
								right: xi,
								top: yi,
								bottom: yi,
							},
							fullBoxes );
					}
				}
			}
		}

		/* push all boxes back into linear array */
		boxes = [];
		for( var yi=0; yi<=MAXYI; yi++ ) {
			for( var xi=0; xi<=MAXXI; xi++ ) {
				var index = xi + "_" + yi;
				var b=fullBoxes[ index ];
				if( b != undefined ) {
					boxes.push( b );
				}
			}
		}

		/* for each group, create a new box */
		var groupId = 0;
		var newBoxes = [];
		for( var groupId=0; groupId<this.groupid; groupId++ ) {
			var x0= 999999;
			var x1 = -1;
			var y0= 999999;
			var y1 = -1;

			for( var i=0; i<boxes.length; i++ ) {
				var b = boxes[ i ];
				if( b.group == groupId ) {
					if( b.x0 < x0 ) { x0 = b.x0; }
					if( b.x1 > x1 ) { x1 = b.x1; }
					if( b.y0 < y0 ) { y0 = b.y0; }
					if( b.y1 > y1 ) { y1 = b.y1; }
				}
			}

			newBoxes.push( {  x0:x0, x1: x1, y0: y0, y1: y1, group: groupId } );
		}

		boxes = newBoxes;
		newBoxes = null;

		/* merge boxes that are vertically aligned, if they have the same size, and are neighbours */
		for( var i=0; i<boxes.length; i++ ) {
			boxes[ i ].deleteFlag = false;
		}

		for( var i=0; i<boxes.length; i++ ) {
			for( var j=0; j<boxes.length; j++ ) {
				if( i==j ) {
					continue;
				}

				var bi = boxes[ i ];
				var bj = boxes[ j ];

				if( bi.deleteFlag || bj.deleteFlag ) {
					continue;
				}

				var b1, b2;

				if( bi.x0 == bj.x0 && bi.x1 == bj.x1 ) {
					if( bi.y0 < bj.y0 ) {
							b1 = bi;
							b2 = bj;
					}
					else {
							b1 = bj;
							b2 = bi;
					}

					if( b1.y1 == b2.y0-1 ) {
							b1.y1 = b2.y1;
							b2.deleteFlag = true;
					}
				}
			}
		}

		newBoxes = [];
		for( var i=0; i<boxes.length; i++ ) {
			if(! boxes[ i ].deleteFlag ) {
					newBoxes.push( boxes[ i ] );
			}
		}

		boxes = newBoxes;
		newBoxes = null;


		/* merge boxes that are horizontally aligned, if they have the same size, and are neighbours */
		newBoxes = [];
		for( var i=0; i<boxes.length; i++ ) {
			boxes[ i ].deleteFlag = false;
		}

		for( var i=0; i<boxes.length; i++ ) {
			for( var j=0; j<boxes.length; j++ ) {
				if( i==j ) {
					continue;
				}

				var bi = boxes[ i ];
				var bj = boxes[ j ];

				if( bi.deleteFlag || bj.deleteFlag ) {
					continue;
				}

				var b1, b2;

				if( bi.y0 == bj.y0 && bi.y1 == bj.y1 ) {
					if( bi.x0 < bj.x0 ) {
							b1 = bi;
							b2 = bj;
					}
					else {
							b1 = bj;
							b2 = bi;
					}

					if( b1.x1 == b2.x0-1 ) {
							b1.x1 = b2.x1;
							b2.deleteFlag = true;
					}
				}
			}
		}

		newBoxes = [];
		for( var i=0; i<boxes.length; i++ ) {
			if(! boxes[ i ].deleteFlag ) {
					newBoxes.push( boxes[ i ] );
			}
		}

		boxes = newBoxes;
		newBoxes = null;

		//Relabel groups, set debug colours
		flip = 0;
		for( var i=0; i<boxes.length; i++ ) {
			b = boxes[ i ];
			b.col = cols[ flip ];
			flip++; if( flip > (6-1) ) { flip=0;}
			b.group = i;
		}


		/* end */
		this.boxes = boxes;

	}


	getNeighborUnGroupedBoxes( indexes, fullBoxes ) {

		/* check neigbours on the rights and bottom only */
		/* good-enough, for the overal allgoritm */
		var list=[];

		for( var yi=indexes.top; yi<=indexes.bottom+1; yi++ ) {
			var index = (indexes.right+1) + "_" + yi;
			var b= fullBoxes[ index ];

			if( b == undefined ) {
				return [];
			}
			if( b.group != null ) {
				return [];
			}

			list.push(b);

		}

		for( var xi=indexes.left; xi<=indexes.right; xi++ ) {
			var index = xi + "_" + (indexes.bottom+1);
			var b= fullBoxes[ index ];

			if( b == undefined ) {
				return [];
			}
			if( b.group != null ) {
				return [];
			}

			list.push(b);

		}

		return list;
	}

	markGroupsForMerge( indexes, fullBoxes ) {
			var list = this.getNeighborUnGroupedBoxes( indexes , fullBoxes );

			if( list.length > 0 ) {
				for( var i=0; i<list.length; i++ ) {
					list[ i ].group = indexes.group;
				}

				this.markGroupsForMerge(
						{
							group: indexes.group,
							left: indexes.left,
							right: indexes.right+1,
							top: indexes.top,
							bottom: indexes.bottom+1,
						},
						fullBoxes
				);
			}
	}


	containsMostlyVisiblePixels( b ) {

		var ctx = this.context;
		var imgdata = ctx.getImageData(b.x0, b.y0, (b.x1-b.x0) + 1, (b.y1-b.y0) + 1 );
		var sd  = imgdata.data;
		var count_vis = 0;
		var count_invis =0;

		for( var i=0; i<sd.length; i+=4 ) {
			if( sd[ i+3 ] != 0 ) {
				count_vis ++;
			}
			else {
				count_invis ++;
			}
		}
		return count_invis < count_vis;
	}

	getBoxes() {
			return this.boxes;
	}
}

class SpriteAnim {

	constructor( img, gridw, gridh, transCol, collissionBoxSettings ) {

			if( transCol == null ) {
				throw "transCol must be defined on SpriteAnim with url " + img.src;
			}
			this.img = img;
			this.gridw = gridw;
			this.gridh = gridh;

			this.xoff = - this.gridw / 2;
	    this.yoff = - this.gridh / 2;

			this.imagesCanvas = [];
			this.imagesContext = [];
			this.imagesCanvasCollisions = [];

			var w = this.img.width;
			var h = this.img.height;

			this.w = gridw;
			this.h = gridh;

			this.imageCanvas = document.createElement('canvas');
			this.imageContext = this.imageCanvas.getContext('2d');

			this.imageCanvas.width = 	w;
			this.imageCanvas.height = 	h;

			this.imageContext.drawImage( this.img, 0, 0, w, h);

			this.ximagecount = w / this.gridw;
      this.ximagerowcount = h / this.gridh;

      for (var yimage = 0; yimage < this.ximagerowcount; yimage++) {
			for (var ximage = 0; ximage < this.ximagecount; ximage++) {

				var sx = (ximage * this.gridw);
				var sy = (yimage * this.gridh);
				var imgdata = this.imageContext.getImageData(sx, sy, this.gridw, this.gridh);
				var sd  = imgdata.data;

				var dcanvas = document.createElement('canvas');
				dcanvas.width  = this.gridw;
				dcanvas.height = this.gridh;

				var dcontext = dcanvas.getContext('2d');
				var dimgdata = dcontext.createImageData( this.gridw, this.gridh );
				var dd  = dimgdata.data;

				var xoffset = 0;
				var yoffset = 0;
				var rowoffset = this.gridw * 4;
				var offset;

				for (var y = 0; y < this.gridh; y++) {
					xoffset = 0;
					for (var x = 0; x < this.gridw; x++) {
						offset = yoffset + xoffset;

						dd[ offset + 0] = sd[ offset + 0];
						dd[ offset + 1] = sd[ offset + 1];
						dd[ offset + 2] = sd[ offset + 2];
						dd[ offset + 3] = sd[ offset + 3];

						if( transCol.mode == undefined ) {
							if( dd[ offset + 0] == transCol.r && dd[ offset + 1] == transCol.g && dd[ offset + 2] == transCol.b )
							{
								dd[ offset + 0] = 0;
								dd[ offset + 1] = 0;
								dd[ offset + 2] = 0;
								dd[ offset + 3] = 0; /* Make transparent */
							}
						}
						else {
							if( transCol.mode == 'ness' ) {
									dd[ offset + 3] = transCol.factor * ( ( dd[ offset + 0] + dd[ offset + 1] + dd[ offset + 2] ) / 3);
							}

						}
						xoffset += 4;
					}

					yoffset += rowoffset;
				}

				dcontext.putImageData( dimgdata, 0, 0);
				this.imagesCanvas.push( dcanvas  );
				this.imagesContext.push( dcontext );

				if (typeof collissionBoxSettings !== 'undefined') {
					this.imagesCanvasCollisions.push( new CollisionBoxFactory( dcanvas,
						collissionBoxSettings.xGranularity,
						collissionBoxSettings.yGranularity
					).getBoxes() );
				}
			}
      }

			this.count = this.imagesCanvas.length;
			this.index = 0;

      this.imageCanvas = null;
      this.imageContext = null;
      this.img = null;

	}


	getColissionArea( x, y ) {
			var cb = {
				x0: x + this.xoff,
				x1: x + this.xoff + this.gridw,
				y0: y + this.yoff,
				y1: y + this.yoff + this.gridh
			}

			this.debugCB = cb;
			return cb;
	}


	getColissionBoxArray( frame ) {

			return this.imagesCanvasCollisions[ frame ];
	}



	drawDebug( ctx, x, y, frame ) {

			if( this.debugCB != undefined ) {
			ctx.globalAlpha = 0.2;
			ctx.fillStyle = 'rgba(100,100,150,1)';
			ctx.fillRect(
				this.debugCB.x0,
				this.debugCB.y0,
				this.debugCB.x1 - this.debugCB.x0,
				this.debugCB.y1 - this.debugCB.y0
			);
			ctx.globalAlpha = 1.0;
		}

			var cbs = this.imagesCanvasCollisions[ frame ];
			ctx.font = '7px arial';
			ctx.textBaseline  = 'top';
			//__this.renderContext.fillStyle = "rgba(255,100,000,1)";

			for( var i=0; i<cbs.length; i++ ) {
				var cb = cbs[i];

				ctx.fillStyle = cb.col;
				ctx.fillRect(
					Math.floor( x + this.xoff ) + cb.x0,
					Math.floor( y + this.yoff ) + cb.y0,
					1+(cb.x1 - cb.x0),
					1+(cb.y1 - cb.y0)
				);

				ctx.fillStyle = 'rgba(255,255,255,1)';
				ctx.fillText( cb.group,
						Math.floor( x + this.xoff ) + cb.x0,
						Math.floor( y + this.yoff ) + cb.y0
					);

			}

			 ctx.globalAlpha = 0.2;
  	   ctx.drawImage( this.imagesCanvas[ frame ], x + this.xoff, y + this.yoff,  );
			 ctx.globalAlpha = 1;

  }


  draw( ctx, x, y, frame, effects ) {

		try {

			if( CollisionBoxFactory_Debug_a260592cbef84c018c6f3f4eff1037a0 ) {
				this.drawDebug( ctx, x, y, frame );
			} else {

				if( effects.active ) {
					if( effects.doAlpha ) {
						var backupAlpha = ctx.globalAlpha;
						ctx.globalAlpha = effects.alpha;

						ctx.drawImage( this.imagesCanvas[ frame ], Math.floor( x + this.xoff ) ,
						 	Math.floor( y + this.yoff )  );

						ctx.globalAlpha = backupAlpha;
					}
				}
			  else {
					ctx.drawImage( this.imagesCanvas[ frame ], Math.floor( x + this.xoff ) ,
					 	Math.floor( y + this.yoff )  );
				}


			}

     }
     catch ( ex ) {
       throw "Could not draw image " + frame + " : "+ ex;
			 console.log(this);
			 console.log( ex );
     }
  }
}

class SpriteImage {
  constructor( img, postLoadOperation, collissionBoxSettings ) {
    this.img = img;
    this.xoff = - img.width / 2;
    this.yoff = - img.height / 2;

		var w = this.img.width;
		var h = this.img.height;

		this.w = w;
		this.h = h;

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.canvas.width = 	w;
		this.canvas.height = 	h;

		this.context.drawImage( this.img, 0, 0, w, h);

//Array.isArray(
		if( postLoadOperation != null ) {
			if( typeof postLoadOperation === 'object'
					&& !Array.isArray(postLoadOperation) ) {

				var transCol = postLoadOperation;

				var imgdata = this.context.getImageData(0, 0, w, h);
				var dd  = imgdata.data;
				var rowoffset = w * 4;
				var sx = x;

				var xoffset = 0;
				var yoffset = 0;
				var offset;

				for (var y = 0; y < h; y++) {
					yoffset = y * rowoffset;
					xoffset = 0;
					for (var x = 0; x < w; x++) {
						offset = yoffset + xoffset;

						if( transCol.mode == undefined ) {
							if( dd[ offset + 0] == transCol.r && dd[ offset + 1] == transCol.g && dd[ offset + 2] == transCol.b )
							{
								dd[ offset + 0] = 0;
								dd[ offset + 1] = 0;
								dd[ offset + 2] = 0;
								dd[ offset + 3] = 0; /* Make transparent */
							}
						}
						else {
							if( transCol.mode == 'lightness' ) {
									dd[ offset + 3] = transCol.factor * ( ( dd[ offset + 0] + dd[ offset + 1] + dd[ offset + 2] ) / 3);
							}
						}
						xoffset += 4;
					}
					yoffset += rowoffset;
				}

				this.context.putImageData( imgdata, 0, 0);
			}
			else { //array

					var canvas2 = document.createElement('canvas');
					var context2 = canvas2.getContext('2d');
					canvas2.width = this.canvas.width;
					canvas2.height = this.canvas.height;

					//var imgdata = this.context.getImageData(0, 0, w, h);

					for (var i = 0; i < postLoadOperation.length; i++) {
							var op = postLoadOperation[ i ];
							op.f( this.context,
										context2,
										op.par);

							this.canvas = canvas2;
							this.context = context2;
							w= this.canvas.width;
							h= this.canvas.height;

							this.xoff = - w / 2;
					    this.yoff = - h / 2;

							this.w = w;
							this.h = h;
					}

					//this.context.putImageData( imgdata, 0, 0);
			}
		}
		if (typeof collissionBoxSettings !== 'undefined' ) {

			this.imagesCanvasCollision =
					new CollisionBoxFactory( this.canvas,
						collissionBoxSettings.xGranularity,
						collissionBoxSettings.yGranularity
					).getBoxes();
		}
  }

  draw( ctx, x, y, ignore, effects ) {
		if( CollisionBoxFactory_Debug_a260592cbef84c018c6f3f4eff1037a0 ) {
			this.drawDebug( ctx, x, y, ignore );
		} else {


			var backupGlobalCompositeOperation = null;

			if( effects.doCompositeOperation ) {
				backupGlobalCompositeOperation = ctx.globalCompositeOperation;
				ctx.globalCompositeOperation = effects.compositeOperation;
			}

			if( effects.active ) {

				var backupAlpha = null;


				if( effects.doAlpha ) {
					backupAlpha = ctx.globalAlpha;
					ctx.globalAlpha = effects.alpha;
				}



				var xoff = this.xoff;
				var yoff = this.yoff;
				var ws = this.w;
				var hs = this.h;

				if( effects.doScale ) {
					xoff = this.xoff * effects.scale;
					yoff = this.yoff * effects.scale;
					ws = this.w * effects.scale;
					hs = this.h * effects.scale;
				}

				if( effects.doRotate || effects.doScale ) {
					ctx.translate(x, y);
					ctx.rotate(effects.rotate);
					ctx.drawImage( this.canvas,
							xoff ,
							yoff ,
						  ws,
						  hs  );
					ctx.rotate(-effects.rotate);
					ctx.translate(-x, -y);

				}
				else  {
					ctx.drawImage( this.canvas, Math.floor( x + this.xoff ) ,
							Math.floor( y + this.yoff ) );
				}

				if( effects.doAlpha ) {
					ctx.globalAlpha = backupAlpha;
				}
			}
			else {
				ctx.drawImage( this.canvas, Math.floor( x + this.xoff ) ,
						Math.floor( y + this.yoff ) );
			}

			if( backupGlobalCompositeOperation != null ) {
				ctx.globalCompositeOperation = backupGlobalCompositeOperation;
			}
		}
	}

  drawDebug( ctx, x, y, ignore ) {

		if( this.debugCB != undefined ) {
			ctx.globalAlpha = 0.2;
			ctx.fillStyle = 'rgba(100,100,150,1)';
			ctx.fillRect(
				this.debugCB.x0,
				this.debugCB.y0,
				this.debugCB.x1 - this.debugCB.x0,
				this.debugCB.y1 - this.debugCB.y0
			);
			ctx.globalAlpha = 1.0;
		}

		var cbs = this.imagesCanvasCollision;
		ctx.font = '9px arial';
		ctx.textBaseline  = 'top';
		//__this.renderContext.fillStyle = "rgba(255,100,000,1)";

		for( var i=0; i<cbs.length; i++ ) {
			var cb = cbs[i];

			ctx.fillStyle = cb.col;
			ctx.fillRect(
				Math.floor( x + this.xoff ) + cb.x0,
				Math.floor( y + this.yoff ) + cb.y0,
				1+(cb.x1 - cb.x0),
				1+(cb.y1 - cb.y0)
			);

			ctx.fillStyle = 'rgba(255,255,255,1)';
			ctx.fillText( cb.group,
					Math.floor( x + this.xoff ) + cb.x0,
					Math.floor( y + this.yoff ) + cb.y0
				);

		}

		ctx.globalAlpha = 0.2;
		ctx.drawImage( this.canvas, Math.floor( x + this.xoff ) ,
				Math.floor( y + this.yoff ) );
		ctx.globalAlpha = 1.0;
  }


	getColissionBoxArray( frame ) {
			return this.imagesCanvasCollision;
	}

	getColissionArea( x, y ) {
			var cb = {
				x0: x + this.xoff,
				x1: x + this.xoff + this.canvas.width,
				y0: y + this.yoff,
				y1: y + this.yoff + this.canvas.height
			}

			this.debugCB = cb;

			return cb;
	}

	getCanvas() {
		return this.canvas;
	}

}


class Sprite {
  constructor( spriteImage, x , y ) {
    this.spriteImage = spriteImage;
    this.x=x;
    this.y=y;
    this.dx =0;
    this.dy =0;
    this.boundary = {};
		this.frameFlipSpeed = 1;
		this.type = 0;

		this.cols = [];
		this.cols[ 0 ] = "#ff0000";
		this.cols[ 1 ] = "#00ff00";
		this.cols[ 2 ] = "#0000ff";
		this.cols[ 3 ] = "#ff00ff";
		this.cols[ 4 ] = "#00ffff";
		this.cols[ 5 ] = "#ffff00";

		this.dbgCol = 0;

		this.boundaryAction = {
			bound: false,
			bounce: false,
			dissapear: true,
			wrap: false,
			event: false
		}
    this.active = false;

		this.frameIndex = 0;
		this.frameRange = { min: 0, max: 0};
		this.pauseAnimFlag = true;
		this.effects = { active: false }

		this.colliding = false;

  }

  draw( context ) {

		//context.globalCompositeOperation = "lighter";
    this.spriteImage.draw( context,
				Math.round( this.x ),
				Math.round( this.y ),
				this.frameIndex,
				this.effects
			);
		//context.globalCompositeOperation = "source-over";
  }

  activate() {
    this.active = true;
  }

	deactivate() {
    this.active = false;
  }

	getLayerInfo() {
		if( this.parent.layerManager === undefined ) {
			throw "Sprite.getLayerInfo() needs to be in a SpriteMover that needs to have a SpriteLayers parent";
		}

		return {
			layer: this.parent.layerId,
			count: this.parent.layerManager.getLayerCount()
		}

	}



	moreToFront() {
		var p = this.parent;
		var mgr = p.layerManager;

		if( mgr === undefined ) {
			throw "Sprite.moreToFront() needs to be in a SpriteMover that needs to have a SpriteLayers parent";
		}

		var c = mgr.getLayerCount();

		var dest = p.layerId + 1;
		if( dest >= c ) {
			throw "Sprite.moreToFront(), sprite cannot move to front when allready in front";
		}

		p.removeSprite( this );
		var p2 = mgr.getLayer( dest );
		p2.addSprite( this );

	}

	moreToBack() {
		var p = this.parent;
		var mgr = p.layerManager;

		if( mgr === undefined ) {
			throw "Sprite.moreToBack() needs to be in a SpriteMover that needs to have a SpriteLayers parent";
		}

		var c = mgr.getLayerCount();

		var dest = p.layerId -1;
		if( dest < 0 ) {
			throw "Sprite.moreToBack(), sprite cannot move to back when allready in back";
		}

		p.removeSprite( this );
		var p2 = mgr.getLayer( dest );
		p2.addSprite( this );
	}

	toLayer( dest ) {
		var p = this.parent;
		var mgr = p.layerManager;

		if( mgr === undefined ) {
			throw "Sprite.moreToFront() needs to be in a SpriteMover that needs to have a SpriteLayers parent";
		}

		var c = mgr.getLayerCount();

		p.removeSprite( this );
		var p2 = mgr.getLayer( dest );
		p2.addSprite( this );
	}

	getWH() {
		return [this.spriteImage.w, this.spriteImage.h];
	}

	cycleFrame() {
		if( !this.pauseAnimFlag ) {
	    this.frameIndex++;
			this.frameIndexF += this.frameFlipSpeed;
			this.frameIndex = Math.floor( this.frameIndexF );
	    if( this.frameIndex >this.frameRange.max ) {
	      this.frameIndex = this.frameRange.min;
				this.frameIndexF = this.frameIndex;
	    }
		}
  }

	setColliding( flag ) {
		this.colliding = flag;
	}

	setType( t ) {
		this.type = t;
	}

	setData( d ) {
		this.data = d;
	}

	getData() {
		return( this.data );
	}

	setCycleFrameRate( r ) {
		this.frameFlipSpeed = r;
	}

	setFrame( f ) {
		this.pauseAnimFlag = true;
		this.frameIndex = f;
	}


	setFrameRange( a, b) {


		this.frameRange.min = a;
		this.frameRange.max = b;
		this.frameIndex = a;
		this.frameIndexF = this.frameIndex;

	}

	pauseAnim() {
		this.pauseAnimFlag = true;
	}

	playAnim() {
		this.pauseAnimFlag = false;
	}


	setLinkXoYo( xoff, yoff ) {
		this.linkOffsetX = xoff;
		this.linkOffsetY = yoff;
	}


	getLinkXoYo() {
		return [this.linkOffsetX, this.linkOffsetY];
	}

	factorLinkXoYo( f ) {
		this.linkOffsetX *= f;
		this.linkOffsetY *= f;
	}

	setLinkXoYoFactor( f ) {

		this.effects.active = true;
		this.effects.doLinkXoYoChange = true;
		this.effects.linkXoYoChange = f;

	}

	linkPos( parent, xoff, yoff ) {
		this.linked = true;
		this.linkParent = parent;
		this.linkOffsetX = xoff;
		this.linkOffsetY = yoff;
	}

	linkAnim( parent ) {
		this.linkedAnim = true;
		this.linkAnimParent = parent;
	}


	setCompositeOperation( op ) {

		//this.effects.active = true;
		this.effects.compositeOperation = op;
		this.effects.doCompositeOperation = true;

	}

	setTimer( time ) {

		this.onTimer = true;
		this.timer = time;

	}

	setFadeFactor( alphaFactor ) {

		this.effects.active = true;
		this.effects.alpha = 1;
		this.effects.doAlpha = true;
		this.effects.alphaFactor = alphaFactor;

	}


	adjustFadeFactor( alphaFactor ) {

		this.effects.alphaFactor = scaleFactor;

	}

	setScaleFactor( scaleFactor ) {

		this.effects.active = true;
		this.effects.scale = 1;
		this.effects.doScale = true;
		this.effects.scaleFactor = scaleFactor;

	}

	adjustScaleFactor( scaleFactor ) {

		this.effects.scaleFactor = scaleFactor;

	}

	setRotateIncrease( rotateIncrease ) {

		this.effects.active = true;
		this.effects.rotate = 0;
		this.effects.doRotate = true;
		this.effects.rotateIncrease = rotateIncrease;

	}


	adjustRotateIncrease( rotateIncrease ) {
		this.effects.rotateIncrease = rotateIncrease;
	}

	resetEffects() {

		this.effects.active = false;
		this.effects.alpha = 1;
		this.effects.doAlpha = false;
		this.effects.alphaFactor = 1;
		this.effects.scale = 1;
		this.effects.doScale = false;
		this.effects.scaleFactor = 1;
		this.effects.rotate = 0;
		this.effects.doRotate = false;
		this.effects.rotateIncrease = 0;
		this.effects.doLinkXoYoChange = false;
		this.effects.linkXoYoChange = 1;

	}

  setBoundary( x0, y0, x1, y1 ) {
    this.boundary.x0 = x0;
    this.boundary.x1 = x1;
    this.boundary.y0 = y0;
    this.boundary.y1 = y1;
  }


	setBoundaryActionBound() {
		this.boundaryAction = {
				bound: true,
				bounce: false,
				dissapear: false,
				wrap: false,
				event: false
		}
  }

	setBoundaryActionBounce() {
		this.boundaryAction = {
				bound: false,
				bounce: true,
				dissapear: false,
				wrap: false,
				event: false
		}
  }

	setBoundaryActionDisappear() {
		this.boundaryAction = {
				bound: false,
				bounce: false,
				dissapear: true,
				wrap: false,
				event: false
		}
	}

	setBoundaryActionWrap() {
		this.boundaryAction = {
				bound: false,
				bounce: false,
				dissapear: false,
				wrap: true,
				event: false
		}
	}

	setBoundaryActionEvent( handler ) {
		this.boundaryAction = {
				bound: false,
				bounce: false,
				dissapear: false,
				wrap: false,
				event: true,
				eventHandler: handler
		}
	}

	wrapInBoundary() {
		var s = this;
    var bound = s.boundary;

    if( s.x < bound.x0 ) { s.x = bound.x1; }
    if( s.x > bound.x1 ) { s.x = bound.x0; }
    if( s.y < bound.y0 ) { s.y = bound.y1;  }
    if( s.y > bound.y1 ) { s.y = bound.y0;  }
	}


	bounceInBoundary() {

		var s = this;
		var bound = s.boundary;

		var crossedX = false, crossedY = false;
		if( s.x < bound.x0 ) { crossedX = true; }
    if( s.x > bound.x1 ) { crossedX = true; }
    if( s.y < bound.y0 ) { crossedY = true;  }
    if( s.y > bound.y1 ) { crossedY = true;  }

		this.placeInBoundary();

		if( crossedX ) { this.dx = - this.dx; }
		if( crossedY ) { this.dy = - this.dy; }
	}

	placeInBoundary() {

		var s = this;
    var bound = s.boundary;

    if( s.x < bound.x0 ) { s.x = bound.x0; }
    if( s.x > bound.x1 ) { s.x = bound.x1; }
    if( s.y < bound.y0 ) { s.y = bound.y0;  }
    if( s.y > bound.y1 ) { s.y = bound.y1;  }

	}

  inBoundary( ) {
    var s = this;
    var bound = s.boundary;

    if( s.x < bound.x0 ) { return false }
    else if( s.x > bound.x1 ) { return false }
    else if( s.y < bound.y0 ) { return false }
    else if( s.y > bound.y1 ) { return false }

    return true;

  }

	getBoundaryAction( ) {

		return this.boundaryAction;

	}


  setXY( x, y ) {
    this.x = x;
    this.y = y;
  }

	getXY( ) {
		return [ this.x, this.y ];
	}

	addXY( x, y ) {
    this.x += x;
    this.y += y;
  }


	adjustDXDY( dx, dy, factor ) {
		 	var olddx = this.dx;
			var olddy = this.dy;
			var inFactor = 1-factor;

	    this.dx = (dx * factor) + (olddx * inFactor);
	    this.dy = (dy * factor) + (olddy * inFactor) ;
	  }


  setDXDY( dx, dy ) {
    this.dx = dx;
    this.dy = dy;
  }

	getDXDY( ) {
		return [ this.dx, this.dy ];
	}

	decreaseSpeed( factor ) {
		this.dx  = this.dx * factor;
		this.dy  = this.dy * factor;
	}

	collide( this2 ) {

		var this1 = this;

		if( this1.effects.active || this2.effects.active ) {
			return false;
		}

		if( this1.colliding == false || this2.colliding == false ) {
			return false;
		}


		var a1 = this1.spriteImage.getColissionArea( this1.x, this1.y );
		var a2 = this2.spriteImage.getColissionArea( this2.x, this2.y );

		this1.debugBoxcollideSprite = this2;
		this2.debugBoxcollideSprite = this1;

		if (!this.colideAreas( a1, a2 ) ) {
			return false;
		}

		var ba1 = this1.spriteImage.getColissionBoxArray( this1.frameIndex );
		var ba2 = this2.spriteImage.getColissionBoxArray( this2.frameIndex );

		//try {
		var collided =
			this.checkCollisionBoxes(
					{ x: this1.x + this1.spriteImage.xoff, y:this1.y + this1.spriteImage.yoff, boxArray: ba1 },
					{ x: this2.x + this2.spriteImage.xoff, y:this2.y + this2.spriteImage.yoff, boxArray: ba2 }
			);
		//}
		//catch ( e ) {
//			var ba2 = this2.spriteImage.getColissionBoxArray( this1.frameIndex );
//			var ba1 = this1.spriteImage.getColissionBoxArray( this1.frameIndex );
//		}

		return collided;

	}

	checkCollisionBoxes( cobj1, cobj2 ) {
		var i1, i2;
		for( i1=0; i1<cobj1.boxArray.length; i1++ ) {
			var b1 = cobj1.boxArray[ i1 ];
			var a1 = {
				x0: b1.x0 + cobj1.x,
				x1: b1.x1 + cobj1.x,
				y0: b1.y0 + cobj1.y,
				y1: b1.y1 + cobj1.y
			};
			for( i2=0; i2<cobj2.boxArray.length; i2++ ) {
				var b2 = cobj2.boxArray[ i2 ];
				var a2 = {
					x0: b2.x0 + cobj2.x,
					x1: b2.x1 + cobj2.x,
					y0: b2.y0 + cobj2.y,
					y1: b2.y1 + cobj2.y
				};

				if( this.colideAreas( a1, a2 ) ) {
					b1.col = this.cols[ this.dbgCol ];
					this.dbgCol++;
					//console.log( "HIT " + b1.group + " - " + b2.group );
					//console.log( "b1" );
					//console.log( b1 );
					//console.log( "b2" );
					//console.log( b1 );
					if( this.dbgCol > 5 ) { this.dbgCol = 0;}
					b2.col = this.cols[ this.dbgCol ];
					return true;
				}
			}
		}
		return false;
	}

	colideAreas( a1, a2 ) {

		if( this.overlappingCoords( a1.x0, a1.x1, a2.x0, a2.x1 ) ) {
			if( this.overlappingCoords( a1.y0, a1.y1, a2.y0, a2.y1 ) ) {
				return true;
			}
		}
		return false;
	}

	overlappingCoords( obj1_XMIN, obj1_XMAX, obj2_XMIN, obj2_XMAX ) {

				return obj1_XMAX >= obj2_XMIN && obj2_XMAX >= obj1_XMIN;

	}

}

class SpriteLayers {

	constructor( x ) {
		this.movers = [];
		if( x === undefined ) {
				return;
		}
		else {
			for( var i=0; i<x; i++ ) {
				this.movers.push( new SpriteMover() );

				this.movers[ this.movers.length-1 ].layerId = i;
				this.movers[ this.movers.length-1 ].layerManager = this;
			}
		}
	}

  addSprite( s, l ) {
		this.movers[ l ].addSprite(s);
	}

	getLayer( x ) {
		return this.movers[ x ];
	}

	getLayerCount() {
		return this.movers.length;
	}

	addLayer( l ) {
		var i = this.movers.length;

		this.movers.push(l);
		this.movers[ this.movers.length-1 ].layerId = i;
		this.movers[ this.movers.length-1 ].layerManager = this;
	}

	render( ctx ) {
		for( var i=0; i<this.movers.length; i++ ) {
			var m = this.movers[ i ];
			m.render( ctx );
		}
	}

	move( ) {
		for( var i=0; i<this.movers.length; i++ ) {
			var m = this.movers[ i ];
			m.move( );
		}
	}

	animate( ) {
		for( var i=0; i<this.movers.length; i++ ) {
			var m = this.movers[ i ];
			m.animate( );
		}
	}

}

class SpriteMover {
  constructor() {
      this.sprites = [];
			this.idCount = 0;
  }

	countSprites( type ) {
		var count = 0;
    for( var i=0; i<this.sprites.length; i++ ) {
        if( this.sprites[ i ].active ) {
					if( this.sprites[ i ].type == type ) {
          	count ++;
				}
      }
    }
		return count;
  }


	getLinkedSprites( parent ) {
		var list = [];
		for( var i=0; i<this.sprites.length; i++ ) {
				if( this.sprites[ i ].active && this.sprites[ i ].linked == true) {

					if( this.sprites[ i ].linkParent == parent ) {
						list.push( this.sprites[ i ] );
				}
			}
		}
		return list;
	}


	getSprites( type ) {
		var list = [];
		for( var i=0; i<this.sprites.length; i++ ) {
				if( this.sprites[ i ].active ) {
					if( this.sprites[ i ].type == type ) {
						list.push( this.sprites[ i ] );
				}
			}
		}
		return list;
	}

  addSprite( s ) {
    if( this.sprites.length < 100 ) {
      this.sprites.push( s );
			s.uid = this.idCount++;

    }
    else {
      var found = -1;
      for( var i=0; i<this.sprites.length; i++ ) {
        if( !this.sprites[ i ].active ) {
          found = i;
          break;
        }
      }

      if( found == -1 ) {
        this.sprites.push( s );
				s.uid = this.idCount++;

				console.log("sprite count: " + this.sprites.length );
      }
      else {
        this.sprites[ found ] = s;
      }
    }

		s.parent = this;
  }


  sliceSprite( s ) {
    var index = this.sprites.find( s );
    if( index > -1 ) {
      this.sprites.splice(index, 1);
    }
    else {
      console.error("sprite with issue:");
      console.error( s );
      console.error( "spritearraylen = " + this.sprites.length );
      throw "(SpriteMover) could not find index for sprite, during sliceSprite";
    }
  }


	removeSprite( s ) {

		var check = null;
		var found = -1;

		for( var i=0; i<this.sprites.length; i++) {
				check = this.sprites[i];
				if( check.uid == s.uid ) {
					found = i;
					break;
				}
		}

		if( found > -1) {
			this.sprites[ i ] = { active: false }
		}
		else {
			console.error("sprite could not be removed: " + s.uid);
			console.error( s );
			console.error( "spritearraylen = " + this.sprites.length );
			throw "(SpriteMover) could not find index for sprite, during removeSprite";
		}
	}


  detectColissions() {
		var colissions = [];

		for( var i=0; i<this.sprites.length; i++ ) {
			var si = this.sprites[ i ];
			if( si.active == false ) {
				continue;
			}
			for( var j=i+1; j<this.sprites.length; j++ ) {
				var sj = this.sprites[ j ];
				if( sj.active == false ) {
					continue;
				}
				if( si.collide( sj ) ) {
					colissions.push( { 0: si, 1: sj } );
				}
			}
		}

		return colissions;
	}




  move() {
    for( var i=0; i<this.sprites.length; i++ ) {
      var s = this.sprites[ i ];

      if( s.active ) {

				if(s.linked) {
						s.x = s.linkParent.x + s.linkOffsetX;
						s.y = s.linkParent.y + s.linkOffsetY;
				}
				else {
					s.x += s.dx;
					s.y += s.dy;
				}

				if( s.onTimer ) {
					s.timer--;
					if(s.timer<=0) {
						s.active = false;
					}
				}

        if( !s.inBoundary() ) {
					var b = s.getBoundaryAction();
					if( b.dissapear ) {
          	s.active = false;
					}
					else if ( b.bound ) {
						s.placeInBoundary();
					}
					else if ( b.bounce ) {
						s.bounceInBoundary();
					}
					else if ( b.wrap ) {
						s.wrapInBoundary();
					}
					else if ( b.event ) {
						b.eventHandler[0][ b.eventHandler[1] ]( s );
					}
        }
      }
    }
  }

	animate() {
		for( var i=0; i<this.sprites.length; i++ ) {
			var s = this.sprites[ i ];
			if( s.active ) {

				if( s.linkedAnim ) {
					s.frameIndex = s.linkAnimParent.frameIndex;
				}
				else if( !s.pauseAnimFlag ) {
					s.cycleFrame();
				}
				if( s.effects.active ) {
					if( s.effects.doAlpha ) {
						s.effects.alpha = s.effects.alpha * s.effects.alphaFactor;
						if( s.effects.alpha < 0.01 || s.effects.alpha > 1 ) {
							s.deactivate();
						}
					}
					if( s.effects.doLinkXoYoChange ) {

						var f=s.effects.linkXoYoChange;
						s.linkOffsetX *= f;
						s.linkOffsetY *= f;

						if( s.linkOffsetX < 0.01 && s.linkOffsetY < 0.01 ) {
							s.deactivate();
						}
					}
					if( s.effects.doScale ) {
						s.effects.scale = s.effects.scale * s.effects.scaleFactor;
						if( s.effects.scale < 0.01 || s.effects.scale > 10 ) {
							s.deactivate();
						}
					}
					if( s.effects.doRotate ) {
						s.effects.rotate = s.effects.rotate + s.effects.rotateIncrease;
					}
				}

			}
		}
	}


  render( ctx ) {
    for( var i=0; i<this.sprites.length; i++ ) {
      var s = this.sprites[ i ];

      if( s.active ) {
        s.draw( ctx );
      }
    }
  }

}
