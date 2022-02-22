class TileMap {

	constructor( w, h, _nullTile ) {

		this.data = [];
		var nullTile = 0;
		if( typeof _nullTile !== 'undefined' ) {
			nullTile = _nullTile;
		}

		for (var y = 0; y < h; y++) {
			var row = [];
			for (var x = 0; x < w; x++) {
				row[ x ] = nullTile;
			}
			this.data[ y ] = row;
		}
	}

	/*replaceTiles( fromTile, replaceTile ) {

		var data = this.data;
		for (var y = 0; y < data.length; y++) {
			var row = [];
			for (var x = 0; x < data[ y ].length ; x++) {
				if( data[ y ][ x ] == fromTile ) {
					data[ y ][ x ] = replaceTile;
				}
			}
		}
	}*/

	replaceTiles( fromTile, replaceTile ) {

		var data = this.data;
		for (var y = 0; y < data.length; y++) {
			var row = [];
			for (var x = 0; x < data[ y ].length ; x++) {
				if( data[ y ][ x ] == fromTile ) {
					data[ y ][ x ] = replaceTile;
				}
			}
		}
	}


	getTiles( fromTile ) {
		var array = [];
		var data = this.data;
		for (var y = 0; y < data.length; y++) {
			var row = [];
			for (var x = 0; x < data[ y ].length ; x++) {
				if( data[ y ][ x ] == fromTile ) {
					array.push( [x, y] );
				}
			}
		}
		return array;
	}

	getTile( x, y ) {
		return this.data[ y ][ x ];
	}

	AppendTextMap( textMap, ignoreTile, conversionList ) {
		for (var y = 0; y < textMap.length; y++) {

			for (var x = 0; x < textMap[y].length; x++) {
				var char = textMap[y].charAt( x )
				if( char != ignoreTile ) {
					this.data[ y ][ x ] = conversionList[ char ];
				}
			}
		}
	}
}



class Tiles {
	constructor( img, gridw, gridh, transCol ) {

			this.img = img;
			this.gridw = gridw;
			this.gridh = gridh;

			this.iconsCanvas = [];
			this.iconsContext = [];

			var w = this.img.width;
			var h = this.img.height;

			this.iconCanvas = document.createElement('canvas');
			this.iconContext = this.iconCanvas.getContext('2d');

			this.iconCanvas.width = 	w;
			this.iconCanvas.height = 	h;

			this.iconContext.drawImage( this.img, 0, 0, w, h);

			this.xiconcount = w / this.gridw;
      this.xiconrowcount = h / this.gridh;

      for (var yicon = 0; yicon < this.xiconrowcount; yicon++) {
			for (var xicon = 0; xicon < this.xiconcount; xicon++) {

				var sx = (xicon * this.gridw);
				var sy = (yicon * this.gridh);
				var imgdata = this.iconContext.getImageData(sx, sy, this.gridw, this.gridh);
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

						if( transCol ) {
							if( dd[ offset + 0] == transCol.r && dd[ offset + 1] == transCol.g && dd[ offset + 2] == transCol.b )
							{
								dd[ offset + 0] = 0;
								dd[ offset + 1] = 0;
								dd[ offset + 2] = 0;
								dd[ offset + 3] = 0; /* Make transparent */
							}
						}

						xoffset += 4;
					}

					yoffset += rowoffset;
				}

				dcontext.putImageData( dimgdata, 0, 0);
				this.iconsCanvas.push( dcanvas  );
				this.iconsContext.push( dcontext );
			}
      }


      this.iconCanvas = undefined;
      this.iconContext = undefined;
      this.img = undefined;

	}

  drawTile( ctx, x, y, index ) {
    ctx.drawImage( this.iconsCanvas[ index ], x, y );
  }

	drawTiles( ctx, px, py, mapdata ) {

		var xoffset=0;
		var yoffset=0;
		for (var y = 0; y < mapdata.length; y++) {
			for (var x = 0; x < mapdata[y].length; x++) {
				ctx.drawImage( this.iconsCanvas[ mapdata[y][x]  ], xoffset+px, yoffset+py );
				xoffset+=this.gridw;
			}
			xoffset=0;
			yoffset+=this.gridh;
		}

  }
}
