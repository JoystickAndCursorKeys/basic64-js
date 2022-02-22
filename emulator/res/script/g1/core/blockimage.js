var BlockImage_counter = 0;

class BlockImage  {

	constructor( a, b ) {

    if( typeof( a ) == "object") {
      if( a.width != undefined ) {
        this.initFromImage( a );
      }
    }
    else  {
      this.initNewCanvas( a, b );
    }

  }

	initNewCanvas( w, h ) {

		this.canvas = document.createElement('canvas');

		this.canvas.id     = "ImageCanvasContext_" + BlockImage_counter++;
		this.canvas.width  = w;
		this.canvas.height = h;

		this.w = w;
		this.h = h;

		this.context = this.canvas.getContext('2d',{ alpha: false, desynchronized: true });
	}

	initFromImage( img ) {

		this.canvas = document.createElement('canvas');

		this.canvas.id     = "ImageCanvasContext_" + BlockImage_counter++;
		this.canvas.width  = img.width;
		this.canvas.height = img.height;

		this.w = img.width;
		this.h = img.height;

    this.source = img;

		var context = this.canvas.getContext('2d',{ alpha: false, desynchronized: true });
		context.drawImage(img, 0, 0);
    this.context = context;

	}


  reInit() {
    if( this.source != undefined ) {
      this.initFromImage( this.source );
    }
  }


	copy() {

		var tmpImgCtxCanv = new BlockImage();

		tmpImgCtxCanv.initNewCanvas( this.w, this.h );
		tmpImgCtxCanv.context.drawImage( this.canvas, 0, 0);

		return tmpImgCtxCanv;

	}

	getCopyAllData() {
		return this.context.getImageData(0, 0, this.w, this.h);
	}

	getContext() {
		return this.context;
	}

	getCanvas() {
		return this.canvas;
	}

	setAllData( data ) {
		this.context.putImageData(data, 0, 0);
	}

	flipX() {

		var imgCtxCanv = this;

		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;

		for( var y=0; y<h; y++ ) {
			for( var x=0; x<w; x++) {
				var x2= w-1-x;

				var offset1 = yoffset + (x * 4);
				var offset2 = yoffset + (x2 * 4);

				dstData[ offset1 ] 		= srcData[ offset2 ];
				dstData[ offset1+1 ] 	= srcData[ offset2+1 ];
				dstData[ offset1+2 ] 	= srcData[ offset2+2 ];
				dstData[ offset1+3 ] 	= srcData[ offset2+3 ];
			}

			yoffset+= (w*4);
		}

		imgCtxCanv.setAllData( dstIData );
	}

	flipY() {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffset2;

		for( var y=0; y<h; y++ ) {
			var y2= h-y-1;
			yoffset2 = (w*4) * y2;

			for( var x=0; x<w; x++) {


				var offset1 = yoffset + (x * 4);
				var offset2 = yoffset2 + (x * 4);

				dstData[ offset1 ] 		= srcData[ offset2 ];
				dstData[ offset1+1 ] 	= srcData[ offset2+1 ];
				dstData[ offset1+2 ] 	= srcData[ offset2+2 ];
				dstData[ offset1+3 ] 	= srcData[ offset2+3 ];
			}

			yoffset+= (w*4);
		}

		imgCtxCanv.setAllData( dstIData );

	}

	mask( tR,tG,tB ) {

				var imgCtxCanv = this;
				var tmpImgCtxCanv = imgCtxCanv.copy( );

				var w=tmpImgCtxCanv.w;
				var h=tmpImgCtxCanv.h;
				var srcIData = tmpImgCtxCanv.getCopyAllData();
				var dstIData = imgCtxCanv.getCopyAllData();
				var srcData = srcIData.data;
				var dstData = dstIData.data;

				var yoffset = 0;
				var yoffsetmin = 0;
				var rowSize = w*4;

				for( var y=0; y<h; y++ ) {

					for( var x=0; x<w; x++) {

						var offset = yoffset + (x * 4);

						if( srcData[ offset + 3] == 0) {
							continue;
						}

						var r,g,b;
						r = srcData[ offset + 0];
						g = srcData[ offset + 1];
						b = srcData[ offset + 2];

						dstData[ offset + 0]=r;
						dstData[ offset + 1]=g;
						dstData[ offset + 2]=b;
						dstData[ offset + 3]=255;

						if( r==tR && g==tG && b==tB) {
							dstData[ offset + 3]=0;
						}
					}

					yoffset+= ( rowSize );
				}

				imgCtxCanv.setAllData( dstIData );

	}

	rotate90Degrees() {

		var imgCtxCanv = this;
		var w=imgCtxCanv.w;
		var h=imgCtxCanv.h;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		imgCtxCanv.w = h;
		imgCtxCanv.h = w;
		imgCtxCanv.canvas.width = h;
		imgCtxCanv.canvas.height = w;
		var dstIData = imgCtxCanv.getCopyAllData();

		var offsetsrc = 0;
		var offsetdst = 0;

		var yoffsetmin = 0;
		var rowSizesrc = tmpImgCtxCanv.w	*4;
		var rowSizedst = imgCtxCanv.w			*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

					var xd = h-y-1;
					var yd = x; //w-x-1;

					offsetsrc = ( y * rowSizesrc) + (x * 4);
					offsetdst = ( yd * rowSizedst) + ( xd * 4);

					dstIData.data[ offsetdst + 0 ] = srcIData.data[ offsetsrc + 0 ];
					dstIData.data[ offsetdst + 1 ] = srcIData.data[ offsetsrc + 1 ];
					dstIData.data[ offsetdst + 2 ] = srcIData.data[ offsetsrc + 2 ];
					dstIData.data[ offsetdst + 3 ] = srcIData.data[ offsetsrc + 3 ];
			}
		}
		imgCtxCanv.setAllData( dstIData );
		return { w:imgCtxCanv.w, h: imgCtxCanv.h}
	}

	pixelResize( wNew, hNew ) {

		var imgCtxCanv = this;
		var oldW=imgCtxCanv.w;
		var oldH=imgCtxCanv.h;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		imgCtxCanv.w = wNew;
		imgCtxCanv.h = hNew;
		imgCtxCanv.canvas.width = wNew;
		imgCtxCanv.canvas.height = hNew;
		var dstIData = imgCtxCanv.getCopyAllData();

		var offsetsrc = 0;
		var offsetdst = 0;

		var yoffsetmin = 0;
		var rowSizesrc = tmpImgCtxCanv.w	*4;
		var rowSizedst = imgCtxCanv.w			*4;

		var xFact = oldW / wNew;
		var yFact = oldH / hNew;

		for( var y=0; y<hNew; y++ ) {

			for( var x=0; x<wNew; x++) {

					var xs = Math.round(x * xFact);
					var ys = Math.round(y * yFact);

					offsetsrc = ( ys * rowSizesrc) + (xs * 4);
					offsetdst = ( y * rowSizedst) + ( x * 4);

					dstIData.data[ offsetdst + 0 ] = srcIData.data[ offsetsrc + 0 ];
					dstIData.data[ offsetdst + 1 ] = srcIData.data[ offsetsrc + 1 ];
					dstIData.data[ offsetdst + 2 ] = srcIData.data[ offsetsrc + 2 ];
					dstIData.data[ offsetdst + 3 ] = srcIData.data[ offsetsrc + 3 ];
			}
		}
		imgCtxCanv.setAllData( dstIData );

		return { w:imgCtxCanv.w, h: imgCtxCanv.h}
	}

}
