
class C64SpriteFrame {

	constructor() {
		this.ini = false;
	}

	init() {
		if( this.ini ) { return; }

		this.canvas =  document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.canvas.width=24;
		this.canvas.height=21;

		this.ini = true;

	}

	getCanvas() {
		this.init();
		return this.canvas;
	}

}


class C64Screen {

	 constructor( rcanvasid, c64path, onload, onloaddata  ) {

		  var __this = this;

			this._setColors();

		  var font = new Image();
		  this.characterSetImage = font;
		  this.onload = onload;
		  this.onloaddata = onloaddata;

 		  this.vic = [];
			this.vicUsed = [];

			for( var i=0; i<47; i++) {
				this.vic.push(0);
			}

      font.onload = function ( evt ) {
        __this._postLoadFontImage();
      }

      font.src = c64path + "/res/petscii.png";
      this.ready = false;

      this.canvas =  document.createElement('canvas');
      this.context = this.canvas.getContext('2d');



			this.rcanvas =  document.getElementById( rcanvasid );
      this.rcontext = this.rcanvas.getContext('2d');

			this.iwidth = 320;
			this.iheight = 200;
      this.canvas.width=this.iwidth;
      this.canvas.height=this.iheight;

			this.iImgDta = this.context.getImageData(0, 0, this.iwidth, this.iheight );
	    this.iDta = this.iImgDta.data;

			this.bufcanvas =  document.createElement('canvas');
      this.bufcontext = this.bufcanvas.getContext('2d');
			this.bufcanvas.width = this.iwidth;
			this.bufcanvas.height = this.iheight;


			this.border = {
				w: 128,
				h: 64
			}

			this.WIDTH = 960;
			this.HEIGHT = 600;

			this.FULLWIDTH = this.WIDTH + this.border.w * 2;
			this.FULLHEIGHT = this.HEIGHT + this.border.h * 2;

			this.rcanvas.width=this.FULLWIDTH ;
      this.rcanvas.height=this.FULLHEIGHT;


			this.context.imageSmoothingEnabled= false;

			this._setCharMapping();
			this._initSpriteArrays();


			this.pixel = this.context.createImageData(1,1);
			this.pixeldata = this.pixel.data;

			this.pixels8 = this.context.createImageData(8,1);
			this.pixels8data = this.pixels8.data;

			this.col = 14;
			this.bgcol = 6;
			this.bgcolLast = 6;
			this.bcol = 14;
			this.bcolLast = 14;
			this.mcol1 = 2;
			this.mcol1Last = 2;
			this.mcol2 = 1;
			this.mcol2Last = 2;

			this.multiColor = false;
			this.multiColorLast = false;

   }

	 _initSpriteArrays() {
		 this.spframes = [];
		 for( var t=0; t<128; t++ ) {
			 this.spframes[ t ] = new C64SpriteFrame();
			 this.spframes[ t ].init();
			 this.spframes[ t ].context.fillStyle = this._htmlColor( this.colors[ 1 ] );
			 this.spframes[ t ].context.fillRect(
				 0,0,
				 24,
				 21
			 );
		 }


		 this.sprites = [];
		 for( var i=0; i<8; i++ ) {

			 this.sprites[ i ] = new Object();
			 var sp = this.sprites[ i ];
			 sp.x = 0; sp.y = 0; sp.enabled = 0; sp.frame = 0; sp.col = 0;

			 sp.canvas = document.createElement('canvas');
			 sp.context = sp.canvas.getContext('2d');
			 sp.canvas.width=24;
			 sp.canvas.height=21;

			 this.spriteCol(i,1);
			 this.spriteFrame(i,0);

		 }
	 }

