class BasicContext {

  constructor( _console ) {

    this.debugFlag = false;
    this.console = _console;
    this.menu = new Menu( _console, this  );
    this.menuFocus = false;
    this.borderChangedFlag = false;
    this.program = [];
    this.cursorCount = 0;
    this.runFlag = false;
    this.breakCycleFlag;
    this.inputFlag = false;
    this.listFlag = false;
    this.immersiveFlag = false;
    this.gosubReturn = [];
    this.nullTime = new Date().getTime();
    this.cursorCountMaxNormal = 15;
    this.cursorCountMaxTurbo = 7;
    this.cursorCountMax = this.cursorCountMaxNormal;

    this.turboMode = false;
    this.cmdCountPerCycleDefault = 5;
    this.cmdCountPerCycleTurbo = 1000;
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;

    var ctx = this.context;
    var c = this.console;
    this.commands = new BasicCommands( this );
    this.extendedcommands = new ExtendedCommands( this );
    this.errorHandler = new ErrorHandler();
    this.vars = [];
    this.functions = [];
    this.data = [];
    this.kbBuffer = [];

    this.forContext = { default:[] }

    this.vDisks = new VDisk( );

    var json = localStorage.getItem('BJ64_Settings');
    if(json!=null) {
        this.settings = JSON.parse( json );
    }
    else {
      this.settings = {}
      this.settings.cookies = false;
    }

    var commandsExtended = localStorage.getItem( "BJ64_Extended" );
    if( commandsExtended != null ) {
      commandsExtended = JSON.parse( commandsExtended );
      commandsExtended = commandsExtended.extended;

      if( commandsExtended == "on" ) {
        this.enableExtended( true );
      }
    }

    var turbo = localStorage.getItem( "BJ64_Turbo" );
    if( turbo != null ) {
      turbo = JSON.parse( turbo );
      turbo = turbo.turbo;

      if( turbo == "on" ) {
        this.setTurbo( true );
      }
    }

    var clock = localStorage.getItem( "BJ64_Clock" );
    if( clock != null ) {
      clock = JSON.parse( clock );
      clock = clock.synchronized;

      if( clock == "clocksync" ) {
        this.synchClock( );
      }
    }

    this.exitMode = "stay";
    var exitMode = localStorage.getItem( "BJ64_ExitMode" );
    if( exitMode != null ) {
      exitMode = JSON.parse( exitMode );
      exitMode = exitMode.exitmode;

      if( exitMode == "panic" ) {
        this.setExitMode( "panic" );
      }
    }

    this.initScale = "2.5";
    var scale = localStorage.getItem( "BJ64_Zoom" );
    if( scale != null ) {
      scale = JSON.parse( scale );
      scale = scale.zoom;

      this.initScale = scale;
      //this.setScale( scale );
    }

    this.immersiveFlag = false;
    var immersiveMode = localStorage.getItem( "BJ64_ImmersiveMode" );
    if( immersiveMode != null ) {
      immersiveMode = JSON.parse( immersiveMode );
      immersiveMode = immersiveMode.immersive;

      if( immersiveMode == "immersive" ) {
        this.immersiveFlag = true;
        this.setBorderChangedFlag();
      }
    }

    this.code2colMap = [];
    var km = this.code2colMap;

    km[0x90] = 0;
    km[0x05] = 1;
    km[0x1c] = 2;
    km[0x9f] = 3;
    km[0x9c] = 4;
    km[0x1e] = 5;
    km[0x1f] = 6;
    km[0x9e] = 7;

    km[0x81] = 8;
    km[0x95] = 9;
    km[0x96] = 10;
    km[0x97] = 11;
    km[0x98] = 12;
    km[0x99] = 13;
    km[0x9a] = 14;
    km[0x9b] = 15;

    this.symbolTable = {};

    this.symbolTable.up     = 0x91;
    this.symbolTable.down   = 0x11;
    this.symbolTable.left   = 157;
    this.symbolTable.right  = 29;
    this.symbolTable["reverse on"]  = 0x12;
    this.symbolTable["reverse off"]  = 0x92;
    this.symbolTable["clear"]  = 0x93;
    this.symbolTable["home"]  = 0x13;
    this.symbolTable.black  = 144;
    this.symbolTable.white  = 5;
    this.symbolTable.red  = 28;
    this.symbolTable.cyan  = 159;
    this.symbolTable.purple  = 156;
    this.symbolTable.green  = 30;
    this.symbolTable.blue  = 31;
    this.symbolTable.yellow  = 158;
    this.symbolTable.orange  = 129;
    this.symbolTable.brown  = 149;
    this.symbolTable.pink  = 150; // light red
    this.symbolTable.grey1  = 151;  //dark grey
    this.symbolTable.grey2  = 152;
    this.symbolTable["light green"]  = 153;
    this.symbolTable["light blue"]  = 154;
    this.symbolTable.grey3  = 155; //light grey


    var backmap = []
    var mapInfo = Object.entries(this.symbolTable);
    for( var i=0; i<mapInfo.length; i++) {
      backmap[ mapInfo[i][1]] = mapInfo[i][0];
    }
    this.symbolTableBM = backmap;


    /*for( var ii=0; ii<256; ii++) {

      var bits = this._getByteBits( ii );
      var byte2 = this._setByteBits( bits );
      var bits2 = this._getByteBits( byte2 );

      console.log( "byte: ", ii );
      console.log( "bits: ", bits );
      console.log( "byte2: ", byte2 );
      console.log( "bits2: ", bits2 );

    }*/

  }

  setImmersiveFlag( v ) {
    this.immersiveFlag = v;
  }

  enterListMode( list ) {
    this.listFlag = true;
    this.list = list;
    this.listPointer = 0;
  }

  setExitMode( v ) {
    this.exitMode = v;
  }

  synchClock() {

    //var clock = new Date().getTime();
    var nullClock = new Date();
    nullClock.setHours(0);
    nullClock.setSeconds(0);
    nullClock.setMinutes(0);
    nullClock.setMilliseconds(0);

    this.nullTime = nullClock;

  }

  setTurbo( on ) {
    if( on ) {
      this.cmdCountPerCycle = this.cmdCountPerCycleTurbo ;
      this.turboMode = true;
      this.cursorCountMax = this.cursorCountMaxTurbo;
      return;
    }
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;
    this.turboMode = false;
      this.cursorCountMax = this.cursorCountMaxNormal;
  }

  setProgram( pgm ) {
    this.program = pgm;
    this.runFlag = false;
    this.panicIfStopped();

    this.inputFlag = false;
    this.listFlag = false;
    this.console.clearCursor();
  }

  appendProgram( pgm ) {

    for(var i=0; i<pgm.length; i++) {
      var exists = -1;

      for(var j=0; j<this.program.length; j++) {
        if( this.program[j][0] == pgm[i][0] ) {
          exists = j;
        }
      }

      if( exists>-1 ) {
        this.program[ exists ] = pgm[ i ];
      }
      else {
        this.program.push( pgm[ i ] );
      }
    }

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    this.program.sort( sortF );

    this.runFlag = false;
    this.panicIfStopped();

    this.inputFlag = false;
    this.listFlag = false;
    this.console.clearCursor();
  }

  getProgram() {
    return this.program;
  }

  setBorderChangedFlag() {
    this.borderChangedFlag = true;
  }

  getBorderChangedFlag() {
    if( this.borderChangedFlag ) {
      this.borderChangedFlag = false;
      return true;
    }
    return false;
  }

  getImmersiveFlag() {
    return this.immersiveFlag;
  }

  getProgramState() {
    return {
      runFlag: this.runFlag,
      inputFlag: this.inputFlag,
      vars: this.vars,
      functions: this.functions,
      forContext: this.forContext,
      runPointer: this.runPointer,
      runPointer2: this.runPointer2
    }
  }

  setProgramState( pgmState ) {
      this.runFlag = pgmState.runFlag;
      this.panicIfStopped();
      this.inputFlag = pgmState.inputFlag;
      this.vars = pgmState.vars;
      this.functions = pgmState.functions;
      this.forContext = pgmState.forContext;
      this.runPointer = pgmState.runPointer;
      this.runPointer2 = pgmState.runPointer2;
  }

  firstTimeAccessStorage() {
    this.settings.cookies=true;
    this.vDisks.initialize();

    localStorage.setItem( "BJ64_Settings", JSON.stringify( this.settings ) );
  }

  confirmCookies() {

      if( this.settings.cookies == false ) {
        if (confirm('Settings and Virtual Storage require localstorage and cookies, \nEnable?')) {
          this.firstTimeAccessStorage();
          return true;
        } else {
          // Do nothing!
          return false;
        }
      }
      else {
        if( !this.vDisks.ready() ) {
          this.vDisks.initialize();
        }
        return true;
      }

  }

