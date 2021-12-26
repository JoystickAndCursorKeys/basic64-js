


class C64Screen {

	 constructor( rcanvasid, c64path, onload, onloaddata  ) {

		  var __this = this;

			this._setColors();

		  var font = new Image();
		  this.characterSetImage = font;
		  this.onload = onload;
		  this.onloaddata = onloaddata;

 		  this.vic = new Uint8Array(48);
			this.vicUsed = [];

			for( var i=0; i<47; i++) {
				this.vicUsed.push(false);
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
			this.bufcontext.imageSmoothingEnabled= false;
			this.bufcanvas.width = this.iwidth;
			this.bufcanvas.height = this.iheight;


			this.border = {
				w: 128,
				h: 64
			}

			this.WIDTH = 320*2.5;
			this.HEIGHT = 200*2.5;

			this.FULLWIDTH = this.WIDTH + this.border.w * 2;
			this.FULLHEIGHT = this.HEIGHT + this.border.h * 2;

			this.rcanvas.width=this.FULLWIDTH ;
      this.rcanvas.height=this.FULLHEIGHT;


			this.rcanvas.imageSmoothingEnabled= false;
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
			this.screenRefresh = false;

			this.spritemcol1 = 5;
			this.spritemcol1Last = 5;
			this.spritemcol2 = 7;
			this.spritemcol2Last = 7;

			this.multiColor = false;
			this.multiColorLast = false;

			this.useHires = false;
			this.useHiresLast = false;

			this.memory = new Uint8Array( 256 * 256 ); //64 KB, we're not using all
			this.videoRam = 12288;
			this.videoBMRam = 0;
			this.useRomCharMem = true;
			this.visibleRomCharMem = false;

			//"randomize" memory, simulate look and feel when poking in basic
			for( var i=0; i<256*256; i++) {
				this.memory[ i ] = 0;
				if( Math.random() >.9 ) {
					this.memory[ i ] = Math.floor(Math.random() * 255);
				}
			}

   }

	 getMemory() {
		 return this.memory;
	 }

	 setVicRegisters( regs ) {

		 for( var i=0; i<47; i++) {
			 this.vic[ i ] = regs[ i ];
			 this.vicUsed.push( i );
		 }
	 }

	 getCopyVicRegisters() {
		 var copy = [];
		 for( var i=0; i<47; i++) {
			 copy.push( this.vic[i] );
		 }
		 return copy;
	 }

	 getCopyScreen() {
		 var rows = [];

		 for( var y=0; y<25; y++) {
			 var row0 = this.txScBuf[ y ];
			 var row = [];

			 for( var x=0; x<40; x++) {
				 row[ x ] = row0[ x ];
			 }

			 rows[ y ] = row;
		 }

		 return rows;
	 }

	 setScreen( rows ) {

		 for( var y=0; y<25; y++) {
			 var row = rows[ y ];
			 var newRow = [];

			 for( var x=0; x<40; x++) {
				 newRow[ x ] = row[ x ];
				 newRow[ x ][2] = true;
			 }
			 this.txScBuf[ y ] = newRow;
		 }
	 }

	 getCursorPos() {
		 return [ this.cursorx, this.cursory ];
	 }

	 getState() {
		 var cursor = {
			 col: this.col,
			 cx: this.cursorx,
			 cy: this.cursory
		 };
		 var state = {
			 vicRegisters: this.getCopyVicRegisters(),
			 screen: this.getCopyScreen(),
			 cursor: cursor
		 }

		 return state;
	 }

	 setState( state ) {
		 this.setVicRegisters( state.vicRegisters );
		 this.setScreen( state.screen );

		 this.col = state.cursor.col;
		 this.cursorx = state.cursor.cx;
		 this.cursory = state.cursor.cy;
	 }

	 setCharRomVisible( x ) {
		 this.visibleRomCharMem = x;
	 }

	 getCharRomVisible() {
		 return this.visibleRomCharMem;
	 }

	 _initSpriteArrays() {

		 this.sprites = [];
		 for( var i=0; i<8; i++ ) {

			 this.sprites[ i ] = new Object();
			 var sp = this.sprites[ i ];
			 sp.x = 0;
			 sp.y = 0;
			 sp.enabled = false;
			 sp.fat = false;
			 sp.long = false;
			 sp.addr = 0;
			 sp.col = 1;
			 sp.multiCol = false;

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
		 map['A'] = 1;
		 map['B'] = 2;
		 map['C'] = 3;
		 map['D'] = 4;
		 map['E'] = 5;
		 map['F'] = 6;
		 map['G'] = 7;
		 map['H'] = 8;
		 map['I'] = 9;
		 map['J'] = 10;
		 map['K'] = 11;
		 map['L'] = 12;
		 map['M'] = 13;
		 map['N'] = 14;
		 map['O'] = 15;
		 map['P'] = 16;
		 map['Q'] = 17;
		 map['R'] = 18;
		 map['S'] = 19;
		 map['T'] = 20;
		 map['U'] = 21;
		 map['V'] = 22;
		 map['W'] = 23;
		 map['X'] = 24;
		 map['Y'] = 25;
		 map['Z'] = 26;

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
			 else if( nr == 53285)  {
				 this.setSpriteMColor1( v % 16 );
			 }
			 else if( nr == 53286)  {
				 this.setSpriteMColor1( v % 16 );
			 }
			 else if( nr == 53269)  {
				 var bits = this._getByteBits( v );
				 var spr = this.sprites;
				 for( var j=0; j<8; j++) {
					 spr[ j ].enabled = bits[j];
					 this.screenRefresh = true;
					 //console.log("Sprite[" +j+"].enable=" + bits[j])
				 }
			 }
			 else if( nr == 53270)  {
				 var bits = this._getByteBits( v );
				 this.multiColor = bits[4];

			 }
			 else if( nr == 53265)  {
				 // Bit 5 is bitmap mode or not
				 // POKE 53265,PEEK(53265)OR32
				 // this.useHires

				 this.useHires = (v & 32) > 0; //bit 5

				 //console.log("poke 53265 -> " + v);
				 //console.log("this.useHires -> " + this.useHires);


			 }
			 else if( nr == 53272)  { /*$D018*/
				 //http://www.devili.iki.fi/Computers/Commodore/C64/Programmers_Reference/Chapter_3/page_104.html

				 var bits = this._getByteBits( v );
				 var b1,b2,b3, value;
				 b1 = bits[1];
				 b2 = bits[2];
				 b3 = bits[3];

				 value = 0;


				 if( b1 ) { value += 2; }
				 if( b2 ) { value += 4; }
				 if( b3 ) { value += 8; }

				 if( value == 8 ) {
					this.useRomCharMem = false;
					this.videoRam = 8192;
				 }
				 else if( value == 12 ) {
					 this.useRomCharMem = false;
					 this.videoRam = 12288;
				 } else {
					 this.useRomCharMem = true;
				 }

				 if( b3 ) {
					this.videoBMRam = 8192;
				 } else {
					 this.videoBMRam = 0;
				 }

			 }
			 else if(nr == 53276) {
				 var bits = this._getByteBits( v );
				 var spr = this.sprites;
				 for( var j=0; j<8; j++) {
					 spr[ j ].multiCol = bits[j];
					 //console.log("Sprite[" +j+"].multiCol=" + bits[j])
				 }
				 this.screenRefresh = true;
			 }
			 else if(nr == 53277) {
				 var bits = this._getByteBits( v );
				 var spr = this.sprites;
				 for( var j=0; j<8; j++) {
					 spr[ j ].fat = bits[j];
					 //console.log("Sprite[" +j+"].fat=" + bits[j])
				 }
				 this.screenRefresh = true;
			 }
			 else if(nr == 53271) {
				 var bits = this._getByteBits( v );
				 var spr = this.sprites;
				 for( var j=0; j<8; j++) {
					 spr[ j ].long = bits[j];
					 //console.log("Sprite[" +j+"].long=" + bits[j])
				 }
				 this.screenRefresh = true;
			 }
			 else if( nr>53247 && nr < 53264 ) { //sprite pos
				var sprno = Math.floor((nr -53248) / 2);
				var xcoord = !(nr % 2);
				//console.log("sprite #" + sprno);
				//console.log("is xcoord " + xcoord);
				//console.log("coord #" + v);

				if( xcoord ) {
					this.spriteXPos( sprno, v );
				}
				else {
					this.spriteYPos( sprno, v );
				}
				this.screenRefresh = true;
			 }
			 else if( nr>53286 && nr < 53295 ) {
				var sprno = nr - 53287;
				//console.log("sprite #" + sprno);
				//console.log("col " + v);

				this.spriteCol( sprno, v % 16);

			 }
			 this.screenRefresh = true;
		 }

		 this.vicUsed = [];
	 }

	 poke( a, b ) {
		 this.memory[a] = b % 256;

		 if( this.useHires ) {

			 if( a >= this.videoBMRam && a< this.videoBMRam + 8192 ) {

				 var buf  = this.txScBuf;
				 var addr = Math.floor  (( a-this.videoBMRam ) / 8 );
				 var y = Math.floor( (addr / 40) );
				 var x = addr % 40;
				 buf[y][x][2] = true;
			 }
		 }
		 else { //videoRam should point to ScBuffer, does it ever?
			 if( a >= this.videoRam && a< (this.videoRam + (256*8)) ) {
				 this.screenRefresh = true;
			 }
		 }

		 /*
		 this.useHires = false;
		 this.useHiresLast = false;

		 this.memory = new Uint8Array( 256 * 256 ); //64 KB, we're not using all
		 this.videoRam = 12288;
		 this.hiresMem = 8192;
		 this.useRomCharMem = true;
		 this.visibleRomCharMem = false;
		 */

	 }

	 peek( a ) {
		 return this.memory[a];
	 }

	 charRomPeek( a ) {
		 return this.fontImageRom[a];
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


	 preparefontImageRom() {

     var img1 = this.characterSetImage;
     var img2 = document.createElement("canvas");

     var ctx2 = img2.getContext("2d");

     img2.width = img1.width;
     img2.height = img1.height;
     ctx2.drawImage(img1, 0, 0);

     var imgdata = ctx2.getImageData(0, 0, img1.width, img1.height );
     var sd = imgdata.data;

     var pixelsCount = img1.width * img1.height ;
     var pixelsCountD8 = (img1.width * img1.height) / 8 ;
     var len = pixelsCount * 4;
     var data = new Uint8Array( 256 * 8 );
     var srcBytesWidth = img1.width*4;

     for (var i = 0; i < pixelsCountD8; i ++ ) {
       data[i] = 0;
     }

     var masks = [
       0b00000001,0b00000010,0b00000100,0b00001000,
       0b00010000,0b00100000,0b01000000,0b10000000
     ];

     var di = 0;
     for (var charIx = 0; charIx < 128; charIx ++) {
       di = charIx * 8;

       var srcAddressRow = Math.floor(charIx / 16);
       var srcAddressCol = charIx % 16;
       var srcAddressBase = ((srcAddressCol * 8 * 4) + ( srcAddressRow * srcBytesWidth * 8));

       if( charIx == 16) {
         var tmp = 1001;
       }

       for (var pixRow = 0; pixRow < 8; pixRow ++) {

           for (var pixColumn = 0; pixColumn < 8; pixColumn ++) {
             var srcAddress = srcAddressBase
                 + ( (7-pixColumn) * 4 )
                 + ( pixRow * srcBytesWidth );


             if (sd[ srcAddress ]) {
               data[ di ] = data[ di ] | masks[ pixColumn ];
               data[ di + pixelsCountD8 ] = data[ di + pixelsCountD8 ] | masks[ pixColumn ];
             }
         }
         data[ di + pixelsCountD8 ] = 255 - data[ di + pixelsCountD8 ];
         di++;
       }
     }

     return data;
   }


	 _postLoadFontImage() {

     console.log("_postLoadFontImage reached");

		 //this.fontImageData = this._prepareFontImageData(this.srcImage);
		 this.fontImageRom = this.preparefontImageRom(this.srcImage);


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


 	 setSpriteMColor1( c ) {
 		 this.spritemcol1 = c;
 	 }

	 setSpriteMColor2( c ) {
 		 this.spritemcol2 = c;
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

 	 }

	 getRenderSize() {
		 return [ this.rcanvas.width, this.rcanvas.height ];
	 }

	 clearScreen() {
		this.txScBuf = [];
		this.cursorx = 0;
		this.cursory = 0;

	 	for( var y=0; y<25; y++) {
			var row = [];
	 		for( var x=0; x<40; x++) {
				row[ x ] = [32,14,true];
	 		}
	 		this.txScBuf[ y ] = row;
	 	}
	 }

	 scrollUp() {

		 var buf = this.txScBuf;

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


	 getChar( x, y, index ) {

		var buf = this.txScBuf;
		var chr = buf[y][x];

		return chr[0];

	 }

	 getCharCol( x, y, index ) {

		var buf = this.txScBuf;
		var chr = buf[y][x];

		return chr[1];

	 }

	 setChar( x, y, index ) {

		var buf = this.txScBuf;
		var chr = buf[y][x];

		chr[2] = true;
		chr[0] = index;

	 }

	 setCharCol( x, y, index ) {

		var buf = this.txScBuf;
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
		var buf = this.txScBuf;
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
		var buf = this.txScBuf;
 		if( this.cursorOn ) {
 			this.cursorOn = false;
 			var index = 32;
 			buf[this.cursory][this.cursorx][2] = true;
 			buf[this.cursory][this.cursorx][1] = this.col;
 			buf[this.cursory][this.cursorx][0] = this.cursorChar;
 		}
   }


	 setCursorY( y ) {
		 this.cursory = y;
	 }

	 setCursorX( x ) {
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

		 var buf = this.txScBuf;
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

 		var buf = this.txScBuf;
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

		var buf = this.txScBuf;
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
		var buf = this.txScBuf;

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
		 var buf = this.txScBuf;

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

	 _mapASCII2Screen( c ) {
//https://sta.c64.org/cbm64pettoscr.html
		 var c0 = c.charCodeAt(0);
		 if( c0 < 32) { return c0+128; }
		 else if( c0 >= 32 && c0<64) { return c0; }
		 else if( c0 >= 64 && c0<96) { return c0-64; }
		 else if( c0 >= 96 && c0<128) { return c0-32; }
		 else if( c0 >= 128 && c0<160) { return c0+64; }
		 else if( c0 >= 160 && c0<192) { return c0-64; }
		 else if( c0 >= 192 && c0<224) { return c0-128; }
		 else if( c0 >= 224 && c0<255) { return c0-128; }
		 else if( c0 == 255 ) { return 94; }

/*
     var c = c0; //.toLowerCase();

     var map = this.map;
     var index;

     index = map [ c ];
     if( index == undefined ) {
 			if( c == ' ' ) {
 				return -1;
 			}
       index = 63;
     }

     return  index;
		 */
   }

	 setSpriteAddress( no, addr ) {
		 this.sprites[no].addr = addr;
	 }


	 renderSprite( no, x, y) {


		 var sprite = this.sprites[ no ];
		 if( sprite.multiCol ) {
			 	if(sprite.fat) {
						this._renderDirectSprMultiFat( no, x, y, sprite.long);
				}
				else {
						this._renderDirectSprMulti( no, x, y, sprite.long);
				}

		 }
		 else {
			 if(sprite.fat) {
					 this._renderDirectSprMonoFat( no, x, y, sprite.long);
			 }
			 else {
					 this._renderDirectSprMono( no, x, y, sprite.long);
			 }
		 }


		 //mono,w
		 //mono,W
		 //multi,w
		 //multi,W

	 }


	 _renderDirectSprMulti( no, x, y, long) {
		 //https://retro64.altervista.org/blog/programming-sprites-the-commodore-64-simple-tutorial-using-basic-v2/

		 var fid = this.memory;
		 var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;
		 var sprite = this.sprites[ no ];
		 var dataPtr = sprite.addr;

		 var fgCol = this.colors[ sprite.col ];
		 var mcCol1 = this.colors[ this.spritemcol1 ];
		 var mcCol2 = this.colors[ this.spritemcol2 ];

		 var xd0 = x << 2 /* multiply 4, 4 bytes per pixel */;
     var yd= pixWidthM4 * y;
		 var yd2= pixWidthM4 * (y+1);


		 for( var yC = 0; yC<21; yC++) {

			 var xd = xd0;
			 for( var xByteCount=0; xByteCount < 3; xByteCount++) {

				 var byte = fid[ dataPtr ];
				 var mask = 0b10000000;
			 	 var mask2 = 0b01000000;

				 if(long) {

					 for( var xC = 0; xC<4; xC++) {

							var col = null;
							var val = 0;

							if ( (byte & mask ) > 0 ) {
							  val=1;
							}
							if ( (byte & mask2 ) > 0 ) {
							  val+=2;
							}

							switch (val){
							   case 1:
							       col = mcCol1;
							       break;
								 case 2:
							       col = mcCol2;
							       break;
								 case 3:
							       col = fgCol;
							       break;
								 default:

							}

							var dBase = xd + yd;
							var dBase2 = xd + yd2;

							if ( col!=null ) {

								 iDta[ dBase + 0 ] = col.r;
							   iDta[ dBase + 1 ] = col.g;
							   iDta[ dBase + 2 ] = col.b;
							   iDta[ dBase + 3 ] = 255;

								 iDta[ dBase + 4 ] = col.r;
							   iDta[ dBase + 5 ] = col.g;
							   iDta[ dBase + 6 ] = col.b;
							   iDta[ dBase + 7 ] = 255;

								 iDta[ dBase2 + 0 ] = col.r;
							   iDta[ dBase2 + 1 ] = col.g;
							   iDta[ dBase2 + 2 ] = col.b;
							   iDta[ dBase2 + 3 ] = 255;

								 iDta[ dBase2 + 4 ] = col.r;
							   iDta[ dBase2 + 5 ] = col.g;
							   iDta[ dBase2 + 6 ] = col.b;
							   iDta[ dBase2 + 7 ] = 255;

							}


							mask = mask >> 2;
							mask2 = mask2 >> 2;
							xd+=8;
					 }
			 	}
				else {
					for( var xC = 0; xC<4; xC++) {

						 var col = null;
						 var val = 0;

						 if ( (byte & mask ) > 0 ) {
							 val=1;
						 }
						 if ( (byte & mask2 ) > 0 ) {
							 val+=2;
						 }

						 switch (val){
								case 1:
										col = mcCol1;
										break;
								case 2:
										col = mcCol2;
										break;
								case 3:
										col = fgCol;
										break;
								default:

						 }

						 var dBase = xd + yd;

						 if ( col!=null ) {

								iDta[ dBase + 0 ] = col.r;
								iDta[ dBase + 1 ] = col.g;
								iDta[ dBase + 2 ] = col.b;
								iDta[ dBase + 3 ] = 255;

								iDta[ dBase + 4 ] = col.r;
								iDta[ dBase + 5 ] = col.g;
								iDta[ dBase + 6 ] = col.b;
								iDta[ dBase + 7 ] = 255;

						 }


						 mask = mask >> 2;
						 mask2 = mask2 >> 2;
						 xd+=8;
					}
				}

				 dataPtr++;
			 }


			 yd += pixWidthM4;
			 if( long ) {
				 yd += pixWidthM4;
				 yd2 += pixWidthM4;
				 yd2 += pixWidthM4;
			 }
		 }

	 }

	 _renderDirectSprMultiFat( no, x, y, long) {
		 //https://retro64.altervista.org/blog/programming-sprites-the-commodore-64-simple-tutorial-using-basic-v2/

		 var fid = this.memory;
		 var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;
		 var sprite = this.sprites[ no ];
		 var dataPtr = sprite.addr;

		 var fgCol = this.colors[ sprite.col ];
		 var mcCol1 = this.colors[ this.spritemcol1 ];
		 var mcCol2 = this.colors[ this.spritemcol2 ];

		 var xd0 = x << 2 /* multiply 4, 4 bytes per pixel */;
     var yd= pixWidthM4 * y;
		 var yd2= pixWidthM4 * (y+1);


		 for( var yC = 0; yC<21; yC++) {

			 var xd = xd0;
			 for( var xByteCount=0; xByteCount < 3; xByteCount++) {

				 var byte = fid[ dataPtr ];
				 var mask = 0b10000000;
			 	 var mask2 = 0b01000000;

				 if( long ) {
					 for( var xC = 0; xC<4; xC++) {

							var col = null;
							var val = 0;

							if ( (byte & mask ) > 0 ) {
							  val=1;
							}
							if ( (byte & mask2 ) > 0 ) {
							  val+=2;
							}

							switch (val){
							   case 1:
							       col = mcCol1;
							       break;
								 case 2:
							       col = mcCol2;
							       break;
								 case 3:
							       col = fgCol;
							       break;
								 default:

							}

							var dBase = xd + yd;
							var dBase2 = xd + yd2;

							if ( col!=null ) {

								 iDta[ dBase + 0 ] = col.r;
							   iDta[ dBase + 1 ] = col.g;
							   iDta[ dBase + 2 ] = col.b;
							   iDta[ dBase + 3 ] = 255;

								 iDta[ dBase + 4 ] = col.r;
							   iDta[ dBase + 5 ] = col.g;
							   iDta[ dBase + 6 ] = col.b;
							   iDta[ dBase + 7 ] = 255;

								 iDta[ dBase + 8 ] = col.r;
							   iDta[ dBase + 9 ] = col.g;
							   iDta[ dBase + 10 ] = col.b;
							   iDta[ dBase + 11] = 255;

								 iDta[ dBase + 12] = col.r;
							   iDta[ dBase + 13] = col.g;
							   iDta[ dBase + 14] = col.b;
							   iDta[ dBase + 15] = 255;

								 iDta[ dBase2 + 0 ] = col.r;
							   iDta[ dBase2 + 1 ] = col.g;
							   iDta[ dBase2 + 2 ] = col.b;
							   iDta[ dBase2 + 3 ] = 255;

								 iDta[ dBase2 + 4 ] = col.r;
							   iDta[ dBase2 + 5 ] = col.g;
							   iDta[ dBase2 + 6 ] = col.b;
							   iDta[ dBase2 + 7 ] = 255;

								 iDta[ dBase2 + 8 ] = col.r;
							   iDta[ dBase2 + 9 ] = col.g;
							   iDta[ dBase2 + 10 ] = col.b;
							   iDta[ dBase2 + 11] = 255;

								 iDta[ dBase2 + 12] = col.r;
							   iDta[ dBase2 + 13] = col.g;
							   iDta[ dBase2 + 14] = col.b;
							   iDta[ dBase2 + 15] = 255;

							}


							mask = mask >> 2;
							mask2 = mask2 >> 2;
							xd+=16;
					 }
			 	 }
				 else {
					 for( var xC = 0; xC<4; xC++) {

							var col = null;
							var val = 0;

							if ( (byte & mask ) > 0 ) {
								val=1;
							}
							if ( (byte & mask2 ) > 0 ) {
								val+=2;
							}

							switch (val){
								 case 1:
										 col = mcCol1;
										 break;
								 case 2:
										 col = mcCol2;
										 break;
								 case 3:
										 col = fgCol;
										 break;
								 default:

							}

							var dBase = xd + yd;

							if ( col!=null ) {

								 iDta[ dBase + 0 ] = col.r;
								 iDta[ dBase + 1 ] = col.g;
								 iDta[ dBase + 2 ] = col.b;
								 iDta[ dBase + 3 ] = 255;

								 iDta[ dBase + 4 ] = col.r;
								 iDta[ dBase + 5 ] = col.g;
								 iDta[ dBase + 6 ] = col.b;
								 iDta[ dBase + 7 ] = 255;

								 iDta[ dBase + 8 ] = col.r;
								 iDta[ dBase + 9 ] = col.g;
								 iDta[ dBase + 10 ] = col.b;
								 iDta[ dBase + 11] = 255;

								 iDta[ dBase + 12] = col.r;
								 iDta[ dBase + 13] = col.g;
								 iDta[ dBase + 14] = col.b;
								 iDta[ dBase + 15] = 255;

							}


							mask = mask >> 2;
							mask2 = mask2 >> 2;
							xd+=16;
					 }
				 }

				 dataPtr++;
			 }


			 yd += pixWidthM4;
			 if( long ) {
				 yd += pixWidthM4;
				 yd2 += pixWidthM4;
				 yd2 += pixWidthM4;
			 }
		 }

	 }

	 _renderDirectSprMono( no, x, y, long ) {
		 //https://retro64.altervista.org/blog/programming-sprites-the-commodore-64-simple-tutorial-using-basic-v2/

		 var fid = this.memory;
		 var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;
		 var sprite = this.sprites[ no ];
		 var dataPtr = sprite.addr;

		 var fgCol = this.colors[ sprite.col ];

		 var xd0 = x << 2 /* multiply 4, 4 bytes per pixel */;
     var yd= pixWidthM4 * y;
		 var yd2= pixWidthM4 * (y+1);


		 for( var yC = 0; yC<21; yC++) {

			 var xd = xd0;
			 for( var xByteCount=0; xByteCount < 3; xByteCount++) {

				 var byte = fid[ dataPtr ];
				 var mask = 0b10000000;

				 if(long) {
					 for( var xC = 0; xC<8; xC++) {

		         var dBase = xd + yd;
						 var dBase2 = xd + yd2;

		         if ( (byte & mask ) > 0 ) {

								 iDta[ dBase + 0 ] = fgCol.r;
				         iDta[ dBase + 1 ] = fgCol.g;
				         iDta[ dBase + 2 ] = fgCol.b;
				         iDta[ dBase + 3 ] = 255;

								 iDta[ dBase2 + 0 ] = fgCol.r;
				         iDta[ dBase2 + 1 ] = fgCol.g;
				         iDta[ dBase2 + 2 ] = fgCol.b;
				         iDta[ dBase2 + 3 ] = 255;
		         }


						 mask = mask >> 1;
		         xd+=4;
					 }
				 }
				 else {
					 for( var xC = 0; xC<8; xC++) {

		         var dBase = xd + yd;

		         if ( (byte & mask ) > 0 ) {

								 iDta[ dBase + 0 ] = fgCol.r;
				         iDta[ dBase + 1 ] = fgCol.g;
				         iDta[ dBase + 2 ] = fgCol.b;
				         iDta[ dBase + 3 ] = 255;

		         }


						 mask = mask >> 1;
		         xd+=4;
					 }
				 }
				 dataPtr++;
			 }

			 yd += pixWidthM4;
			 if( long ) { yd += pixWidthM4; yd2 += pixWidthM4; yd2 += pixWidthM4;}
		 }

	 }


	 _renderDirectSprMonoFat( no, x, y, long ) {
		 //https://retro64.altervista.org/blog/programming-sprites-the-commodore-64-simple-tutorial-using-basic-v2/

		 var fid = this.memory;
		 var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;
		 var sprite = this.sprites[ no ];
		 var dataPtr = sprite.addr;

		 var fgCol = this.colors[ sprite.col ];

		 var xd0 = x << 2 /* multiply 4, 4 bytes per pixel */;
     var yd= pixWidthM4 * y;
		 var yd2= pixWidthM4 * (y + 1);


		 for( var yC = 0; yC<21; yC++) {

			 var xd = xd0;
			 for( var xByteCount=0; xByteCount < 3; xByteCount++) {

				 var byte = fid[ dataPtr ];
				 var mask = 0b10000000;

				 if( long ) {
					 for( var xC = 0; xC<8; xC++) {

		         var dBase = xd + yd;
						 var dBase2 = xd + yd2;

		         if ( (byte & mask ) > 0 ) {

								 iDta[ dBase + 0 ] = fgCol.r;
				         iDta[ dBase + 1 ] = fgCol.g;
				         iDta[ dBase + 2 ] = fgCol.b;
				         iDta[ dBase + 3 ] = 255;

								 iDta[ dBase + 4 ] = fgCol.r;
				         iDta[ dBase + 5 ] = fgCol.g;
				         iDta[ dBase + 6 ] = fgCol.b;
				         iDta[ dBase + 7 ] = 255;

								 iDta[ dBase2 + 0 ] = fgCol.r;
				         iDta[ dBase2 + 1 ] = fgCol.g;
				         iDta[ dBase2 + 2 ] = fgCol.b;
				         iDta[ dBase2 + 3 ] = 255;

								 iDta[ dBase2 + 4 ] = fgCol.r;
				         iDta[ dBase2 + 5 ] = fgCol.g;
				         iDta[ dBase2 + 6 ] = fgCol.b;
				         iDta[ dBase2 + 7 ] = 255;

		         }


						 mask = mask >> 1;
		         xd+=8;
					 }
				 }
				 else {
					 for( var xC = 0; xC<8; xC++) {

						 var dBase = xd + yd;

						 if ( (byte & mask ) > 0 ) {

								 iDta[ dBase + 0 ] = fgCol.r;
								 iDta[ dBase + 1 ] = fgCol.g;
								 iDta[ dBase + 2 ] = fgCol.b;
								 iDta[ dBase + 3 ] = 255;

								 iDta[ dBase + 4 ] = fgCol.r;
								 iDta[ dBase + 5 ] = fgCol.g;
								 iDta[ dBase + 6 ] = fgCol.b;
								 iDta[ dBase + 7 ] = 255;


						 }


						 mask = mask >> 1;
						 xd+=8;
					 }
				 }


				 dataPtr++;
			 }

			 yd += pixWidthM4;
			 if( long ) {
				 yd += pixWidthM4;
				 yd2 += pixWidthM4;
				 yd2 += pixWidthM4;
			 }
		 }

	 }

	 _renderDirectChrMultiHres( x, y, ch0, colRam, chRamLoCol, chRamHiCol) {

		var fid;
		var dataPtr;

		fid = this.memory;
		dataPtr = this.videoBMRam;

	 	var iDta = this.iDta;
	 	var pixWidthM4 = this.iwidth * 4;

		//( x, y, charIndex, colRam, chRamLoCol, chRamHiCol )
	 	var bgCol = this.colors[ this.bgcol ];
		var fgCol = this.colors[ colRam ];
	 	var mcCol1 = this.colors[ chRamLoCol ];
	 	var mcCol2 = this.colors[ chRamHiCol ];


	 	var ch=ch0;

	 	var row = ch >> 4 /* div 16*/ ;
	 	var column = ch % 16;

	 	var xd0 = x << 2 /* multiply 4 */;
	 	var yd= pixWidthM4 * y;

	 	var chM8 = dataPtr + (ch*8);

	 	for( var yC = 0; yC<8; yC++) {
	 		var xd = xd0;

	 		var byte = fid[ chM8 + yC ];
	 		var mask = 0b10000000;
	 		var mask2 = 0b01000000;

	 		for( var xC = 0; xC<4; xC+=1) { /*4 thick pixels */

	 			var col = bgCol;
	 			var val = 0;

	 			if ( (byte & mask ) > 0 ) {
	 					val=1;
	 			}
	 			if ( (byte & mask2 ) > 0 ) {
	 					val+=2;
	 			}

	 			switch (val){
	 					case 1:
	 							col = mcCol1;
	 							break;
	 					case 2:
	 							col = mcCol2;
	 							break;
	 					case 3:
	 							col = fgCol;
	 							break;
	 					default:

	 			 }

	 			var dBase = xd + yd;

	 			iDta[ dBase + 0 ] = col.r;
	 			iDta[ dBase + 1 ] = col.g;
	 			iDta[ dBase + 2 ] = col.b;
	 			iDta[ dBase + 3 ] = 255;

	 			iDta[ dBase + 4 ] = col.r;
	 			iDta[ dBase + 5 ] = col.g;
	 			iDta[ dBase + 6 ] = col.b;
	 			iDta[ dBase + 7 ] = 255;

	 			xd+=8;
	 			mask = mask >> 2;
	 			mask2 = mask2 >> 2;
	 		}
	 		yd += pixWidthM4;
	 	}

	 }

	 _renderDirectChrMono( x, y, ch0, col0, bgcol) {

		 // ch0 is character code
		 // col0 is color
/*
		 try  {
			this._renderDirectChrMono( x, y, c, col0 );
		}
		catch (e) {
			var tmp = 1;
		}
*/

     var fid;
		 var dataPtr;

		 if( this.useHires ) {
			 fid = this.memory;
	 		 dataPtr = this.videoBMRam;
		 }
		 else {
			 if( this.useRomCharMem ) {
				fid = this.fontImageRom;
				dataPtr = 0;
			 }
			 else {
				fid = this.memory;
				dataPtr = this.videoRam;
			 }
		 }

     var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;

     var fgCol = this.colors[ col0 ];
     var bgCol = this.colors[ bgcol ];

     var ch=ch0;

		 //calculate row + column nrs
     var row = ch >> 4 /* div 16*/;
     var column = ch % 16;


     var xd0 = x << 2 /* multiply 4, 4 bytes per pixel */;
     var yd= pixWidthM4 * y;

		 //BASE of source data -> chM8 = font data start offset  + char offset
     var chM8 = dataPtr + ch*8;

     for( var yC = 0; yC<8; yC++) {
       var xd = xd0;

       var byte = fid[ chM8 + yC ];
       var mask = 0b10000000;

       for( var xC = 0; xC<8; xC++) {

         var col = bgCol;

         if ( (byte & mask ) > 0 ) {
             col = fgCol;
         }

         var dBase = xd + yd;

         iDta[ dBase + 0 ] = col.r;
         iDta[ dBase + 1 ] = col.g;
         iDta[ dBase + 2 ] = col.b;
         iDta[ dBase + 3 ] = 255;

         xd+=4;
         mask = mask >> 1;
       }
       yd += pixWidthM4;
     }

   }

	 _renderDirectChrMulti( x, y, ch0, col0) {

     var fid = this.fontImageRom;
     var iDta = this.iDta;
     var pixWidthM4 = this.iwidth * 4;

     var fgCol = this.colors[ col0 ];
     var bgCol = this.colors[ this.bgcol ];
		 var mcCol1 = this.colors[ this.mcol1 ];
		 var mcCol2 = this.colors[ this.mcol2 ];

     var ch=ch0;

     var row = ch >> 4 /* div 16*/ ;
     var column = ch % 16;

     var xd0 = x << 2 /* multiply 4 */;
     var yd= pixWidthM4 * y;

     var chM8 = ch*8;

     for( var yC = 0; yC<8; yC++) {
       var xd = xd0;

       var byte = fid[ chM8 + yC ];
       var mask = 0b10000000;
			 var mask2 = 0b01000000;

       for( var xC = 0; xC<4; xC+=1) { /*4 thick pixels */

         var col = bgCol;
				 var val = 0;

         if ( (byte & mask ) > 0 ) {
             val=1;
         }
				 if ( (byte & mask2 ) > 0 ) {
             val+=2;
         }

				 switch (val){
				     case 1:
				         col = mcCol1;
				         break;
						 case 2:
				         col = mcCol2;
				         break;
						 case 3:
				         col = fgCol;
				         break;
						 default:

					}

         var dBase = xd + yd;

         iDta[ dBase + 0 ] = col.r;
         iDta[ dBase + 1 ] = col.g;
         iDta[ dBase + 2 ] = col.b;
         iDta[ dBase + 3 ] = 255;

				 iDta[ dBase + 4 ] = col.r;
         iDta[ dBase + 5 ] = col.g;
         iDta[ dBase + 6 ] = col.b;
         iDta[ dBase + 7 ] = 255;

         xd+=8;
         mask = mask >> 2;
				 mask2 = mask2 >> 2;
       }
       yd += pixWidthM4;
     }

   }


	 renderChar(x, y, c, col0, bgcol) {
		 var col = col0 % 16;

     this._renderDirectChrMono( x, y, c, col, this.bgcol );
	 }

	 renderCharHires(x, y, c, col0, dummy) {
		 var col = col0 % 16;
		 var bgcol = (col0 & 240) >> 4;

     this._renderDirectChrMono( x, y, c, col, bgcol );
	 }

	 renderCharHiresMC(x, y, charIndex, charMem, colMem) {

		 var chRamLoCol = charMem % 16;
		 var chRamHiCol = (charMem & 240) >> 4;
		 var colRam = colMem % 16;
     this._renderDirectChrMultiHres( x, y, charIndex, colRam, chRamLoCol, chRamHiCol );
	 }

	 renderCharMC(x, y, c, col0) {
		 var col = col0 % 16;
     if( col > 7 ) {
       this._renderDirectChrMulti( x, y, c, col0 % 8);
     }
     else {

       this._renderDirectChrMono( x, y, c, col0, bgcol );
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
		 var buf = this.txScBuf;
		 var ctx = this.context;
		 var bufctx = this.bufcontext;

		 //ctx.fillStyle = this._htmlColor( this.colors[ this.bgcol ] );

		 if( this.useHires ) {

			 this.renderChr = this.renderCharHires;
			 if( this.multiColor ) {
				 this.renderChr = this.renderCharHiresMC;
			 }

			 if( this.bgcolLast != this.bgcol
			 			|| this.mcol1Last != this.mcol1
						|| this.mcol2Last != this.mcol2
						|| this.multiColorLast != this.multiColor
						|| this.useHiresLast != this.useHires

					) {
				 for( var y=0; y<25; y++) {
				 	for( var x=0; x<40; x++) {

								var chr = (y*40+x);
								buf[y][x][2] = false;
							 	this.renderChr(x*8, y*8, chr, buf[y][x][0], buf[y][x][1] );

				 	}
				 }
				 this.bgcolLast = this.bgcol;
				 this.mcol1Last = this.mcol1;
				 this.mcol2Last = this.mcol2;
				 this.multiColorLast = this.multiColor;
				 this.useHiresLast = this.useHires;

			 }
			 else {

				 for( var y=0; y<25; y++) {
				 	for( var x=0; x<40; x++) {

						var chr = (y*40+x);

						if( buf[y][x][2] ) {
								buf[y][x][2] = false;
							 this.renderChr(x*8, y*8, chr, buf[y][x][0], buf[y][x][1] );
						}
				 	}
				 }
			 }
		 }
		 else {

			 this.renderChr = this.renderChar;
			 if( this.multiColor ) {
				 this.renderChr = this.renderCharMC;
			 }


			 if( this.bgcolLast != this.bgcol
			 			|| this.mcol1Last != this.mcol1
						|| this.mcol2Last != this.mcol2
						|| this.multiColorLast != this.multiColor
						|| this.useHiresLast != this.useHires
						|| this.screenRefresh
					) {
				 for( var y=0; y<25; y++) {
				 	for( var x=0; x<40; x++) {

								buf[y][x][2] = false;
							 	this.renderChr(x*8, y*8, buf[y][x][0], buf[y][x][1] );

				 	}
				 }
				 this.bgcolLast = this.bgcol;
				 this.mcol1Last = this.mcol1;
				 this.mcol2Last = this.mcol2;
				 this.multiColorLast = this.multiColor;
				 this.useHiresLast = this.useHires;
				 this.screenRefresh = false;
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
		 }

		 for( var i = this.sprites.length -1; i>=0; i-- ) {
			 var sp = this.sprites[ i ];
				 if( sp.enabled ) {

					//console.log( "Draw sprite " + i,sp.x,sp.y);
				 	//bufctx.drawImage( sp.canvas, sp.x-24, sp.y-21 );
					this.renderSprite( i, sp.x-24, sp.y-21 );
			 }
		 }

		 ctx.putImageData(this.iImgDta, 0, 0);

		 bufctx.drawImage( this.canvas, 0, 0);

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