	 _setCharMapping() {
		 var map = [];
		 for( var i=0 ; i<32; i++ ) {
			 map[String.fromCharCode(i)] = 128+i;
		 }

		 for( var i=128 ; i<160; i++ ) {
			 map[String.fromCharCode(i)] = 64+i;
		 }


		 map['@'] = 0;
		 map['a'] = 1;
		 map['b'] = 2;
		 map['c'] = 3;
		 map['d'] = 4;
		 map['e'] = 5;
		 map['f'] = 6;
		 map['g'] = 7;
		 map['h'] = 8;
		 map['i'] = 9;
		 map['j'] = 10;
		 map['k'] = 11;
		 map['l'] = 12;
		 map['m'] = 13;
		 map['n'] = 14;
		 map['o'] = 15;
		 map['p'] = 16;
		 map['q'] = 17;
		 map['r'] = 18;
		 map['s'] = 19;
		 map['t'] = 20;
		 map['u'] = 21;
		 map['v'] = 22;
		 map['w'] = 23;
		 map['x'] = 24;
		 map['y'] = 25;
		 map['z'] = 26;

		 map['['] = 27;
		 map[']'] = 29;
		 map['!'] = 33;
		 map['"'] = 34;
		 map['#'] = 35;
		 map['$'] = 36;
		 map['%'] = 37;
		 map['&'] = 38;
		 map['\''] = 39;
		 map['\\'] = 77;
		 map['{'] = 0x73;
		 map['}'] = 0x6b;
		 map['('] = 40;
		 map[')'] = 41;

		 map['*'] = 42;
		 map['+'] = 43;
		 map[','] = 44;
		 map['-'] = 45;
		 map['.'] = 46;
		 map['/'] = 47;

		 map['0'] = 48;
		 map['1'] = 49;
		 map['2'] = 50;
		 map['3'] = 51;
		 map['4'] = 52;
		 map['5'] = 53;
		 map['6'] = 54;
		 map['7'] = 55;
		 map['8'] = 56;
		 map['9'] = 57;

		 map[' '] = 32;

		 map[':'] = 58;
		 map[';'] = 59;
		 map['<'] = 60;
		 map['='] = 61;
		 map['>'] = 62;
		 map['?'] = 63;

		 this.map = map;

		 var backmap = []
		 var mapInfo = Object.entries(map);
		 for( var i=0; i<mapInfo.length; i++) {
			 backmap[ mapInfo[i][1]] = mapInfo[i][0];
		 }
		 backmap[32] = " ";
		 this.backmap = backmap;
		 console.log( map );
		 console.log( backmap );
	 }

	 _setColors() {
		 this.colors = [];

		 this.colors[ 0 ] = { r:1, g:1, b:1 };
		 this.colors[ 1 ] = { r:255, g:255, b:255 };
		 this.colors[ 2 ] = { r:136, g:0, b:0 };
		 this.colors[ 3 ] = { r:170, g:255, b:238 };
		 this.colors[ 4 ] = { r:204, g:68, b:204 };
		 this.colors[ 5 ] = { r:0, g:204, b:85 };
		 this.colors[ 6 ] = { r:0, g:0, b:170 };
		 this.colors[ 7 ] = { r:238, g:238, b:119 };
		 this.colors[ 8 ] = { r:221, g:136, b:85 };
		 this.colors[ 9 ] = { r:102, g:68, b:0 };
		 this.colors[ 10 ] = { r:255, g:119, b:119 };
		 this.colors[ 11 ] = { r:51, g:51, b:51 };
		 this.colors[ 12 ] = { r:119, g:119, b:119 };
		 this.colors[ 13 ] = { r:170, g:255, b:102 };
		 this.colors[ 14 ] = { r:0, g:136, b:255 };
		 this.colors[ 15 ] = { r:187, g:187, b:187 };
	 }

	 _getByteBits( byte ) {
		 var masks = [
			 0b00000001,0b00000010,0b00000100,0b00001000,
			 0b00010000,0b00100000,0b01000000,0b10000000
		 ];

		var results = [ false, false, false, false, false, false, false, false ];

		for( var i=0; i<8; i++) {

			results[ i ] = (byte & masks[i]) > 0;

		}

		return results;
	 }

