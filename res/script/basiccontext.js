class BasicContext {

  constructor( console ) {
    this.console = console;
    this.menu = new Menu( console, this  );
    this.menuFocus = false;
    this.program = [];
    this.cursorCount = 0;
    this.runFlag = false;
    this.inputFlag = false;
    this.gosubReturn = [];
    this.nullTime = new Date().getTime();

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

  }

  setTurbo( on ) {
    if( on ) {
      this.cmdCountPerCycle = this.cmdCountPerCycleTurbo ;
      this.turboMode = true;
      return;
    }
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;
    this.turboMode = false;
  }

  setProgram( pgm ) {
    this.program = pgm;
    this.runFlag = false;
    this.inputFlag = false;
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
    this.inputFlag = false;
    this.console.clearCursor();
  }


  getProgram() {
    return this.program;
  }

  getProgramState() {
    return {
      runFlag: this.runFlag,
      inputFlag: this.inputFlag,
      vars: this.vars,
      forContext: this.forContext,
      runPointer: this.runPointer,
      runPointer2: this.runPointer2
    }
  }

  setProgramState( pgmState ) {
      this.runFlag = pgmState.runFlag;
      this.inputFlag = pgmState.inputFlag;
      this.vars = pgmState.vars;
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


  poke( a, b ) {
/*      var addr = "poke_" + a;
      if( this[addr] ) {
        this[addr](b);
      }
*/

      //console.log("poke ",a,b);
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
      else if( a>53247 && a<53295) { //VIC registers

        if( this.console.getCharRomVisible() == false ) {
            this.console.vpoke( a - 53248,b%256  );
        }
        else {
          //Can't poke in ROM
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
      else {
        this.console.poke( a, b);
      }
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

  clearScreen() {
    this.console.clearScreen();
    this.console.cursorHome();
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
          console.log("reverse");
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
    console.log("Error still exist here: " + p)
    this.console.cursorX( p );
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
      //console.log(i, kw);
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
        dst += "{"+c+"}"
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
      //var c = txt.charAt( i );
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

            console.log("found ESC seq char " + String.fromCharCode( c ) );
            console.log("found ESC seq char code " + c);
            i++;
        }

        console.log("found ESC seq " + num);
        num = this.ResolveStringSymbolToCode(num.toLowerCase());
        console.log("found resolved ESC seq " + num);

        dst += String.fromCharCode( parseInt( num, 10) );
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
    console.log("dst:" + dst);
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
      if((""+p.data).indexOf(".") >= 0) {
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
        var nFunName = "_fun_" + p.functionName.toLowerCase().replaceAll("$","_DLR_");

        var stc = commands[ nFunName ];
        if( stc === undefined ) {
          this.printError("no such function " + p.functionName);
          console.log("Cannot find functionName " + nFunName );
          throw "no such function " + p.functionName;
          return null;
        }
        else {
            val = commands[ nFunName ]( values );
        }

      }
      catch ( e ) {
        console.log(e);
        this.printError("unexpected");
      }
    }

    return val;
  }

  evalExpression( expr ) {

    if( expr == null ) {
      return null;
    }

    //console.log( "parse ", expr);
    if( expr.parts.length == 0 ) {
      //console.log( "parse -> null");
      return null;
    }

    var val = this.evalExpressionPart( expr.parts[ 0 ] );

    for( var i=1; i<expr.parts.length; i++) {
      var p = expr.parts[ i ];
      if( p.op == "+" ) {
        val += this.evalExpressionPart( p );
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
          console.log("or");
      }
      else if( p.op == "AND"  ) {
          val &= this.evalExpressionPart( p );
          console.log("and");
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

  cycleToNext() { //only used after input command
    var c = this.console;
    var p = this.program;

    this.runPointer ++;
    if( this.runPointer >=  p.length ) {
      this.runFlag = false;
      c.clearCursor();
      this.printLine("");
      this.printLine("ready.");
    }
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
    var debug=false;

    try {

      if( !this.runFlag || this.menuFocus || this.inputFlag  ) {
        if(this.cursorCount++>15) {
          this.cursorCount = 0;

          if( !this.menuFocus ) { c.blinkCursor(); }
        }
      }
      else {

        if(debug) console.log("START CYCLE------------------------------" );

        var p = this.program;

        while (true) {

          if(debug)console.log("START CYCLE LOOP-------------" );
          var l = p[ this.runPointer ];
          var bf = this.runPointer2;
          if(debug)console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );
          if(debug)console.log(" cmdCount = " + cmdCount);
          var rv = this.runCommands( l[1], 1 );
          var af = rv[ 1 ];

          if( rv[0] == MIDLINE_INTERUPT) {
            this.runPointer2 = af;
          }

          var executedCount = af-bf;

          if(debug)console.log(" bf = " + bf, " af = " + af);
          if(debug)console.log(" executedCount = " + executedCount);
          if(debug)console.log(" rv = " + rv);


          cmdCount = cmdCount - executedCount;


          if( rv[0]<=0 ) {
            if(debug)console.log(" PGM END!!!!" );
            this.runFlag = false;
            this.printLine("");
            this.printLine("ready.");
            if(debug)console.log("CYCLE RETURN END");
            return;
          }
          else if( rv[0] == LINE_FINISHED ) {
            this.runPointer ++;
            this.runPointer2 = 0;
            if(debug)console.log(" new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

            if( this.runPointer >=  p.length ) {
              if(debug)console.log( "end program");
              this.runFlag = false;
              c.clearCursor();
              this.printLine("ready.");
              break;
            }
          }
          else if( rv[0] == TERMINATE_W_JUMP ) {

            if(debug)console.log(" jump to new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

          }
          else if( rv[0] == PAUSE_F_INPUT ) {

            if(debug)console.log("CYCLE PAUSE 4 INPUT");
            break;

          }

          if( cmdCount<=0 ) {
            if(debug)console.log("Breaking cmdCount=" + cmdCount)
            break;
          }

        }

        if(debug)console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

      }

    }
    catch (e) {
      this.runFlag = false;
      c.clearCursor();
      this.printError("unexpected");
      this.printLine("ready.");
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

  runStop() {
    if( this.runFlag ) {
      var c = this.console;
      this.runFlag = false;
      c.clearCursor();
      console.log("stop");
      this.printLine( "break in " + this.program[ this.runPointer ][0]);
      this.printLine( "ready.");
    }
  }

  isRunning() {
    return this.runFlag;
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

  rebuildLineString( nr, raw, removePadding, renumbering ) {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();

    var tokens = p.getTokens( raw, false, false );

    if( ! ( renumbering === undefined )) {

      var foundGoto = false;
      for( i = 0; i<tokens.length; i++) {
        if( tokens[i].type == "name" && tokens[i].data == "GOTO" ) {
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
      else {
        newString += tokens[i].data;
      }

    }

    var rec = p.parseLine( newString );
    console.log( "Renum Tokens:" , tokens );
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
        var lRec = this.rebuildLineString( newLineNr, line[2], false, renumbering );

        line[0] = newLineNr;
        line[1] = lRec.commands;
        line[2] = lRec.raw.trim();

        newLineNr += gap;
    }
  }

  compressProgram() {
    var p = this.program;

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];

        var lRec = this.rebuildLineString( line[0], line[2], true, undefined );

        line[1] = lRec.commands;
        line[2] = lRec.raw;

    }
  }

  clrPGM() {
    this.vars = [];
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
    console.log("data:",this.data);

    if( this.program.length > 0) {
      this.runFlag = true;
      this.inputFlag = false;
      c.clearCursor();
      this.runPointer = 0;
      this.runPointer2 = 0;
    }
  }

  doIf( a,b,comp ) {
    var IF_ERROR = -1;
    var IF_TRUE = 1;
    var IF_FALSE = 0;

    if( a==null || b == null || comp == null ) {
      this.printError("if expression")
      return IF_ERROR;
    }

    var result = IF_FALSE;
    if( comp == "=" ) {
      if( this.evalExpression(a) == this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    else if( comp == "<" ) {
      if( this.evalExpression(a) < this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    else if( comp == ">" ) {
      if( this.evalExpression(a) > this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    else if( comp == "<=" ) {
      if( this.evalExpression(a) <= this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    else if( comp == ">=" ) {
      if( this.evalExpression(a) >= this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    else if( comp == "<>" ) {
      if( this.evalExpression(a) != this.evalExpression(b) ) {
        result = IF_TRUE;
      }
    }
    return result;
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

    //console.log("ctxv:", ctxv);
    //console.log("var:"+varName + " set to " + this.vars[ varName ]);
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
        //console.log( "Next: " , ctxv.jumpTo );
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

    if(!(limit == undefined )) {
      console.log("RMM limit is defined");
      if( end - i > limit ) {
        console.log("RMM end:",end," i:",i," limit:",limit);
        end = i + limit;

        // end=5, i=2, limit=6 -> false
        // end=5, i=2, limit=3 -> false
        // end=5, i=2, limit=2 -> true -> end = 4
      }
    }

    while( i<end ) {
      var cmd=cmds[i];
      //console.log( cmd );
      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
          return [TERMINATE_W_JUMP,i+1];
        }
        else if( cn == "end" ) {
          return [TERMINATE_PROGRAM,i+1];
        }
        else if( cn == "stop" ) {
          this.printInfo("break");
          return [TERMINATE_PROGRAM,i+1];
        }
        else if( cn == "gosub" ) {
          this.gosub( cmd.params[0], i );
          return [TERMINATE_W_JUMP,i+1];
        }
        else if( cn == "return" ) {
          this.doReturn();
          return [TERMINATE_W_JUMP,i+1];
        }
        else if( cn == "if" ) {
          var IF_ERROR = -1;
          var IF_TRUE = 1;
          var IF_FALSE = 0;

          var ifresult = this.doIf( cmd.params[0], cmd.params[1], cmd.comp );
          if( ifresult == IF_ERROR ) {
             return [END_W_ERROR,i+1];
          }
          else if( ifresult == IF_TRUE ) {
             //return [MIDLINE_INTERUPT,i+1];
          }
          else  {
             return [LINE_FINISHED,i+1];
          }
        }
        else if( cn == "data" ) {
          //Nothing
        }
        else if( cn == "rem" ) {
          return [LINE_FINISHED,i+1];
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
                  continue;
                }
                else {
                  this.runPointer = jump.line;
                  this.runPointer2 = jump.cmdPointer;
                }
                return [TERMINATE_W_JUMP,i+1];
            }
            else {
              i = jump.cmdPointer;
              continue;
            }
          }
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
                  return [END_W_ERROR,i+1];;
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
            //console.log("p",p);
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
            return [END_W_ERROR,i+1];;
          }
          else {
              mycommands[ "_stat_" + cmd.statementName.toLowerCase()]( values );
              if( this.inputFlag ) {
                return [PAUSE_F_INPUT,i+1];
              }
          }

        }
        catch ( e ) {
          console.log(e);
          if( e.startsWith("@") ) {
            this.printError(e.substr(1));
          }
          else {
            this.printError("unexpected");
          }
          return [END_W_ERROR,i+1];
        }
      }
      else if( cmd.type == "assignment" )  {
        if( this.vars[ cmd.var ] === undefined ) {

          if(cmd.var.startsWith("TI")) {
            this.printError("syntax");
            return [END_W_ERROR,i+1];
          }
          this.vars[ cmd.var ] = 0;
        }
        this.vars[ cmd.var ] = this.evalExpression( cmd.expression );
        //console.log("VAR("+cmd.var+")=" + this.vars[ cmd.var ]);
      }
      i++;
    }

    if( i== cmds.length ) {
      return [LINE_FINISHED,i];
    }

    return [MIDLINE_INTERUPT,i];

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


    console.log( "saving..." );
    console.log( this.program );


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

    console.log( "saving..." );
    console.log( this.program );


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

      console.log("program:",myProgram);
      console.log("Line: ", l );
    }
    return myProgram;
  }

  printReady() {
    this.printLine("ready.");
  }


  startConsoleDataInput( vars ) {
    console.log("inputvars=",vars);
    this.inputFlag = true;
    this.inputVars = vars;
    this.inputVarsPointer = 0;
    this.sendChars( "? " , false);
  }

  handleLineInput( str, isInputCommand ) {

    if( isInputCommand ) {

        var input=str;
        var qMark = input.indexOf("?");
        while( qMark > -1 ) {
          input = input.substr(qMark+2);
          qMark = input.indexOf("?");
        }

        console.log("INPUT: input, name");
        console.log( this.inputVarsPointer );
        console.log( this.inputVars );

        console.log( input );
        console.log( this.inputVars[ this.inputVarsPointer ] );

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
          this.inputFlag = false;
          this.cycleToNext();
        }
        else {
          this.sendChars( "?? " , false);
        }

        return;
    }

    console.log( str );
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

    console.log("program:",this.program);
    console.log("Line: ", l );
  }

}