  isMenu() {
    return this.menuFocus;
  }

  toggleMenu() {
    if(!this.menuFocus) {
      this.listStop();
      this.menu.start();
    }
    else  {
      this.menu.stop();
    }
    this.menuFocus = !this.menuFocus;
  }

  endMenu() {

    this.menuFocus = false;
  }

  handleMenuKey( keyEvent ) {
    this.menu.handleKey( keyEvent );
  }

  vpoke(a,b) { this.console.vpoke( a - 53248,b%256  ); }
  /* todo remove vpoke */



  _setByteBits( bits ) {

   var byte = 0b00000000;

   for( var i=0; i<8; i++) {
     if(i>0) {
       byte = byte >> 1;
     }
     if( bits[i]) {
       byte = byte | 128;
     }
   }
   return byte;
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


  poke( a, b0, noVicFlush ) {

      var b = Math.floor( b0 ) % 256;

      if( isNaN( b ) ) { b = 0; }

      if( a == 1) { //Bank Switching

        this.console.poke( a, b);

        //%0xx: Character ROM visible at $D000-$DFFF. (Except for the value %000, see above.)
        //%1xx: I/O area visible at $D000-$DFFF. (Except for the value %100, see above.)
        //https://sta.c64.org/cbm64mem.html
        var bits = this._getByteBits( b );


        if( bits[0] == false ) {
          this.console.setCharRomVisible( true );
        }
        else {
          this.console.setCharRomVisible( false );
        }

      }
      else if( a == 646) {
        this.console.setColor( b%16 );
      }
      else if( a>53247 && a<53295) { //VIC registers

        if( this.console.getCharRomVisible() == false ) {
            this.console.vpoke( a - 53248,b%256  );
            if( noVicFlush === undefined ) {
              this.console.pokeFlush();
            }
        }
        else {
          //Can't poke in ROM
          //Since now VIC registers are hidden, and char rom is showed here
        }

      }
      else if( a>1023 && a<2024) {
        var v = a - 1024;
        var y = Math.floor(v / 40);
        var x = v%40;
        var c = b%256;

        this.console.setChar(x,y,c);
      }
      else if( a>=2040 && a<2048) {

        this.console.poke( a, b);

        var sn = a - 2040;
        var addr = b * 64;

        this.console.setSpriteAddress(sn,addr);

      }
      else if( a>55295 && a<56296) {
        var v = a - 55296;
        var y = Math.floor(v / 40);
        var x = v%40;
        var c = b%256;

        this.console.setCharCol(x,y,c%16);
      }

      this.console.poke( a, b);
  }

  peek( a ) {

      if( this.console.getCharRomVisible() ) {
        if( a>53247 && a<(53248+2048)) {
          return this.console.charRomPeek( a - 53248 )
        }
      }
      else {
        if( a>53247 && a<53295) {

          return this.console.vpeek( a - 53248 )

        }
      }


      if( a>1023 && a<2024) {
        var v = a - 1024;
        var y = Math.floor(v / 40);
        var x = v%40;

        return this.console.getChar(x,y);
      }
      else if( a>55295 && a<56296) {
        var v = a - 55296;
        var y = Math.floor(v / 40);
        var x = v%40;

        return this.console.getCharCol(x,y);
      }
      else {
        return this.console.peek( a );
      }
  }

  pushKeyBuffer( k ) {
    this.kbBuffer.push( k );
  }

  pullKeyBuffer( k ) {
    if( this.kbBuffer.length > 0 ) {

      return this.kbBuffer.shift();

    }
    return -1;
  }

  printError( s ) {

    this.console.writeString( ("?" + s + " error" + this.onLineStr()).toUpperCase(), true );

  }

  printInfo( s ) {

    this.console.writeString( ( s + this.onLineStr()).toUpperCase(), true );

  }

  printLine( s ) {
    this.sendChars(s.toUpperCase(), true);
    this.reverseOn = false;
  }

  print( s ) {
    this.sendChars(s.toUpperCase(), false);
    this.reverseOn = false;
  }




  spriteColor( s, c ) {
    var base = 53287 + s;

    this.poke( base, c );

  }


  spritePos( s, x, y ) {
    var base = 53248 + (2*s);

    var lbx = x & 255;
    var hbx = (x & 256) >> 8;

    this.poke( base, lbx, true ); //TODO most significant bit
    var ohbx = this.peek( 53264 );
    if( hbx > 0 ) {
        this.poke( 53264, ohbx | (1 << s), true ); //TODO most significant bit
    }
    else {
      this.poke( 53264, ohbx & (255-(1 << s)), true ); //TODO most significant bit
    }

    this.poke( base + 1 , y, true );

    this.console.pokeFlush();

  }

  spriteFrame( s, f ) {

    var addr = 2040 + s;
    this.poke( addr , f );

  }

  spriteFrameCopy( f1, f2 ) {
    var baddr1 = f1 * 64;
    var baddr2 = f2 * 64;

    for( var i=0; i<64; i++ ) {
        this.poke( baddr2 + i , this.peek( baddr1 + i)  );
    }
  }

  spriteFrameSet( f1, data ) {
    var baddr1 = f1 * 64;

    for( var i=0; i<64; i++ ) {

        this.poke( baddr1 + i , data[ i ]  );
    }
  }

  spriteFrameGet( f1 ) {
    var baddr1 = f1 * 64;
    var data = [];

    for( var i=0; i<64; i++ ) {
        data.push( this.peek( baddr1 + i)  );
    }

    return data;
  }

  spritePoke( f, a, v ) {

    var baddr = f * 64;
    this.poke( baddr + (a%64) , v );

  }

  spriteDouble( s, xflag, yflag ) {
    var mask = 1<<s;
    var old = this.peek( 53277 );
    if( xflag == 1 ) {
      this.poke( 53277 , old | mask );
    }
    else {
      this.poke( 53277 , old & (255-mask) );
    }

    old = this.peek( 53271 );
    if( yflag == 1 ) {
      this.poke( 53271 , old | mask );
    }
    else {
      this.poke( 53271 , old & (255-mask) );
    }
  }

  spriteEnable( s, flag ) {
    var mask = 1<<s;
    var old = this.peek( 53269 );
    if( flag == 1 ) {
      this.poke( 53269 , old | mask );
    }
    else {
      this.poke( 53269 , old & (255-mask) );
    }
  }

  spriteMultiCol( s, flag ) {
    var mask = 1<<s;
    var old = this.peek( 53276 );
    if( flag == 1 ) {
      this.poke( 53276 , old | mask );
    }
    else {
      this.poke( 53276 , old & (255-mask) );
    }
  }

  clearScreen() {
    this.console.clearScreen();
    this.console.cursorHome();
  }

  setColorCellModified( x,y,col0, col1, col2 ) {
    /*
      Sets the 3 colors for a multicolor hires 8x8 cell
      if the colors parameters are > -1
      otherwise just set the modified flag on the color cell
      so the pixel drawn in this color cell will be visible

      col0 = low color in char ram
      col1 = high color in char ram
      col2 = color in color ram
    */

    if( col0 == -1 && col1 == -1 && col2 == -1) {
        this.console.setCellModified(x,y);
        return;
    }

    if( col0 > -1 && col1 > -1 ) {
        this.console.setChar(x,y, col1 + ( col0 * 16 ));
    }
    else if( col0 >-1 && col1 == -1 ) {

        var charCol = this.console.getChar( x, y );
        //var hiVal = (charCol & 240)>>4
        var loVal = charCol & 15;
        this.console.setChar(x,y, loVal + (col0 * 16) );
    }
    else if( col0 == -1 && col1 > -1 ) {
        var charCol = this.console.getChar( x, y );
        var hiVal = (charCol & 240);
        //var loVal = charCol & 15;
        this.console.setChar(x,y, hiVal + col1 );
    }

    if( col2 > -1) {
            this.console.setCharCol(x,y,col2);
    }

  }

  clearGFXScreen( col0, col1, col2 ) {

    if( this.console.isBitMapMode() ) {

      var mem = this.console.getMemory();
      var bmaddr = this.console.getBitmapAddress();

      for( var i=0; i<8000;i++) {
        mem[ bmaddr + i] = 0;
      }
    }

    for(var y=0;y<25;y++) {
      for(var x=0;x<40;x++) {
        this.setColorCellModified(
          x,y, col0, col1, col2 );
      }
    }
  }

  setCursor(x,y) {
    this.console.setCursorX(x);
    this.console.setCursorY(y);
  }

  setTextCol(x,y,col) {
    this.poke(55296+x+(y*40),col);
  }

  drawLine( pointGen, x,y,x2,y2,colRecord, index ) {

    var points = pointGen.c[pointGen.m](x,y,x2,y2);

    for( var i=0; i<points.length; i++) {
      var p=points[i];
      this.setPixel( p.x,p.y,colRecord, index );
    }

  }

  drawBox(x1,y1,x2,y2,colRecord, index) {

    for( var x=x1; x<=x2; x++) {
      for( var y=y1; y<=y2; y++) {
        this.setPixel( x,y,colRecord, index );
      }
    }
  }


  setPixel(x,y, colRecord, index ) {

    if( ! this.console.isBitMapMode() ) { throw "@bitmap mode"; }

    if( x<0 || y>0 || y > 199 ) {
      if( x<0 ) { throw "@pixel x<0"; }
      else if( y<0 ) { throw "@pixel y<0"; }
      else if( y>199 ) { throw "@pixel y>199"; }
    }

    if( this.console.isMultiColor() ) {
      if( x>159) { throw "@pixel x>159"; }
      this._setPixelMC(x,y, colRecord, index );
    }
    else {
      if( x>319) { throw "@pixel x>159"; }
      this._setPixelMono(x,y, colRecord, index );
    }
  }

  _setPixelMono(x,y, colRecord, index ) {

    var base = this.console.getBitmapAddress();
    var colX = Math.floor(x>>3);
    var rowY = Math.floor(y>>3); //>>3 == /8
    var Xremainder = x-(colX<<3);
    var Yremainder = y-(rowY<<3); //<<3 == *8

    var byteAddr = base +
          (colX*8) +
          (rowY*(40*8)) +
          Yremainder;
    var oldValue = this.peek( byteAddr );
    var mask = Math.pow(2,7-Xremainder);
    var newValue;
    if( index == 1 ) {
      newValue =  oldValue | mask;

      this.setColorCellModified(
          colX,rowY, -1, colRecord.c1, -1 );

    }
    else {
      newValue =  oldValue & (255 - mask);

      this.setColorCellModified(
          colX,rowY, colRecord.c0, -1, -1 );
    }

    this.poke(byteAddr, newValue);

  }

  _setPixelMC(x,y, colRecord, index ) {

    var base = this.console.getBitmapAddress();
    var colX = Math.floor(x>>2); //>>2 == /4
    var rowY = Math.floor(y>>3); //>>3 == /8
    var Xremainder = x-(colX<<2); //<<2 == *4
    var Yremainder = y-(rowY<<3); //<<3 == *8

    var byteAddr = base +
          (colX*8) +
          (rowY*(40*8)) +
          Yremainder;

    var oldValue = this.peek( byteAddr );
    var maskSubPix1 = Math.pow(2,7-(Xremainder*2));
    var maskSubPix2 = maskSubPix1>>1;
    var newValue;
    if( index == 1 ) {
      newValue =  oldValue & (255 - maskSubPix1);
      newValue =  newValue | maskSubPix2;

      this.setColorCellModified(
          colX,rowY, colRecord.c0, -1, -1 );

    }
    else if( index == 2 ) {
      newValue =  oldValue | maskSubPix1;
      newValue =  newValue & (255 - maskSubPix2);

      this.setColorCellModified(
          colX,rowY, -1, colRecord.c1, -1 );

    }
    else if( index == 3) {
      newValue =  oldValue | maskSubPix1;
      newValue =  newValue | maskSubPix2;

      this.setColorCellModified(
          colX,rowY, -1, -1, colRecord.c2 );

    }
    else { //0
      newValue =  oldValue & (255 - maskSubPix1);
      newValue =  newValue & (255 - maskSubPix2);

      this.setColorCellModified(
          colX,rowY, -1, -1, -1 );
    }

    this.poke(byteAddr, newValue);

  }


  getPixel(x,y, selector) {

    if( ! this.console.isBitMapMode() ) { throw "@bitmap mode"; }

    if( this.console.isMultiColor() ) {
      this._getPixelMC(x,y, selector );
    }
    else {
      this._getPixelMono(x,y, selector );
    }

  }

  _getPixelMono(x,y, selector) {

    var base = this.console.getBitmapAddress();
    var colX = Math.floor(x>>3);
    var rowY = Math.floor(y>>3); //>>3 == /8
    var Xremainder = x-(colX<<3);
    var Yremainder = y-(rowY<<3); //<<3 == *8

    var byteAddr = base +
          (colX*8) +
          (rowY*(40*8)) +
          Yremainder;
    var oldValue = this.peek( byteAddr );
    var mask = Math.pow(2,7-Xremainder);
    var pixelValue = oldValue & (mask);

    if(  ( selector === undefined ) || selector == 0 ) {
        if( pixelValue != 0) {
          return 1;
        }
        else {
          return 0;
        }
    }
    else if( selector == 1 ) {
        var charCol = this.console.getChar( colX, rowY );
        var hiVal = (charCol & 240)>>4
        var loVal = charCol & 15;

        if( pixelValue != 0) {
          return loVal;
        }
        else {
          return hiVal;
        }
    }

  }

  _getPixelMC(x,y, selector) {
//TODO
    var base = this.console.getBitmapAddress();
    var colX = Math.floor(x>>2); //>>2 == /4
    var rowY = Math.floor(y>>3); //>>3 == /8
    var Xremainder = x-(colX<<2); //<<2 == *4
    var Yremainder = y-(rowY<<3); //<<3 == *8

    var byteAddr = base +
          (colX*8) +
          (rowY*(40*8)) +
          Yremainder;

    var xr2 = Xremainder*2;
    var byteValue = this.peek( byteAddr );
    var maskSubPix1 = Math.pow(2,7-(xr2));
    var maskSubPix2 = maskSubPix1>>1;
    var shiftResultRight = 6-xr2;
    var pixelValue = byteValue & (maskSubPix1 + maskSubPix2);
    var pixelValue2 = pixelValue >> shiftResultRight;


    if(  ( selector === undefined ) || selector == 0 ) {
        return pixelValue2;
    }
    else if( selector == 1 ) {
        if( pixelValue2 == 0) {
          return this.peek(53281);
        }
        else if( pixelValue2== 1 || pixelValue2==2) {
          var charCol = this.console.getChar( colX, rowY );
          var hiVal = (charCol & 240)>>4
          var loVal = charCol & 15;

          if( pixelValue2 == 1) {
            return loVal;
          }
          else if( pixelValue2 == 1) {
            return hiVal;
          }
        }
        else {
          return this.console.getCharCol( colX,rowY);
        }
    }

  }


  setTextChar(x,y,c,col) {
    this.poke(1024+x+(y*40),c);
    if( col === undefined ) {
      return;
    }
    this.poke(55296+x+(y*40),col);
  }

  getTextChar(x,y) {
    return this.peek(1024+x+(y*40));
  }

  getTextColor(x,y) {
    return this.peek(55296+x+(y*40));
  }

  sendChars( s, newline ) {

    for( var i=0; i< s.length; i++) {
      var c=s.charCodeAt( i );

      if( c<32 || (c>128 && c<160)) {
        var col = this.code2colMap[ c ];
        if( !(col===undefined)) {
          this.console.setColor(col);
        }
        else if( c==0x12 ) {
          //this.console.setColor(8); Set reverse

          this.reverseOn = true;
        }
        else if( c==0x92 ) {
          //this.console.setColor(8); Set reverse
          this.reverseOn = false;
        }
        else if( c==0x13 ) {
          this.console.cursorHome();
        }
        else if( c==0x93 ) {
          this.console.clearScreen()
        }
        else if( c==29 ) {
          var xy = this.console.getCursorPos();
          if(xy[0]<39) {
            this.console.setCursorX( xy[0] + 1);
          }
        }
        else if( c==157 ) {
          var xy = this.console.getCursorPos();
          if(xy[0]>0) {
            this.console.setCursorX( xy[0] - 1);
          }
        }
        else if( c==17 ) {
          var xy = this.console.getCursorPos();
          if(xy[1]<24) {
            this.console.setCursorY( xy[1] + 1);
          }
        }
        else if( c==145 ) {
          var xy = this.console.getCursorPos();
          if(xy[1]>0) {
            this.console.setCursorY( xy[1] - 1);
          }
        }
      }
      else {
        if( this.reverseOn ) {
          this.console.writeCharRev( String.fromCharCode(c)  );
        }
        else {
          this.console.writeChar( String.fromCharCode(c)  );
        }

      }
    }

    if( newline ) {
      this.console.writeString( "", true );
    }
  }

  getLinePos() {
    var xy = this.console.getCursorPos();
    return xy[0];
  }

  sendCharsSimple( s, newline ) {

    for( var i=0; i< s.length; i++) {
      var c=s.charCodeAt( i );

      if( this.reverseOn ) {
        this.console.writeCharRev( String.fromCharCode(c)  );
      }
      else {
        this.console.writeChar( String.fromCharCode(c)  );
      }
    }

    if( newline ) {
      this.console.writeString( "", true );
    }
  }

  setCursXPos( p ) {
    this.console.setCursorX( p );
  }

  resetVic() {
    this.vpoke(53280,14);
    this.vpoke(53281,6);
    this.vpoke(53269,0);
    this.vpoke(53270,200);
    this.vpoke(53272,21);
    this.vpoke(53265,155);
    this.console.setColor(14);
  }

  getJiffyTime() {
    var millis=new Date().getTime() - this.nullTime;
    var jiffis = Math.floor(millis / (1000 / 60));

    return jiffis % 5184000;
  }

  getTime() {
    var millis=new Date().getTime() - this.nullTime;
    millis = millis % 86400000;

    var hours = Math.floor(millis / 3600000);
    millis = millis - (hours * 3600000 );
    var minutes = Math.floor(millis / 60000);
    millis = millis - (minutes * 60000 );
    var seconds = Math.floor(millis / 1000);
    //millis = millis - (seconds * 1000 );
    return [hours,minutes,seconds];
  }

  reset( hard, muteReady ) {
    this.console.clearScreen();
    this.vpoke(53280,14);
    this.vpoke(53281,6);
    this.vpoke(53269,0);
    this.vpoke(53270,200);
    this.vpoke(53272,21);
    this.vpoke(53265,155);
    this.console.setColor(14);
    this.inputFlag = false;
    this.runFlag = false;
    this.listFlag = false;

    this.clrPGM();

    this.setTurbo( false );

    this.printLine("");
    if( hard ) {
      this.printLine("     **** c64 - basic emulator ****");
      this.printLine("");
      var ext = "off";
      if(this.extendedcommands.enabled) ext = "on ";

      var turbo = "off";
      if(this.turboMode) turbo = "on ";

      this.printLine("  **** extended: " + ext + "-  turbo: "+turbo+" ****");
      this.printLine("");
    }
    if( !muteReady ) {
      this.printLine("ready.");
    }
  }

  clearScreen( ) {
    this.console.clearScreen();
  }

  compressPGMText( pgmTxt ) {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();
    var kws = p.getKeyWordCodes();
    var txt2 = pgmTxt;

    for( var i=0; i<kws.length; i++) {
      var kw = kws[i];
      if( !(kw===undefined || kw === null )) {
          txt2 = txt2.replaceAll( kw.toLowerCase() , String.fromCharCode(i));
      }
    }

    return txt2;
  }

  getProgramAsText() {
    var text = "";
    for (const l of this.program)
      {
        if( text != "") {
          text += "\n";
        }
        text +=  this.prepareLineForExport( l[2].trim() );
      }
    return text;
  }

  prepareLineForExport( txt0 ) {
    var txt;
    txt = txt0.trim();
    var dst = "";

    for( var i=0; i<txt.length; i++) {
      //var c = txt.charAt( i );
      var c = txt.charCodeAt( i );
      if( c<31 || c==92 || c>=94 ) {
        var symdef = this.symbolTableBM[ c ];
        if( ! ( symdef === undefined ) ) {
            dst += "{" + symdef + "}";
        }
        else {
            dst += "{"+c+"}"
        }

      }
      else {
        dst += txt.charAt( i );
      }
    }

    /*
      escape 0-31
      escape 92
      escape 94 - 255
      {}  123 + 125
    */
    return dst.toLowerCase();
  }

  ResolveStringSymbolToCode( x ) {

    if(this.symbolTable[x]) {
      return this.symbolTable[x];
    }

    return x;
  }


  prepareLineForImport( txt0 ) {
    var txt;
    txt = txt0.trim().toUpperCase();
    var dst = "";

    var i=0; while( i<txt.length ) {
      var c = txt.charCodeAt( i );
      if( c == 123 ) {
        i++;
        var num = "";
        while( i < txt.length ) {
            c = txt.charCodeAt( i );
            if( c == 125 ) {
              i++;
              break;
            }
            num += String.fromCharCode( c );

            if( this.debugFlag ) {
              console.log("found ESC seq char " + String.fromCharCode( c ) );
              console.log("found ESC seq char code " + c);
            }
            i++;
        }

        if( this.debugFlag ) {
          console.log("found ESC seq " + num);
        }

        num = this.ResolveStringSymbolToCode(num.toLowerCase());

        if( this.debugFlag ) {
          console.log("found resolved ESC seq " + num);
        }

        dst += String.fromCharCode( parseInt( num, 10) );
      }
      else if( c == 8221 || c == 8220) { //looks like a double quote
        dst += "\"";
        i++;
      }
      else {
        dst += txt.charAt( i );
        i++;
      }
    }

    /*
      escape 0-31
      escape 92
      escape 94 - 255
      {}  123 + 125
    */
    if( this.debugFlag ) {
      console.log("dst:" + dst);
    }

    return dst;
  }

  getProgramLines() {

    return this.program;
  }

  padZeros2( x ) {
    var s = x + "";
    for(var i=s.length; i<2; i++) {
      s="0"+s;
    }
    return s;
  }

  evalExpressionPart( p ) {
    var val=0;

    if( p.type=="num" ) {
      if( p.data == "." ) {
        val = 0;
      }
      else if( p.data == "~" ) {
        val = Math.PI;
      }
      else if((""+p.data).indexOf(".") >= 0) {
        val = parseFloat(p.data);
      }
      else {
        val = parseInt(p.data);
      }
    }
    else if( p.type=="str" ) {
      val = p.data;
    }
    else if( p.type=="var" ) {
      if(p.data.startsWith("TI")) {
        val = this.getJiffyTime();
        if(p.data.endsWith("$")) {
          val = this.getTime();
          val = "" +
            this.padZeros2(val[0]) +
            this.padZeros2(val[1]) +
            this.padZeros2(val[2]);
        }
      }
      else {
        val = this.vars[ p.data ];
      }
      if( val == undefined ) {
        val = 0;
      }
    }
    else if( p.type=="array" ) {
      var varIntName = "@array_" + p.data;
      var arr = this.vars[ varIntName ];

      if( arr === undefined ) {
        throw "@no such array";
      }

      if( arr.getIndexCount() != p.indices.length ) {
          throw "@bad subscript";
      }

      var indices = [];
      for( var ai=0; ai<p.indices.length; ai++) {
        indices[ai] = this.evalExpression( p.indices[ ai ] );
      }

      val = arr.get( indices );
      if( val === undefined ) {
        val = 0;
      }

    }
    else if( p.type=="expr" ) {
      val = this.evalExpression( p );
    }
    else if( p.type=="funCall" ) {

      var values = [];
      for( var j=0; j<p.params.length; j++) {
        var par = this.evalExpression( p.params[j] );;
        values.push( {value: par} );
      }
      try {
        var commands = this.commands;
        var ecommands = this.extendedcommands;
        var cmds = this.commands;

        var nFunName = "_fun_" + p.functionName.toLowerCase().replace("$","_DLR_");

        var stc = commands[ nFunName ];
        if( stc === undefined ) {

          stc = ecommands[ nFunName ];

          if( stc === undefined ) {

            stc = ecommands[ nFunName ];

            this.printError("no such function " + p.functionName);
            console.log("Cannot find functionName " + nFunName );

            throw "no such function " + p.functionName;

          }
          else {
            cmds = ecommands;
          }
        }

        val = cmds[ nFunName ]( values );

      }
      catch ( e ) {
        if( e.startsWith("@") ) {
          this.printError(e.substr(1));
        }
        else {
          this.printError("unexpected");
        }

      }
    }
    else if( p.type=="defFnCall" ) {

      try {
        var fName = p.functionName;
        var parValue = this.evalExpression( p.params[0] );
        var restore = null;

        if( this.functions[ fName ] === undefined ) {
          throw "@undef'd function";
        }
        var functRecord = this.functions[ fName ];

        if(!(  this.vars[ functRecord.par ] === undefined )) {
          restore= this.vars[ functRecord.par ];
        }

        this.vars[ functRecord.par ] = parValue;
        val  = this.evalExpression( functRecord.expr );

        if( restore != null ) {
          this.vars[ restore.name ] = restore;
        }
        else {
          this.vars[ functRecord.par ] = 0; //TODO, actually should delete it
        }

      }
      catch ( e ) {
        if( e.startsWith("@") ) {
          this.printError(e.substr(1));
        }
        else {
          this.printError("unexpected");
        }

      }
    }

    return val;
  }

  evalExpression( expr ) {

    if( expr == null ) {
      return null;
    }

    if( expr.parts.length == 0 ) {
      return null;
    }

    var val = this.evalExpressionPart( expr.parts[ 0 ] );

    for( var i=1; i<expr.parts.length; i++) {
      var p = expr.parts[ i ];
      if( p.op == "+" ) {
        val += this.evalExpressionPart( p );
      }
      else if( p.op == "^" ) {
        val = Math.pow( val, this.evalExpressionPart( p ) );
      }
      else if( p.op == "-" ) {
        val -= this.evalExpressionPart( p );
      }
      else if( p.op == "*" ) {
        val *= this.evalExpressionPart( p );
      }
      else if( p.op == "/" ) {
        if( this.evalExpressionPart( p ) == 0) {
          throw "@division by zero  ";
        }
        val /= this.evalExpressionPart( p );
      }
      else if( p.op == ";" ) {
        val += ("" + this.evalExpressionPart( p ));
      }
      else if( p.op == "OR"  ) {
          val |= this.evalExpressionPart( p );
      }
      else if( p.op == "AND"  ) {
          val &= this.evalExpressionPart( p );
      }
      else if( p.op == "<" ) {
        if( val < (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == ">" ) {
        if( val > (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "=" ) {
        if( val == (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "<>" ) {
        if( val != (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "<=" ) {
        if( val <= (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == ">=" ) {
        if( val >= (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }

      else {
        throw "unknown op '"+p.op+"'";
      }
    }

    if( expr.negate ) {
      return -val;
    }
    if( expr.binaryNegate ) {
      if( val == 0 ) {
        return -1;
      }
      return 0;
    }
    return val;
  }


  panicIfStopped() {
    if( !this.runFlag && this.exitMode == "panic") {

      var bitmap = this.console.isBitMapMode();
      this.resetVic();

      if( bitmap ) {
        this.setCursor(0,22);
        this.printLine("");
        this.printLine("");
        this.printLine("");
      }


    }
  }

  exitInputState() {
    var c = this.console;
    var p = this.program;

    this.inputFlag = false;


    var l = this.program[ this.runPointer ];
    var cmds = l[1];
    //console.log(cmds);


    if( this.runPointer > -1 ) {

        var l=this.program[this.runPointer];
        //console.log( l[0] + "after input >>(" + this.runPointer + ":"  + this.runPointer2 +")");
    }

    this.runPointer2++;

    if( this.runPointer > -1 ) {

        var l=this.program[this.runPointer];
        //console.log( l[0] + "after input >>>(" + this.runPointer + ":"  + this.runPointer2 +")");
    }

    if( this.runPointer2 >=  cmds.length ) {


      this.runPointer2 = 0;
      this.runPointer++;

      if( this.runPointer > -1 ) {

          var l=this.program[this.runPointer];
          //console.log( l[0] + "after input >>>>(" + this.runPointer + ":"  + this.runPointer2 +")");
      }


      if( this.runPointer >=  p.length ) {

        if( this.runPointer > -1 ) {

            var l=this.program[this.runPointer];
            //console.log( l[0] + "after input >>>>>(" + this.runPointer + ":"  + this.runPointer2 +")");
        }

        this.runFlag = false;
        this.panicIfStopped();
        c.clearCursor();
        this.printLine("");
        this.printLine("ready.");
      }

    }


  }

  breakCycle() {
    this.breakCycleFlag = true;
  }

  cycle() {

    /*return values*/
    var END_W_ERROR = 0;
    var TERMINATE_PROGRAM = -1;
    var LINE_FINISHED = 10;
    var MIDLINE_INTERUPT = 20;
    var TERMINATE_W_JUMP = 30;
    var PAUSE_F_INPUT = 40;

    var c = this.console;

    var cmdCount = this.cmdCountPerCycle;


    try {

      if( !this.runFlag ||
            this.menuFocus ||
            this.inputFlag ||
            this.listFlag
             ) {

        if( this.listFlag ) {
           if( this.listPointer < this.list.length ) {
               this.listCodeLine( this.list[ this.listPointer ] );
               this.listPointer++;
           }
           else {
             this.listFlag = false;
           }

        }
        if(this.cursorCount++>this.cursorCountMax) {
          this.cursorCount = 0;

          if( !this.menuFocus && !this.listFlag )
            {
              c.blinkCursor();
            }
        }
      }
      else {

        if(this.debugFlag) console.log("START CYCLE------------------------------" );

        var p = this.program;

        while (true) {

          if( this.breakCycleFlag ) {
            this.breakCycleFlag = false;
            break;
          }
          if(this.debugFlag) console.log("START CYCLE LOOP-------------" );
          var l = p[ this.runPointer ];
          var bf = this.runPointer2;
          if(this.debugFlag) console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );
          if(this.debugFlag) console.log(" cmdCount = " + cmdCount);
          var rv = this.runCommands( l[1], cmdCount );
          //console.log(" rv = ", rv);
          var af = rv[ 1 ];

          if( rv[0] == MIDLINE_INTERUPT) {
            this.runPointer2 = af;
          }

          var executedCount = rv[2];

          if(this.debugFlag) console.log(" bf = " + bf, " af = " + af);
          if(this.debugFlag) console.log(" executedCount = " + executedCount);
          if(this.debugFlag) console.log(" rv = " + rv);

          cmdCount = cmdCount - executedCount;

          if( rv[0]<=0 ) {
            if(this.debugFlag) console.log(" PGM END!!!!" );
            this.runFlag = false;
            this.printLine("");
            this.printLine("ready.");
            this.panicIfStopped();
            if( rv[0] == END_W_ERROR ) {
              console.log("PARAMETER DUMP:", this.vars );
              console.log("FUNCTION DUMP:", this.functions );
            }
            if(this.debugFlag) console.log("CYCLE RETURN END");
            return;
          }
          else if( rv[0] == LINE_FINISHED ) {
            this.runPointer ++;
            this.runPointer2 = 0;
            if(this.debugFlag) console.log(" new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

            if( this.runPointer >=  p.length ) {
              if(this.debugFlag) console.log( "end program");
              this.runFlag = false;
              this.panicIfStopped();
              c.clearCursor();
              this.printLine("ready.");
              break;
            }
          }
          else if( rv[0] == TERMINATE_W_JUMP ) {

            if(this.debugFlag) console.log(" jump to new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

          }
          else if( rv[0] == PAUSE_F_INPUT ) {

            this.runPointer2 = af;
            //console.log("CYCLE PAUSE 4 INPUT");
            //console.log("CYCLE PAUSE 4 INPUT" + this.runPointer + "," + this.runPointer2);
            if(this.debugFlag) console.log("CYCLE PAUSE 4 INPUT" + this.runPointer + "," + this.runPointer2);
            break;

          }

          if( cmdCount<=0 ) {
            if(this.debugFlag) console.log("Breaking cmdCount=" + cmdCount)
            break;
          }

        }

        if(this.debugFlag) console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

      }

    }
    catch (e) {
      c.clearCursor();
      this.printError("unexpected");
      this.printLine("ready.");
      this.runFlag = false;
      this.panicIfStopped();
      console.log("Exception: ", e );
      console.log("PARAMETER DUMP:", this.vars );
      console.log("FUNCTION DUMP:", this.functions );

    }



  }

  doReturn() {

    var oldPointers = this.gosubReturn.pop();
    if( oldPointers === undefined ) {
      throw "return without gosub  ";
    }

    this.runPointer2 = oldPointers[ 1 ];
    this.runPointer = oldPointers[ 0 ];

    //this.goto( oldLine );
  }

  gosub( line, runPointer2 ) {

    var pgm = this.program;
    var len=this.program.length;
    var retLine = null;
    var retCmd = null;

    this.runPointer2 = runPointer2;

    if( ( this.runPointer2 + 1) < this.program[ this.runPointer ][1].length ) {
      retCmd = this.runPointer2 + 1;
      retLine = this.runPointer;
    }
    else {
      if( (this.runPointer+1) < len ) {
        retCmd=0;
        retLine = this.runPointer+1 ;
      }
      else {
        retCmd=9999;
        retLine = this.runPointer;
      }
    }

    this.gosubReturn.push( [ retLine, retCmd ] );
    this.goto( line );
  }

  goto( line ) {

    var pgm = this.program;
    var len=this.program.length;
    var found = false;

    for( var i=0; i<len; i++) {
      var l = pgm[i];

      if( l[0] == line ) {
        this.runPointer = i;
        this.runPointer2 = 0;
        found = true;
      }
    }

    if(!found ) {
      this.printError("UNDEF'D STATEMENT");
      throw "GOTO line not found";
    }

    if(!this.runFlag ) {
      this.startAsGoto = true;
      this.runPGM();
    }
  }

  listStop() {
    if( this.listFlag ) {
      var c = this.console;
      this.listFlag = false;
      c.clearCursor();
      this.printLine( "ready.");
    }
  }

  runStop() {
    if( this.runFlag ) {
      var c = this.console;
      this.runFlag = false;
      this.panicIfStopped();
      c.clearCursor();

      console.log( "break in " + this.program[ this.runPointer ][0] );
      this.printLine( "break in " + this.program[ this.runPointer ][0]);
      this.printLine( "ready.");
    }
  }

  isRunning() {
    return this.runFlag;
  }

  isListing() {
    return this.listFlag;
  }

  isInput() {
    return this.inputFlag;
  }

  readData() {

    if( this.dataPointer >= this.data.length ) {
      return undefined;
    }

    var result = this.data[ this.dataPointer ];
    this.dataPointer++;

    return result;
  }


  listCodeLine( rawLine ) {

    var inString = false;
    for( var i=0; i<rawLine.length; i++ ) {

      var c = rawLine.charAt(i);

      if( !inString ) {
        this.sendChars( c, false  );
      }
      else {
        this.sendCharsSimple( c, false );
      }

      if( c == "\"" ) {
        inString = !inString;
      }
    }
    this.printLine( "" );

  }

  rebuildLineString( nr, raw,
      removePadding,
      renumbering,
      addSmartPadding )
  {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();

    var tokens = p.getTokens( raw, false, false );

    if( ! ( renumbering === undefined )) {

      var foundGoto = false;
      for( i = 0; i<tokens.length; i++) {
        if( tokens[i].type == "name" && (tokens[i].data == "GOTO" || tokens[i].data == "GOSUB") ) {
          foundGoto = true;
        } else {
          if( i>1 ) {
            if( tokens[i].type == "num" &&
                tokens[i-1].type == "pad" &&
                tokens[i-2].type == "name" && tokens[i-2].data == "THEN" ) {
              foundGoto = true;
            }
            else if( tokens[i].type == "num" && tokens[i-1].type == "name" && tokens[i-1].data == "THEN" ) {
              foundGoto = true;
            }
          }
        }

        if( tokens[i].type == "num" && foundGoto ) {
          var newLine = renumbering[ "old_" + tokens[i].data ];
          if( newLine == undefined ) { newLine = 99999;}
          tokens[i].data =newLine;
          foundGoto = false;
        }
      }
    }
    tokens[0].data = nr;
    var newString;

    newString = nr;
    if( removePadding ) {
      newString = nr + " " ;
    }
    for( var i = 1 ; i< tokens.length; i++) {
      if( removePadding ) {
         if( tokens[i].type == "pad" ) {
           continue;
         }
       }
      if( tokens[i].type == "str" ) {
        newString += "\"" + tokens[i].data + "\"";
      }
      else if( tokens[i].type == "name" && addSmartPadding == true) {
        newString += tokens[i].data + " ";
      }
      else if( tokens[i].type == "num" && addSmartPadding == true) {
        if( tokens[i].data.length == 1 ) {
            newString += " " + tokens[i].data;
        }
        else {
            newString += tokens[i].data;
        }
      }
      else {
        newString += tokens[i].data;
      }

    }

    var rec = p.parseLine( newString );

    return rec;
  }

  renumberProgram( start, gap ) {

    var p = this.program;

    var newLineNr = start;
    var renumbering = {};

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];
        renumbering["old_" + line[0]] = newLineNr;
        newLineNr += gap;
    }

    newLineNr = start;
    for( var i=0; i<p.length; i++) {
        var line = p[ i ];
        var lRec = this.rebuildLineString( newLineNr, line[2], true, renumbering, true );

        line[0] = newLineNr;
        line[1] = lRec.commands;
        line[2] = lRec.raw.trim();

        newLineNr += gap;
    }
  }

  compressProgram() {
    //var p = this.program;

    //for( var i=0; i<p.length; i++) {
    //    var line = p[ i ];
    //
    //   var lRec = this.rebuildLineString( line[0], line[2], true, undefined, false );
    //
    //    line[1] = lRec.commands;
    //    line[2] = lRec.raw;
    //
    //}
  }

  normalizeProgram() {
    var p = this.program;

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];

        var lRec = this.rebuildLineString( line[0], line[2], true, undefined, true );

        line[1] = lRec.commands;
        line[2] = lRec.raw;

    }
  }

  clrPGM() {
    this.vars = [];
    this.functions = [];
    this.restoreDataPtr();
  }

  restoreDataPtr() {
    this.dataPointer = 0;
  }

  runPGM() {

    if( this.startAsGoto ) {
        this.startAsGoto = false;

        var bak1 = this.runPointer;
        var bak2 = this.runPointer2;

        this.runPGM();

        this.runPointer = bak1;
        this.runPointer2 = bak2;


        return;
    }


    var c = this.console;
    var p = this.program;
    this.data = [];
    this.dataPointer = 0;
    this.gosubReturn = [];
    this.vars = [];
    this.functions = [];

    for( var i=0; i<p.length; i++) {

        var line = p[ i ];
        var commands = line[1];

        for( var j=0; j<commands.length; j++) {

          var command = commands[j];

          if( command.type  == "control" && command.controlKW == "data") {
            for( var k=0; k<command.params.length; k++) {
              this.data.push( command.params[k] );
            }
          }
        }
    }

    if( this.debugFlag ) {
      console.log("data dump:",this.data);
    }


    if( this.program.length > 0) {
      this.runFlag = true;
      this.inputFlag = false;
      c.clearCursor();
      this.runPointer = 0;
      this.runPointer2 = 0;
    }
  }


  doForInit( from, to, step, varName, cmdPointer, cmdArrayLen, linePointersLen ) {

    var ctx = this.forContext;

    if( this.vars[ varName ] === undefined ) {
      this.vars[ varName ] = 0;
    }
    this.vars[ varName ] = this.evalExpression( from );

    ctx.default.push( varName );
    ctx[varName] = {};

    var ctxv = ctx[varName];
    ctxv.to = this.evalExpression( to );

    if( step == null ) {
        ctxv.step = 1;
    }
    else {
      ctxv.step = this.evalExpression( step );
    }

    ctxv.jumpTo =
      { line: this.runPointer,
        cmdPointer: cmdPointer+1 }
    if( ctxv.jumpTo.cmdPointer >= cmdArrayLen )  {

      if( this.runPointer == -1) {
        throw "Cannot find command after for";
      }
      else {
        if( ( this.runPointer + 1) >= linePointersLen ) {
          throw "Cannot find command after for, on next line";
        }
        ctxv.jumpTo.line++;
        ctxv.jumpTo.cmdPointer = 0;
      }
    }

  }

  doForNext( nextVarName ) {
    var ctx = this.forContext;
    if( ctx.default.length == 0 ) {
      this.printError("next without for");
    }
    var varName = ctx.default[ctx.default.length-1];
    if( nextVarName  != null ) {
      varName = nextVarName;
    }

    var ctxv = ctx[varName];

    this.vars[ varName ] += ctxv.step;
    if( ctxv.step > 0) {
      if(this.vars[ varName ]<=ctxv.to) {

        return ctxv.jumpTo;
      }
    }
    else if( ctxv.step == 0) {
      return ctxv.jumpTo;
    }
    else {
      if(this.vars[ varName ]>=ctxv.to) {
        return ctxv.jumpTo;
      }
    }

    ctx.default.pop();
    return -1;
  }

  onLineStr() {
    if( this.runFlag ) {
      if( this.runPointer > -1 ) {

        var line = this.program[this.runPointer];
        return " in " + line[0];
      }
    }
    else {
      if( this["parseLineNumber"] === undefined ) {
        return "";
      }
      if( this.parseLineNumber == -1) { return ""; }
      return " in " + this.parseLineNumber;
    }
    return "";
  }


  commandToString( cmd ) {
    if( cmd.type == "control" )  {
      return cmd.controlKW.toUpperCase();
    }
    else if( cmd.type == "call" ) {
      return cmd.statementName;
    }
    else if( cmd.type == "assignment" )  {
      return "assign ->" + cmd.var;
    }
    return "????";
  }

  runCommands( cmds, limit ) {
    /* return values
      false -> error or end program
      true  -> executed ok

      should return
      end_w_error
      terminate_program
      line_finished
      goto_gosub
    */

    var commands = this.commands;
    var ecommands = this.extendedcommands;
    var EXPR = 0, PAR = 1;

    /*return values*/
    var END_W_ERROR = 0;
    var TERMINATE_PROGRAM = -1;
    var LINE_FINISHED = 10;
    var MIDLINE_INTERUPT = 20;
    var TERMINATE_W_JUMP = 30;
    var PAUSE_F_INPUT = 40;

    var end = cmds.length;
    var i=this.runPointer2;
    var cnt=0;

    if(!(limit == undefined )) {
      //nothing
    }
    else {
      limit = 9999; //reaching to infinite (max on line maybe  40)
    }



    while( i<end && cnt<limit ) {


      if( this.breakCycleFlag ) {
        if(!(limit == undefined )) {
          this.breakCycleFlag = false;
          break;
        }
      }

      var cmd=cmds[i];

      var l=this.program[this.runPointer];

      //if( this.runPointer > -1 ) {
      //  console.log( l[0] + "(" + this.runPointer + ":" + i +")" + this.commandToString( cmd ) );
      //}

      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "end" ) {
          return [TERMINATE_PROGRAM,i+1,cnt+1];
        }
        else if( cn == "stop" ) {
          this.printInfo("break");
          return [TERMINATE_PROGRAM,i+1,cnt+1];
        }
        else if( cn == "gosub" ) {
          this.gosub( cmd.params[0], i );
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "on" ) {
          var onCommand = cmd.params[ 0 ];
          var onExpr = cmd.params[ 1 ];
          var onLineNrs = cmd.params[ 2 ];

          var value = this.evalExpression( onExpr );
          if( (value-1)>=0 && (value-1)<onLineNrs.length ) {
            if( onCommand == "goto" ) {
              this.goto( onLineNrs[ (value-1) ] );
              return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
            else if( onCommand == "gosub" ) {
              this.gosub( onLineNrs[ (value-1) ], i );
              return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
          }

          //if not jumping, do nothing
        }
        else if( cn == "return" ) {
          this.doReturn();
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "if" ) {
          var IF_ERROR = -1;
          var IF_TRUE = 1;
          var IF_FALSE = 0;

          var ifresult = this.evalExpression( cmd.params[0] );
          if( ifresult != IF_FALSE ) {
             //return [MIDLINE_INTERUPT,i+1];
          }
          else  {
             return [LINE_FINISHED,i+1,cnt+1];
          }
        }
        else if( cn == "data" ) {
          //Nothing
        }
        else if( cn == "rem" ) {
          return [LINE_FINISHED,i+1,cnt+1];
        }
        else if( cn == "for:init" ) {
          this.doForInit( cmd.params[0], cmd.params[1], cmd.params[2], cmd.variable, i, cmds.length );
        }
        else if( cn == "for:next" ) {

          var jump = this.doForNext( cmd.nextVar );

          if( !(jump === -1 ) ) {

            if( jump.line != -1 ) {
                if( this.runPointer == jump.line ) {
                  i = jump.cmdPointer;
                  cnt++;
                  continue;
                }
                else {
                  this.runPointer = jump.line;
                  this.runPointer2 = jump.cmdPointer;
                }
                return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
            else {
              i = jump.cmdPointer;
              cnt++;
              continue;
            }
          }
        }
        else if( cn == "dim" ) {
          var vars = this.vars;

          for( var ix=0; ix<cmd.params.length; ix++) {

            var indices = [];
            for( var ai=0;ai<cmd.params[ix].length;ai++){
              indices[ai] = this.evalExpression( cmd.params[ix][ai] );
            }

            var arrRec = new BasicArray( cmd.arrayNames[ix], indices, 0 );

            var varIntName = "@array_" + cmd.arrayNames[ix];

            if( ! ( this.vars[ varIntName ] === undefined )) {
              this.printError( "redim'd array" );
              return [END_W_ERROR,i+1,cnt+1];
            }
            this.vars[ varIntName ] = arrRec;
          }

        }
        else if( cn == "def" ) {
          this.functions[ cmd.params[0] ] = {
            par: cmd.params[1],
            expr: cmd.params[2]
          };
        }
        else {
          this.printError( "illegal ctrl token '" + cn  +"'");
          return [END_W_ERROR,i+1,cnt+1];
        }
      }
      else if( cmd.type == "call" )  {
        var values = [];
        var pardefs = [];
        var mycommands = commands;

        var stc = mycommands[ "_stat_" + cmd.statementName.toLowerCase()];

        if( stc === undefined ) {
          //cmd.statementName.toLowerCase().startsWith("x") )
          mycommands = ecommands;

          stc = mycommands[ "_stat_" + cmd.statementName.toLowerCase()];

          if( stc === undefined ) { }
          else {
            if( mycommands.enabled == false &&
              cmd.statementName.toLowerCase() != "xon") {
                  this.printError( "extended not enabled" );
                  return [END_W_ERROR,i+1,cnt+1];
            }
          }
        }

        var intf = mycommands[ "_if_" + cmd.statementName.toLowerCase()];
        if( !( intf === undefined ) ) {
            pardefs = mycommands[ "_if_" + cmd.statementName.toLowerCase()]();
        }
        else {
          for( var j=0; j<cmd.params.length; j++) {
            pardefs[j] = EXPR;
          }
        }

        for( var j=0; j<cmd.params.length; j++) {
          if( pardefs[j] == EXPR ) {

            var p = this.evalExpression( cmd.params[j] );  //NOTE this one gets the trailing ;, from a "PRINT ;" command

            if( p != null ) {
              values.push( { type: "value", value: p } );
            }
          }
          else if( pardefs[j] == PAR ) {
            var varName = cmd.params[j].parts[0].data;
            var varType = "num";
            if( varName.indexOf("$") > -1) {
              varType = "str";
            }

            values.push( { type: "var", value: varName, varType: varType } );
          }
          else { /*RAW*/
            //values.push( cmd.params[j].parts );
            values.push( cmd.params[j] );

          }
        }
        try {
          //var stc = ;
          if( stc === undefined ) {
            this.printError("syntax");
            return [END_W_ERROR,i+1,cnt+1];
          }
          else {
              mycommands[ "_stat_" + cmd.statementName.toLowerCase()]( values );
              if( this.inputFlag ) {
                return [PAUSE_F_INPUT,i+1,cnt+1];
              }
          }

        }
        catch ( e ) {
          console.log(e);
          var done=false;
          if( (typeof e) == "string" ) {
            if( e.startsWith("@") ) {
              this.printError(e.substr(1));
              done=true;
            }
          }
          if(!done ) {
            this.printError("unexpected");
          }
          return [END_W_ERROR,i+1,cnt];
        }
      }
      else if( cmd.type == "assignment" )  {
        if( cmd.arrayAssignment ) {
          var varIntName = "@array_" + cmd.var;
          if( this.vars[ varIntName ] === undefined ) {
            this.printError("bad subscript");
            return [END_W_ERROR,i+1,cnt];
          }

          var arr = this.vars[ varIntName ];
          if( cmd.indices.length != arr.getIndexCount() ) {
            this.printError("bad subscript");
            return [END_W_ERROR,i+1,cnt];
          }

          var indices = [];
          for( var ai=0;ai<cmd.indices.length;ai++){
            indices[ai] = this.evalExpression( cmd.indices[ai] );
          }
          arr.set( indices, this.evalExpression( cmd.expression ) );
        }
        else { //single var (not an array)
          if( this.vars[ cmd.var ] === undefined ) {
            if(cmd.var.startsWith("TI")) {
              this.printError("syntax");
              return [END_W_ERROR,i+1,cnt+1];
            }
            this.vars[ cmd.var ] = 0;
          }
          this.vars[ cmd.var ] = this.evalExpression( cmd.expression );
        }
      }
      //cnt++;
      i++;
      cnt++;
    }

    if( i== cmds.length ) {
      return [LINE_FINISHED,i,cnt];
    }

    return [MIDLINE_INTERUPT,i,cnt];

  }

  setVar( a, b ) {
    this.vars[ a ] = b;
  }

  old( linenr ) {
    this.program = this.oldProgram;
  }

  new( linenr ) {
    this.oldProgram = this.program ;
    this.program = [];
  }

  removePgmLine( linenr ) {

    var pgm2 = [];

    for( var i=0; i<this.program.length; i++) {
      var pl=this.program[i];
      if( pl[0] != linenr ) {
        pgm2.push(pl);
      }
    }
    this.program = pgm2;

  }

  createDisk() {
    if( !this.confirmCookies() ) {
      return null;
    }

    this.vDisks.createDisk();
  }

  setDiskLabel( label ) {
    if( !this.confirmCookies() ) {
      return null;
    }
    var dir = this.vDisks.getDir();
    dir.title = label;
    this.vDisks.setDir( dir );
  }

  deleteFile( fn ) {
    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.deleteFile( fn );
  }

  getDisks() {
    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.getDisks();
  }

  selectDisk( id ) {
    if( !this.confirmCookies() ) {
      return null;
    }

    this.vDisks.selectDisk( id );
  }

  getDir() {
    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.getDir();
  }

  setDir( dir ) {

    if( !this.confirmCookies() ) {
      return;
    }

    this.vDisks.setDir( dir );
  }

  formatDisk() {
    if( !this.confirmCookies() ) {
      return null;
    }

    this.vDisks.formatDisk();
  }

  loadDir() {

    if( !this.confirmCookies() ) {
      return;
    }

    var dir = this.getDir();
    var row;

    this.program=[];
    this.program.push([null,null,"0 \u0012\""+dir.title+"          \"\u0092 00 2A"]);
    for( var i=0; i<dir.files.length; i++) {

      row = this.padSpaces6( dir.files[i].size ) +" \"" + dir.files[i].fname + "\"";
      this.program.push([null,null,row]);
    }

    row = dir.free +" slots free.".toUpperCase();
    this.program.push([null,null,row]);

  }

  padSpaces6( no ) {
    var s = no + "";
    for(var i=s.length; i<6; i++) {
      s+=" ";
    }
    return s;
  }

  padSpaces8( no ) {
    var s = no + "";
    for(var i=s.length; i<8; i++) {
      s+=" ";
    }
    return s;
  }

  updateDir( fileName, programLen ) {

    if( !this.confirmCookies() ) {
      return;
    }

    this.vDisks.updateDir( fileName, programLen );
  }



  saveSerializedData( fileName0, serializedData, type, len ) {

    if( !this.confirmCookies() ) {
      return;
    }

    var fileName = "default";


    if( this.debugFlag ) {
      console.log( "saving..." );
      console.log( this.program );
    }


    if( fileName0 ) {
      fileName = fileName0;
    }

    this.vDisks.saveFile( fileName, serializedData , type, len );


    return true;
  }

  save( fileName0 ) {

    if( !this.confirmCookies() ) {
      return;
    }

    var fileName = "default";

    if( this.debugFlag ) {
      console.log( "saving..." );
      console.log( this.program );
    }

    if( fileName0 ) {
      fileName = fileName0;
    }

    this.vDisks.saveFile( fileName, JSON.stringify( this.program ), "bas", this.program.length );


  }

  loadContainer( container ) {

    if( container == null ) {
      this.program=[];
      return false;
    }

    this.program = null;

    if( container.type == "bas") {

      this.program = JSON.parse( container.data );
      var p = new Parser( this.commands, this.extendedcommands );
      p.init();

      if( this.program != null ) {
        for( i=0; i<this.program.length;i++) {
          var l = p.parseLine( this.program[i][2] );
          this.program[i][1] = l.commands;
        }
      }
    }
    else if( container.type == "snp") {

      var state = JSON.parse( container.data );
      if( !(state.pgm === undefined) ) {
          this.program = state.pgm;
          this.setProgramState( state.pgmState );
          this.console.setState( state.console );
      }
      else {
        throw "error loading snapshot " + fileName;
      }

    }

    if( this.program != null ) {
      var p = this.program;
      for( var i=0; i<p.length; i++) {
        if( p[i] == null ) {
          delete p[i];
        }
      }
      return [true, container.type == "snp" ];
    }
    return false;
  }

  load( fileName ) {

    if( !this.confirmCookies() ) {
      return false;
    }

    if( fileName == "$" ) {
      this.loadDir();
      return [true,false];
    }
    else if( fileName == "*" ) {
      return this.load( null );
    }

    var container = this.vDisks.loadFile( fileName );

    return this.loadContainer( container );

  }

  setScale( xy ) {

    if( xy === null ) {
        this.console.rescale( this.initScale, this.initScale );
        return;
    }
    this.console.rescale( xy, xy );

  }


  getVirtualDisk() {

    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.getFullDisk();

  }

  createDiskFromImage( name, image ) {

    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.createDiskFromImage( name, image );

  }

  insertPgmLine( linenr, commands, raw ) {

    this.insertPgmLineLocal( linenr, commands, raw, this.program );
  }

  insertPgmLineLocal( linenr, commands, raw, myProgram ) {

    for( var i=0; i<myProgram.length; i++) {
      var pl=myProgram[i];
      if( pl[0] == linenr ) {
        myProgram[i] = [linenr, commands, raw ];
        return;
      }
    }

    myProgram.push( [linenr, commands, raw ]);

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    myProgram.sort( sortF );

  }

  enableExtended( flag ) {
    if( flag ) {
      this.extendedcommands._stat_xon( undefined );
    }
    else {
      this.extendedcommands._stat_xoff( undefined );
    }
  }

  textLinesToBas( lines ) {

    var myProgram = [];

    if( this.debugFlag ) {
      console.log( "textLinesToBas" );
    }
    for( var i = 0; i<lines.length; i++ ) {

      var line = this.prepareLineForImport( lines[ i ] );
      var p = new Parser( this.commands, this.extendedcommands );
      p.init();
      //if( line.length > 80 ) {  TODO move this check into the parser
      //  throw "Line to long " + line;
      //}
      var l = p.parseLine( line );
      if( l == null ) {
        continue;
      }
      if( l.lineNumber != -1 ) {
        if( l.commands.length > 0) {
          this.insertPgmLineLocal( l.lineNumber, l.commands, l.raw, myProgram);
          //this.program[ l.lineNumber ] = [l.commands,l.raw];
        }
        else {
          throw "Error, no commands on line " + l.lineNumber;
        }
      }
      else {
        throw "Error, command must start with number to be part of program";
      }

      if( this.debugFlag ) {
        console.log("program:",myProgram);
        console.log("Line: ", l );
      }
    }
    return myProgram;
  }

  printReady() {
    this.printLine("ready.");
  }


  startConsoleDataInput( vars ) {

    if( this.debugFlag ) {
      console.log("inputvars=",vars);
    }
    this.inputFlag = true;
    this.inputVars = vars;
    this.inputVarsPointer = 0;
    this.sendChars( "? " , false);
  }

  handleLineInput( str, isInputCommand ) {

    if( this.debugFlag ) {
      console.log("handleLineInput: start debug / isInputCommand=" + isInputCommand + " -------------");
    }

    if( isInputCommand ) {

        var input=str;
        var qMark = input.indexOf("?");
        while( qMark > -1 ) {
          input = input.substr(qMark+2);
          qMark = input.indexOf("?");
        }

        if( this.debugFlag ) {
          console.log("handleLineInput: start debug / input, name -------------");
          console.log( "InputVarsPointer:" , this.inputVarsPointer );
          console.log( "InputVars:" , this.inputVars );

          console.log( "Input String:" ,input );
          console.log( "Input Vars[current]:" ,this.inputVars[ this.inputVarsPointer ] );
        }


        var vName = this.inputVars[ this.inputVarsPointer ];
        if( vName.indexOf("$") >-1 ) {
            this.setVar( this.inputVars[ this.inputVarsPointer ], input.trim() );
        }
        else {
          var num = parseFloat( input.trim() );

          if( isNaN( num ) ) {
            this.printLine("?redo from start");
            this.sendChars( "? " , false);
            return;
          }
          this.setVar( this.inputVars[ this.inputVarsPointer ], num );
        }

        this.inputVarsPointer++;
        if( this.inputVarsPointer >= this.inputVars.length ) {

          this.exitInputState();
        }
        else {
          this.sendChars( "?? " , false);
        }

        if( this.debugFlag ) {
          console.log("handleLineInput: end debug -------------");
        }
        return;
    }

    if( this.debugFlag ) {
      console.log( str );
    }
    var p = new Parser( this.commands, this.extendedcommands );
    p.init();
    try {
      var l = p.parseLine( str );

    }
    catch( e ) {

      this.parseLineNumber = -1;
      if( this.errorHandler.isError( e ) ) {
        this.parseLineNumber = e.lineNr;
      }
      this.printError( "syntax" );
      this.printLine("ready.");
    }
    if( l == null ) {
      if( this.debugFlag ) {
        console.log("handleLineInput: end debug -------------");
      }
      return;
    }
    if( l.lineNumber != -1 ) {
      if( l.commands.length > 0) {
        this.insertPgmLine( l.lineNumber, l.commands, l.raw);
        //this.program[ l.lineNumber ] = [l.commands,l.raw];
      }
      else {
        this.removePgmLine( l.lineNumber  );
      }
    }
    else {
      this.runPointer = -1;
      this.runPointer2 = 0;
      this.runCommands( l.commands );
      if( ! this.runFlag ) {
        this.printLine("ready.");
      }

    }

    if( this.debugFlag ) {
      console.log("program:",this.program);
      console.log("Line: ", l );

      console.log("handleLineInput: end debug -------------");
    }
  }

}