	 _intVpokesProcess() {
		 if( this.vicUsed.length == 0) {
			 return;
		 }

		 var vu = this.vicUsed;
		 var vul = vu.length;

		 for( var i=0; i<vul; i++ ) {
			 var index = vu[ i ];
			 var nr = index + 53248;
			 var v = this.vic[ index ];
			 if( nr == 53280)  {
				 this.setBorderColor( v % 16 );
			 }
			 else if( nr == 53281)  {
				 this.setBGColor( v % 16 );
			 }
			 else if( nr == 53282)  {
				 this.setMColor1( v % 16 );
			 }
			 else if( nr == 53283)  {
				 this.setMColor2( v % 16 );
			 }
			 else if( nr == 53269)  {
				 var bits = this._getByteBits( v );
				 var spr = this.sprites;
				 for( var j=0; j<8; j++) {
					 spr[ j ].enabled = bits[j];
					 console.log("Sprite[" +j+"].enable=" + bits[j])
				 }
			 }
			 else if( nr == 53269)  {
				 var bits = this._getByteBits( v );
				 this.multiColor = bits[4];
				 for( var j=0; j<8; j++) {
					 console.log("53269[" +j+"].enable=" + bits[j])
				 }
			 }
			 else if( nr>53247 && nr < 53264 ) {
				var sprno = Math.floor((nr -53248) / 2);
				var xcoord = !(nr % 2);
				console.log("sprite #" + sprno);
				console.log("is xcoord " + xcoord);
				console.log("coord #" + v);

				if( xcoord ) {
					this.spriteXPos( sprno, v );
				}
				else {
					this.spriteYPos( sprno, v );
				}

			 }

		 }

		 this.vicUsed = [];
	 }

	 vpoke( a, b ) {
		 this.vic[a] = b % 256;
		 this.vicUsed.push( a );
	 }

	 vpeek( a ) {
		 return this.vic[a];
	 }

	 reset( ) {
			 this.rcontext.imageSmoothingEnabled= false;
	 }

	 _prepareFontImageData() {

     var img1 = this.characterSetImage;
     var img2 = document.createElement("canvas");

     var ctx2 = img2.getContext("2d");

     img2.width = img1.width;
     img2.height = img1.height;
     ctx2.drawImage(img1, 0, 0);

     var imgdata = ctx2.getImageData(0, 0, img1.width, img1.height );
     var sd = imgdata.data;

     var pixelsCount = img1.width * img1.height ;
     var len = pixelsCount * 4;
     var data = new Uint8Array( pixelsCount * 2);

     var di = 0;
     for (var i = 0; i < len; i += 4) {
       if (sd[i + 0]) {
         data[ di ] = 1;
         data[ di + pixelsCount ] = 0;
       } else {
         data[ di ] = 0;
         data[ di + pixelsCount ] = 1;
       }
       di++;
     }

     return [data,img1.width, img1.height];
   }

	 _postLoadFontImage() {

     console.log("_postLoadFontImage reached");

		 this.fontImageData = this._prepareFontImageData(this.srcImage);

		 //-----------------------


		 //-------------------------
		 this.bcolLast = -1;

		 this.clearScreen();
		 this.writeString( "ready.", true );
		 this._updateBorder();
		 this._renderBackGround();
		 this._renderBuffer();

		 this._updateDisplay();

     this.ready = true;
     if( this.onload != undefined ) {
       this.onload( this, this.onloaddata );
     }
   }


	 setColor( c ) {
		 this.col = c;
	 }

	 setBGColor( c ) {
		 this.bgcol = c;
	 }


 	 setMColor1( c ) {
 		 this.mcol1 = c;
 	 }

	 setMColor2( c ) {
 		 this.mcol2 = c;
 	 }


	 setBorderColor( c ) {
		 this.bcol = c;
	 }

