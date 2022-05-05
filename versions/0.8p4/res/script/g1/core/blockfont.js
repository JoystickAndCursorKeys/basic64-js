class BlockFont {

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

						if( dd[ offset + 0] == transCol.r && dd[ offset + 1] == transCol.g && dd[ offset + 2] == transCol.b )
						{
							dd[ offset + 0] = 0;
							dd[ offset + 1] = 0;
							dd[ offset + 2] = 0;
							dd[ offset + 3] = 0; /* Make transparent */
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


      this.iconCanvas = null;
      this.iconContext = null;
      this.img = null;

	}

  mapChar( c0 ) {

    var c = c0.toLowerCase();

    var map = [];
    var index;

    map['a'] = 0;    map['b'] = 1;
    map['c'] = 2;    map['d'] = 3;
    map['e'] = 4;    map['f'] = 5;
    map['g'] = 6;    map['h'] = 7;
    map['i'] = 8;    map['j'] = 9;
    map['k'] = 10;    map['l'] = 11;
    map['m'] = 12;    map['n'] = 13;
    map['o'] = 14;    map['p'] = 15;
    map['q'] = 16;    map['r'] = 17;
    map['s'] = 18;    map['t'] = 19;
    map['u'] = 20;    map['v'] = 21;
    map['w'] = 22;    map['x'] = 23;
    map['y'] = 24;    map['z'] = 25;

    map['0'] = 26;    map['1'] = 27;
    map['2'] = 28;    map['3'] = 29;
    map['4'] = 30;    map['5'] = 31;
    map['6'] = 32;    map['7'] = 33;
    map['8'] = 34;    map['9'] = 35;
    map['@'] = 36;    map['&'] = 37;
    map['*'] = 38;    map['+'] = 39;
    map['|'] = 40;    map['_'] = 41;
    map['.'] = 42;    map[','] = 43;
    map[':'] = 44;    map['()'] = 45;
    map[')'] = 46;    map['-'] = 47;
    map['#'] = 48;    map['?'] = 49;
    map['%'] = 50;    map['!'] = 51;

    index = map [ c ];
    if( index == undefined ) {
			if( c == ' ' ) {
				return -1;
			}
      index = 49;
    }

    return  index;
  }

  drawChar( ctx, x, y, c ) {
    var index = this.mapChar( c );
		if( index > -1 ) {
    	ctx.drawImage( this.iconsCanvas[ index ], x, y,  );
		}
  }

	centerX( str, screenWidth ) {
		var txtW = str.length * this.gridw;
		return Math.floor( (screenWidth/2) - ( txtW/2)) ;
	}

  drawString( ctx, x0, y, str ) {
    var x = x0;
    for (var i = 0; i < str.length; i++) {
        this.drawChar( ctx, x, y, str.charAt(i) );
        x+= this.gridw;
    }
  }

}
