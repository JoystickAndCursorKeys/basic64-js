class BasicContext {

  constructor( console ) {
    this.console = console;
    this.menu = new Menu( console, this  );
    this.menuFocus = false;
    this.program = [];
    this.cursorCount = 0;
    this.runFlag = false;

    var ctx = this.context;
    var c = this.console;
    this.commands = new BasicCommands( this );
    this.vars = [];
    this.data = [];
    this.kbBuffer = [];

    this.forContext = {}

    this.vDisks = new VDisk( );

    var json = localStorage.getItem('BJ64_Settings');
    if(json!=null) {
        this.settings = JSON.parse( json );
    }
    else {
      this.settings = {}
      this.settings.cookies = false;
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


  }


  setProgram( pgm ) {
    this.program = pgm;
    this.runFlag = false;
    this.console.clearCursor();
  }

  getProgram() {
    return this.program;
  }

  getProgramState() {
    return {
      runFlag: this.runFlag,
      vars: this.vars,
      forContext: this.forContext,
      runPointer: this.runPointer,
      runPointer2: this.runPointer2
    }
  }

  setProgramState( pgmState ) {
      this.runFlag = pgmState.runFlag;
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

    this.console.writeString( "?" + s + " error" + this.onLineStr(), true );

  }

  printLine( s ) {
    this.sendChars(s, true);
    this.reverseOn = false;
  }

  print( s ) {
    this.sendChars(s, false);
    this.reverseOn = false;
  }

  sendChars( s, newline ) {

    for( var i=0; i< s.length; i++) {
      var c=s.charCodeAt( i );

      if( c<32 || c>128) {
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

  reset( hard ) {
    this.console.clearScreen();
    this.vpoke(53280,14);
    this.vpoke(53281,6);
    this.vpoke(53269,0);
    this.vpoke(53270,200);
    this.vpoke(53272,21);
    this.vpoke(53265,155);
    this.console.setColor(14);

    this.printLine("");
    if( hard ) {
      this.printLine(" **** commodore 64 basic emulator ****");
      this.printLine("");
      this.printLine("  **** basic64/js - f9 = menu ****");
      this.printLine("");
    }
    this.printLine("ready.");
  }

  getProgramAsText() {
    var text = "";
    for (const l of this.program)
      {
        if( text != "") {
          text += "\n";
        }
        text +=  l[2].trim() ;
      }
    return text;
  }

  getProgramLines() {

    return this.program;
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
      val = this.vars[ p.data ];
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
        var nFunName = p.functionName.replaceAll("$","_DLR_");

        var stc = commands[ nFunName ];
        if( stc === undefined ) {
          this.printError("no such function " + p.functionName);
          console.log("Cannot find functionName " + nFunName );
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
        val /= this.evalExpressionPart( p );
      }
      else if( p.op == ";" ) {
        val += ("" + this.evalExpressionPart( p ));
      }
      else if( p.op == "or"  ) {
          val |= this.evalExpressionPart( p );
          console.log("or");
      }
      else if( p.op == "and"  ) {
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
    return val;
  }

  cycle() {
    var c = this.console;

    if( !this.runFlag || this.menuFocus ) {
      if(this.cursorCount++>15) {
        this.cursorCount = 0;

        if( !this.menuFocus ) { c.blinkCursor(); }
      }
    }
    else {

      var p = this.program;

      for( var cyc=0; cyc<5; cyc++) {

        var l = p[ this.runPointer ];

        //console.log("line:",l);
        var rv = this.runCommands( l[1] );
        //console.log("rv:",rv);
        if( !rv ) {
          this.runFlag = false;
          this.printLine("ready.");
          return;
        }
        if( !this.gotoFlag) {
          this.runPointer ++;
          if( this.runPointer >=  p.length ) {
            console.log( "end program");
            this.runFlag = false;
            c.clearCursor();
            this.printLine("ready.");
            break;
          }
        }
        else {
          this.gotoFlag = false;
        }
      }
    }

  }

  goto( line ) {

    var pgm = this.program;
    var len=this.program.length;

    for( var i=0; i<len; i++) {
      var l = pgm[i];

      if( l[0] == line ) {
        this.runPointer = i;
        this.runPointer2 = 0;

        this.gotoFlag = true;
        return;
      }
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

    var p = new Parser( this.commands );
    p.init();

    var tokens = p.getTokens( raw, false, false );

    if( ! ( renumbering === undefined )) {

      var foundGoto = false;
      for( i = 0; i<tokens.length; i++) {
        if( tokens[i].type == "name" && tokens[i].data == "goto" ) {
          foundGoto = true;
        }
        if( tokens[i].type == "num" && foundGoto ) {
          var newLine = renumbering[ "old_" + tokens[i].data ];
          tokens[i].data =newLine;
          foundGoto = false;
        }
      }
    }
    tokens[0].data = nr;
    var newString = nr + " " ;
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

  runPGM() {
    var c = this.console;
    var p = this.program;
    this.data = [];
    this.dataPointer = 0;

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
      c.clearCursor();
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.gotoFlag = false;
    }
  }

  doIf( a,b,comp,block ) {

    if( a==null || b == null || comp == null || block == null ) {
      return false;
    }
    var rv = true;
    if( comp == "=" ) {
      if( this.evalExpression(a) == this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    else if( comp == "<" ) {
      if( this.evalExpression(a) < this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    else if( comp == ">" ) {
      if( this.evalExpression(a) > this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    else if( comp == "<=" ) {
      if( this.evalExpression(a) <= this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    else if( comp == ">=" ) {
      if( this.evalExpression(a) >= this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    else if( comp == "<>" ) {
      if( this.evalExpression(a) != this.evalExpression(b) ) {
        rv = this.runCommands( block );
      }
    }
    return rv;
  }


  doForInit( from, to, step, varName, cmdPointer, cmdArrayLen, linePointersLen ) {

    var ctx = this.forContext;

    if( this.vars[ varName ] === undefined ) {
      this.vars[ varName ] = 0;
    }
    this.vars[ varName ] = this.evalExpression( from );

    ctx.default = varName;
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

  doForNext() {
    var ctx = this.forContext;
    var varName = ctx.default;

    var ctxv = ctx[varName];

    this.vars[ varName ] += ctxv.step;
    if( ctxv.step > 0) {
      if(this.vars[ varName ]<=ctxv.to) {
        //console.log( "Next: " , ctxv.jumpTo );
        return ctxv.jumpTo;
      }
    }
    else if( ctxv.step == 0) {
      throw "Step 0 not supported"
    }
    else {
      if(this.vars[ varName ]>=ctxv.to) {
        return ctxv.jumpTo;
      }
    }
    return -1;
  }

  onLineStr() {
    if( this.runPointer > -1 ) {

      var line = this.program[this.runPointer];
      return " in " + line[0];
    }
    return "";
  }

  runCommands( cmds ) {
    var commands = this.commands;
    var EXPR = 0, PAR = 1;

    var end = cmds.length;
    var i=this.runPointer2;
    while( i<end ) {
      var cmd=cmds[i];
      //console.log( cmd );
      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
        }
        else if( cn == "if" ) {
          var rv = this.doIf( cmd.params[0], cmd.params[1], cmd.comp, cmd.block );
          if( !rv ) {
            this.printError("syntax");
            return false;
          }
        }
        else if( cn == "data" ) {
          //Nothing
        }
        else if( cn == "for:init" ) {
          this.doForInit( cmd.params[0], cmd.params[1], cmd.params[2], cmd.variable, i, cmds.length );
        }
        else if( cn == "for:next" ) {
          var jump = this.doForNext();
          if( !(jump === -1 ) ) {

            if( jump.line != -1 ) {
                if( this.runPointer == jump.line ) {
                  i = jump.cmdPointer;
                  continue;
                }
                else {
                  this.runPointer = jump.line;
                  this.runPointer2 = jump.cmdPointer;
                  this.gotoFlag = true;
                }
                return true;
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

        var intf = commands[ "_if_" + cmd.statementName];
        if( !( intf === undefined ) ) {
            pardefs = commands[ "_if_" + cmd.statementName]();
        }
        else {
          for( var j=0; j<cmd.params.length; j++) {
            pardefs[j] = EXPR;
          }
        }

        for( var j=0; j<cmd.params.length; j++) {
          if( pardefs[j] == EXPR ) {
            var p = this.evalExpression( cmd.params[j] );
            //console.log("p",p);
            if( p != null ) {
              values.push( { type: "value", value: p } );
            }
          }
          else if( pardefs[j] == PAR ) {
            var varName = cmd.params[0].parts[0].data;
            var varType = "num";
            if( varName.indexOf("$") > -1) {
              varType = "str";
            }

            values.push( { type: "var", value: varName, varType: varType } );
          }
          else { /*RAW*/
            values.push( cmd.params[j].parts );
          }
        }
        try {
          var stc = commands[ "_stat_" + cmd.statementName];
          if( stc === undefined ) {
            this.printError("syntax");
            return false;
          }
          else {
              commands[ "_stat_" + cmd.statementName]( values );
          }

        }
        catch ( e ) {
          console.log(e);
          if( e=="OUT OF DATA") {
            this.printError(e);
          }
          else {
              this.printError("unexpected");
          }
          return false;
        }
      }
      else if( cmd.type == "assignment" )  {
        if( this.vars[ cmd.var ] === undefined ) {
          this.vars[ cmd.var ] = 0;
        }
        this.vars[ cmd.var ] = this.evalExpression( cmd.expression );
        //console.log("VAR("+cmd.var+")=" + this.vars[ cmd.var ]);
      }
      i++;
    }

    this.runPointer2 = 0;
    return true;

  }

  setVar( a, b ) {
    this.vars[ a ] = b;
  }



  new( linenr ) {

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

    row = dir.free +" slots free.";
    this.program.push([null,null,row]);

  }

  padSpaces6( no ) {
    var s = no + "";
    for(var i=s.length; i<6; i++) {
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

  createFullDisk( name, image ) {

    if( !this.confirmCookies() ) {
      return null;
    }

    return this.vDisks.createFullDisk( name, image );

  }

  insertPgmLine( linenr, commands, raw ) {
    /*
    for( var i=0; i<this.program.length; i++) {
      var pl=this.program[i];
      if( pl[0] == linenr ) {
        this.program[i] = [linenr, commands, raw ];
        return;
      }
    }

    this.program.push( [linenr, commands, raw ]);

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    this.program.sort( sortF );
    */

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

  textLinesToBas( lines ) {

    var myProgram = [];

    for( var i = 0; i<lines.length; i++ ) {''

      var line = lines[ i ];
      var p = new Parser( this.commands );
      p.init();
      if( line.length > 80 ) {
        throw "Line to long " + line;
      }
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

  handleLineInput( str ) {
    var p = new Parser( this.commands );
    p.init();
    try {
      var l = p.parseLine( str );
    }
    catch( e ) {
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