 	 spriteFrame( s, f ) {

 		 var sp = this.sprites[ s ];
 		 this.spframes[ f ].init();

 		 sp.frame = f;

 		 var imgdata = sp.context.getImageData(0, 0, 24, 21 );
 		 var dd  = imgdata.data;

 		 var imgdata2 = this.spframes[ f ].context.getImageData(0, 0, 24, 21 );
 		 var sd  = imgdata2.data;

 		 var len = 24 * 21 * 4;
 		 var c = this.colors[ sp.col ];
 		 for( var i=0 ; i<len; i+=4 ) {
 			 if( sd[ i+0 ] ) {
 				 dd[ i+0 ] = c.r;
 				 dd[ i+1 ] = c.g;
 				 dd[ i+2 ] = c.b;
 				 dd[ i+3 ] = 255;
 			 }
 			 else {
 				 dd[ i+3 ] = 0;
 			 }
 		 }

 		 sp.context.putImageData( imgdata, 0, 0 );
 	 }

 	 spriteEnable( n, enabled ) {
 		 this.sprites[ n ].enabled = enabled;
 	 }


	 spriteXPos( n, x ) {
 		 this.sprites[ n ].x = x;
		 //console.log("sprite.x " + n + " = " +x);
		 //console.log(this.sprites[ n ]);
 	 }

	 spriteYPos( n, y ) {
		 this.sprites[ n ].y = y;
	 }

 	 spritePos( n, x, y ) {
 		 this.sprites[ n ].x = x;
 		 this.sprites[ n ].y = y;
 	 }

 	 spriteCol( n, c ) {
 		 this.sprites[ n ].col = c;
      this.spriteFrame( n, this.sprites[ n ].frame )
 	 }


 	 spritePoke( frame, offset, byte ) {

 		 var mem = this.pixels8data;
 		 for( var i=0 ; i<8; i++) {
 			 var mask = (1<<(7-i));
 			 var v=0;
 			 var o = i*4;
 			 if( byte & mask ) {
 				 v=255;
 			 }
 			 mem[ o+0 ] = v;
 			 mem[ o+1 ] = v;
 			 mem[ o+2 ] = v;
 			 mem[ o+3 ] = v;
 		 }

 		 //x,y from offset, todo, must be a quicker way to do this
 		 var x=0, y=0;
 		 for( var i=0 ; i<offset; i++) {
 			 x+=8;
 			 if( x > 16 ) {
 				 x=0; y++;
 			 }
 		 }

 		 this.spframes[ frame ].context.putImageData( this.pixels8, x, y );
 		 //console.log();
 		 //this.spriteFrame(); todo
 		 this.spriteReFrame( frame );
 	 }

 	 spritePlot( frame, x, y, on ) {

 		 var d=this.pixeldata;
 		 var v = 0;
 		 if( on ) { v=255; }
 		 d[0]   = v;
 		 d[1]   = v;
 		 d[2]   = v;
 		 d[3]   = v;
 		 this.spframes[ frame ].context.putImageData( this.pixel, x, y );
 		 //this.spriteFrame(); todo
 		 this.spriteReFrame( frame );
 	 }


 	 spriteReFrame( frame ) {

 		 for( var s=0 ; s<8; s++) {

 			 var sp = this.sprites[ s ];
 			 if( sp.frame == frame ) {
 				 this.spriteFrame( s, sp.frame ); //redraw with correct mono color
 			 }
 		 }

 	 };

	 getRenderSize() {
		 return [ this.rcanvas.width, this.rcanvas.height ];
	 }

	 clearScreen() {
		this.buffer = [];
		this.cursorx = 0;
		this.cursory = 0;

	 	for( var y=0; y<25; y++) {
			var row = [];
	 		for( var x=0; x<40; x++) {
				row[ x ] = [32,14,true];
	 		}
	 		this.buffer[ y ] = row;
	 	}
	 }

