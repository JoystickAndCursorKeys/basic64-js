
class SpriteImageMagic {

	mkShadow1( 	srcCtx,
							dstCtx,
							transCol ) {

			var w = srcCtx.canvas.width;
			var h = srcCtx.canvas.height;

			var imgdata = srcCtx.getImageData(0, 0, w, h);
			var dd  = imgdata.data;

			var rowoffset = w * 4;

			var xoffset = 0;
			var yoffset = 0;
			var offset;

			for (var y = 0; y < h; y++) {
				yoffset = y * rowoffset;
				xoffset = 0;
				for (var x = 0; x < w; x++) {
					offset = yoffset + xoffset;

					if( dd[ offset + 0] == transCol.r && dd[ offset + 1] == transCol.g && dd[ offset + 2] == transCol.b )
					{
						dd[ offset + 0] = 0;
						dd[ offset + 1] = 0;
						dd[ offset + 2] = 0;
						dd[ offset + 3] = 0; /* Make transparent */
					}
					else {
						if( (x+y) % 2 == 0 ) {
							dd[ offset + 0] = 0;
							dd[ offset + 1] = 0;
							dd[ offset + 2] = 0;
							dd[ offset + 3] = 255;
						}
						else {
							dd[ offset + 0] = 0;
							dd[ offset + 1] = 0;
							dd[ offset + 2] = 0;
							dd[ offset + 3] = 0;
						}
					}
					xoffset += 4;
				}
				yoffset += rowoffset;
			}

			dstCtx.putImageData( imgdata, 0, 0);
	}


	scale( 	srcCtx,
					dstCtx,
					factor ) {

			var w = srcCtx.canvas.width;
			var h = srcCtx.canvas.height;

			var w2 = Math.floor(w * factor);
			var h2 = Math.floor(h * factor);

			dstCtx.canvas.width  = w2;
			dstCtx.canvas.height = h2;

			var imgdata = srcCtx.getImageData(0, 0, w, h);
			var dd  = imgdata.data;

			var imgdata2 = dstCtx.getImageData(0, 0, w2, h2);
			var dd2  = imgdata2.data;

			var rowoffset = w * 4;
			var rowoffset2 = w2 * 4;

			var xoffset = 0;
			var yoffset = 0;
			var xoffset2 = 0;
			var yoffset2 = 0;
			var offset;
			var offset2;

			for (var y2 = 0; y2 < h2; y2++) {
				yoffset2 = y2 * rowoffset2;
				xoffset2 = 0;
				for (var x2 = 0; x2 < w2; x2++) {
					offset2 = yoffset2 + xoffset2;

					var x = Math.floor( x2 / factor);
					var y = Math.floor( y2 / factor);

					yoffset = y * rowoffset;
					xoffset = x * 4;

					offset = yoffset + xoffset;

					dd2[ offset2 + 0] = dd[ offset + 0];
					dd2[ offset2 + 1] = dd[ offset + 1];
					dd2[ offset2 + 2] = dd[ offset + 2];
					dd2[ offset2 + 3] = dd[ offset + 3];

					xoffset2 += 4;
				}
				yoffset2 += rowoffset2;
			}

			dstCtx.putImageData( imgdata2, 0, 0);
	}


	colorize( 	srcCtx,
							dstCtx,
							rec ) {

      var f = 1-rec.effect;
      var nR = rec.r;
      var nG = rec.g;
      var nB = rec.b;

			var w = srcCtx.canvas.width;
			var h = srcCtx.canvas.height;

			var imgdata = srcCtx.getImageData(0, 0, w, h);
			var dd  = imgdata.data;

			var rowoffset = w * 4;

			var xoffset = 0;
			var yoffset = 0;
			var offset;

			for (var y = 0; y < h; y++) {
				yoffset = y * rowoffset;
				xoffset = 0;
				for (var x = 0; x < w; x++) {
					offset = yoffset + xoffset;

					dd[ offset + 0] = dd[ offset + 0] * f +
              (nR * (1-f));

          dd[ offset + 1] = dd[ offset + 1] * f +
              (nG * (1-f));

          dd[ offset + 2] = dd[ offset + 2] * f +
              (nB * (1-f));

          xoffset += 4;
					}
					yoffset += rowoffset;

			}

			dstCtx.putImageData( imgdata, 0, 0);
	}

}