	 scrollUp() {

		 var buf = this.buffer;

		 this.cursory=24;

		 for( var y=0; y<24; y++) {
			 buf[y] = buf[y + 1];
		 }
		var newrow = [];
		for( var x=0; x<40; x++) {
			newrow[ x ] = [32,14,true];
		}
		buf[ 24 ] = newrow;

		for( var y=0; y<25; y++) {
		  for( var x=0; x<40; x++) {
		 	  buf[y][x][2] = true;
		  }
		 }

	 }


	 nextLine(  c ) {
		 this.cursory++;
		 this.cursorx=0;
		 if( this.cursory > 24 ) {
			 this.cursory = 24;
			 this.scrollUp();
		 }
	 }

	 setChar( x, y, index ) {

		var buf = this.buffer;
		var chr = buf[y][x];

		chr[2] = true;
		chr[0] = index;

	 }

	 setCharCol( x, y, index ) {

		var buf = this.buffer;
		var chr = buf[y][x];

		chr[2] = true;
		chr[1] = index;

	 }

	 saveCursor( x ) {
		 if( x < 0 ) {
			 return (x+128)%256;
		 }
		 return x%256;
	 }

	 blinkCursor() {
		var buf = this.buffer;
		if( !this.cursorOn ) {
			this.cursorOn = true;
			this.cursorChar = buf[this.cursory][this.cursorx][0];
			var index = 32+128;
			buf[this.cursory][this.cursorx][2] = true;
			buf[this.cursory][this.cursorx][1] = this.col;
			buf[this.cursory][this.cursorx][0] = this.saveCursor(buf[this.cursory][this.cursorx][0] + 128);
		}
		else {
			this.cursorOn = false;
			var index = 32;
			buf[this.cursory][this.cursorx][2] = true;
			buf[this.cursory][this.cursorx][1] = this.col;
			buf[this.cursory][this.cursorx][0] = this.cursorChar;
		}

   }

	 clearCursor() {
		var buf = this.buffer;
 		if( this.cursorOn ) {
 			this.cursorOn = false;
 			var index = 32;
 			buf[this.cursory][this.cursorx][2] = true;
 			buf[this.cursory][this.cursorx][1] = this.col;
 			buf[this.cursory][this.cursorx][0] = this.cursorChar;
 		}
   }

	 cursorX( x ) {
		 this.cursorx = x;
	 }

	 cursorUp() {
		 this.cursory--;
		 if( this.cursory<0 ) { this.cursory = 0;}
	 }

	 cursorDown() {
		 this.cursory++;
		 if( this.cursory>24 ) { this.cursory = 24;}
	 }

	 cursorLeft() {
		 this.cursorx--;
		 if( this.cursorx<0 ) { this.cursorx = 0;}
	 }

	 cursorRight() {
		 this.cursorx++;
		 if( this.cursorx>39 ) { this.cursorx = 39;}
	 }

	 cursorHome() {
		 this.cursorx=0;
		 this.cursory=0;
	 }

	 writePetsciiChar( c ) {
		 var index = c.charCodeAt(0);
		 if( index < 0 || index >255) { index = 0;}

		 var buf = this.buffer;
  		if( index > -1 ) {
 			buf[this.cursory][this.cursorx][2] = true;
 			buf[this.cursory][this.cursorx][1] = this.col;
 			buf[this.cursory][this.cursorx][0] = index;
  		}
 		this.cursorx++;
 		if(this.cursorx > 39) {
 			this.cursorx = 0;
 			this.nextLine();

 		}

	 }


	 writeCharRev( c ) {
		var index = (this._mapASCII2Screen( c ) + 128) % 256;

 		var buf = this.buffer;
  		if( index > -1 ) {
 			buf[this.cursory][this.cursorx][2] = true;
 			buf[this.cursory][this.cursorx][1] = this.col;
 			buf[this.cursory][this.cursorx][0] = index;
  		}
 		this.cursorx++;
 		if(this.cursorx > 39) {
 			this.cursorx = 0;
 			this.nextLine();
 		}
	 }

	 writeChar(  c ) {

    var index = this._mapASCII2Screen( c );

		var buf = this.buffer;
 		if( index > -1 ) {
			buf[this.cursory][this.cursorx][2] = true;
			buf[this.cursory][this.cursorx][1] = this.col;
			buf[this.cursory][this.cursorx][0] = index;
 		}
		this.cursorx++;
		if(this.cursorx > 39) {
			this.cursorx = 0;
			this.nextLine();
		}
   }


	 deleteChar() {
    var index = 32;
		var buf = this.buffer;

		this.cursorx--;
		if(this.cursorx <0 ) {
			this.cursorx = 39;

			this.cursory--;
			if(this.cursory <0 ) {
				this.cursory = 0;
				this.cursorx = 0;
			}

		}

		buf[this.cursory][this.cursorx][2] = true;
		buf[this.cursory][this.cursorx][0] = index;

   }


	 getCurrentLine() {
		 var line;
		 var buf = this.buffer;

		 line = "";

		 for( var x=0; x<39; x++) {
			 var c=this.backmap[ buf[this.cursory][x][0] ];
			 if( !c ) { c=" "};
			 //console.log("Csrc: '"+buf[this.cursory][x][0]+"'");
			 //console.log("C: '"+c.charCodeAt(0)+"'");
			 line = line + c;
		 }
		 return line;
	 }



	 writeString( str, newLine ) {
		 for (var i = 0; i < str.length; i++) {
				 this.writeChar( str.charAt(i) );
		 }
		 if(newLine) {
			 this.nextLine();
		 }
	 }

	 _mapASCII2Screen( c0 ) {

     var c = c0.toLowerCase();

     var map = this.map;
     var index;

     index = map [ c ];
     if( index == undefined ) {
 			if( c == ' ' ) {
 				return -1;
 			}
       index = 49;
     }

     return  index;
   }

	 _renderDirectChrMono( x, y, c0, col0) {

     var fid = this.fontImageData[0];
     var fidW = this.fontImageData[1];
     var fidH = this.fontImageData[2];
     var iDta = this.iDta;
     var srcPixWidth = fidW;
     var pixWidthM4 = this.iwidth * 4;

     var fgCol = this.colors[ col0 ];
     var bgCol = this.colors[ this.bgcol ];

     var c=c0;

     var row = Math.floor( c / 16 );
     var colmn = c % 16;

     var xs0 = colmn * 8;
     var ys= srcPixWidth * row * 8;
     var xd0 = x*4;
     var yd= pixWidthM4 * y;

     for( var yC = 0; yC<8; yC++) {
       var xs = xs0;
       var xd = xd0;

       for( var xC = 0; xC<8; xC++) {

         var col = bgCol;

         if (fid[ xs + ys ] ) {
             col = fgCol;
         }

         var dBase = xd + yd;

         iDta[ dBase + 0 ] = col.r;
         iDta[ dBase + 1 ] = col.g;
         iDta[ dBase + 2 ] = col.b;
         iDta[ dBase + 3 ] = 255;

         xs+=1;
         xd+=4;
       }
       ys += srcPixWidth;
       yd += pixWidthM4;
     }

   }

   _renderDirectChrMulti( x, y, c0, col0) {

     var fid = this.fontImageData[0];
     var fidW = this.fontImageData[1];
     var fidH = this.fontImageData[2];
     var iDta = this.iDta;
     var srcPixWidth = fidW;
     var pixWidthM4 = this.iwidth * 4;

		 var fgCol = this.colors[ col0 ];
     var bgCol = this.colors[ this.bgcol ];
		 var mcCol1 = this.colors[ this.mcol1 ];
		 var mcCol2 = this.colors[ this.mcol2 ];


     var cols = [];
     cols[0] = bgCol; //bg color
     cols[1] = mcCol1; //multi color 1
     cols[2] = mcCol2; //multi color 2
     cols[3] = fgCol;

     var c=c0;

     var row = Math.floor( c / 16 );
     var colmn = c % 16;

     var xs0 = colmn * 8;
     var ys= srcPixWidth * row * 8;
     var xd0 = x*4;
     var yd= pixWidthM4 * y;

     for( var yC = 0; yC<8; yC++) {
       var xs = xs0;
       var xd = xd0;

       for( var xC = 0; xC<8; xC+=2) {

         //console.log("xs,ys=",xs,ys);

         var pVal0 = (fid[ xs + ys     ]    );
         var pVal1 = (fid[ xs + 1 + ys ]*2  );
         var pVal = pVal0 + pVal1;

         //console.log(pVal);
         var col = cols[ pVal ];
         var dBase = xd + yd;

         if( col === undefined ) {
           console.log("Ooopsie");
         }

         iDta[ dBase + 0 ] = col.r;
         iDta[ dBase + 1 ] = col.g;
         iDta[ dBase + 2 ] = col.b;
         iDta[ dBase + 3 ] = 255;
         iDta[ dBase + 4 ] = col.r;
         iDta[ dBase + 5 ] = col.g;
         iDta[ dBase + 6 ] = col.b;
         iDta[ dBase + 7 ] = 255;

         xs+=2;
         xd+=8;
       }
       ys += srcPixWidth;
       yd += pixWidthM4;
     }

   }

	 renderChar(x, y, c, col0) {
		 var col = col0 % 16;

     this._renderDirectChrMono( x, y, c, col );
	 }

	 renderCharMC(x, y, c, col0) {
		 var col = col0 % 16;
     if( col > 7 ) {
       this._renderDirectChrMulti( x, y, c, col0 % 8);
     }
     else {
       this._renderDirectChrMono( x, y, c, col0 );
     }
	 }


	 _htmlColor( c ) {
		  return 'rgba('+c.r+','+c.g+','+c.b+',1)';
	 }


	 renderDisplay( ) {

		 this._intVpokesProcess();

		 if( this.bcolLast != this.bcol ) {

			 this._updateBorder();
		 }

		 this._renderBuffer();
		 this._updateDisplay();
	 }

	 _updateBorder( ) {
		 var dw = this.FULLWIDTH;
 		 var dh = this.FULLHEIGHT;
		 var dCtx = this.rcontext;
		 dCtx.fillStyle = this._htmlColor( this.colors[ this.bcol ] );
		 dCtx.fillRect(
			 0,0,
			 dw,
			 dh
		 );
	 }

   _updateDisplay( ) {

		var sCvs = this.bufcanvas;
		var dCtx = this.rcontext;

 		var w = 320;
 		var h = 200;
		var dw = this.WIDTH;
		var dh = this.HEIGHT;
		var b = this.border;

		dCtx.drawImage( sCvs, b.w, b.h, dw, dh);
	 }

	 _renderBackGround() {
		 var ctx = this.context;
		 var cvs = this.canvas;

		 ctx.fillStyle = this._htmlColor( this.colors[ this.bgcol ] );
		 ctx.fillRect(
			 0,0,
			 cvs.width,
			 cvs.height
		 );
	 }

	 _renderBuffer() {
		 var buf = this.buffer;
		 var ctx = this.context;
		 var bufctx = this.bufcontext;

		 //ctx.fillStyle = this._htmlColor( this.colors[ this.bgcol ] );

		 this.renderChr = this.renderChar;
		 if( this.multiColor ) {
			 this.renderChr = this.renderCharMC;
		 }

		 if( this.bgcolLast != this.bgcol
		 			|| this.mcol1Last != this.mcol1
					|| this.mcol2Last != this.mcol2
					|| this.multiColorLast != this.multiColor
				) {
			 for( var y=0; y<25; y++) {
			 	for( var x=0; x<40; x++) {

							buf[y][x][2] = false;
						 	this.renderChr(x*8, y*8, buf[y][x][0], buf[y][x][1] );

			 	}
			 }
			 this.bgcolLast = this.bgcol;
		 }
		 else {
			 for( var y=0; y<25; y++) {
			 	for( var x=0; x<40; x++) {
					if( buf[y][x][2] ) {
							buf[y][x][2] = false;
						 this.renderChr(x*8, y*8, buf[y][x][0], buf[y][x][1] );
					}
			 	}
			 }
		 }

		 ctx.putImageData(this.iImgDta, 0, 0);
		 bufctx.drawImage( this.canvas, 0, 0);

		 for( var i = 0; i < this.sprites.length; i++ ) {
			 var sp = this.sprites[ i ];
				 if( sp.enabled ) {

					//console.log( "Draw sprite " + i,sp.x,sp.y);
				 	bufctx.drawImage( sp.canvas, sp.x-24, sp.y-21 );
			 }
		 }
	 }

	 _renderBuffer__old() {
		 var buf = this.buffer;
		 var ctx = this.context;
		 var bufctx = this.bufcontext;

		 ctx.fillStyle = this._htmlColor( this.colors[ this.bgcol ] );

		 if( this.bgcolLast != this.bgcol ) {
			 for( var y=0; y<25; y++) {
			 	for( var x=0; x<40; x++) {

							buf[y][x][2] = false;
							ctx.fillRect(
				 			 x*8, y*8,
				 			 8,8
				 		 );
						 this.renderChar(x*8, y*8, buf[y][x][0], buf[y][x][1] );

			 	}
			 }
			 this.bgcolLast = this.bgcol;
		 }
		 else {
			 for( var y=0; y<25; y++) {
			 	for( var x=0; x<40; x++) {
					if( buf[y][x][2] ) {
							buf[y][x][2] = false;
							ctx.fillRect(
				 			 x*8, y*8,
				 			 8,8
				 		 );
						 this.renderChar(x*8, y*8, buf[y][x][0], buf[y][x][1] );
					}
			 	}
			 }
		 }
		 bufctx.drawImage( this.canvas, 0, 0);

		 for( var i = 0; i < this.sprites.length; i++ ) {
			 var sp = this.sprites[ i ];
				 if( sp.enabled ) {

					//console.log( "Draw sprite " + i,sp.x,sp.y);
				 	bufctx.drawImage( sp.canvas, sp.x-24, sp.y-21 );
			 }
		 }
	 }

   _prepColor( img, col ) {

 			var canvas = document.createElement('canvas');
 			var context = canvas.getContext('2d');

      var w = img.width;
      var h = img.height;

      canvas.width  = w;
      canvas.height = h * 2;

      context.drawImage( img, 0, 0 );
			context.drawImage( img, 0, h );
      var imgdata = context.getImageData(0, 0, w, h*2);
      var dd  = imgdata.data;

      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var offset = (x  + ( y * w )) * 4;

          if( dd[ offset ] != 0 && dd[ offset + 1 ] != 0 && dd[ offset + 2 ] != 0 ) {
            dd[ offset ] = col.r;
            dd[ offset + 1] = col.g;
            dd[ offset + 2] = col.b;
          }
        }
      }

			for ( ; y < (h*2); y++) {
        for (var x = 0; x < w; x++) {
          var offset = (x  + ( y * w )) * 4;


          if( dd[ offset ] != 0 && dd[ offset + 1 ] != 0 && dd[ offset + 2 ] != 0 ) {

						dd[ offset ] = 0;
            dd[ offset + 1] = 0;
            dd[ offset + 2] = 0;
          }
					else {
						dd[ offset ] = col.r;
            dd[ offset + 1] = col.g;
            dd[ offset + 2] = col.b;
					}
        }
      }

      context.putImageData( imgdata, 0, 0);
      return canvas;
   }

}
