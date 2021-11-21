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
    this.saveCount = 0;
    this.kbBuffer = [];

    this.forContext = {}


    var json = localStorage.getItem('w64Settings');
    this.settings = JSON.parse( json );
    if(this.settings == null ) {
      this.settings={ cookies: false };
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
      if( a == 1) {

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
      else if( a>53247 && a<53295) {

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
        var c = b%256;

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
    this.console.writeString( "?" + s + " error", true );
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


  evalExpressionPart( p ) {
    var val=0;

    if( p.type=="num" ) {
      val = parseInt(p.data);
    }
    else if( p.type=="str" ) {
      val = p.data;
    }
    else if( p.type=="var" ) {
      val = this.vars[ p.data ];
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
        var stc = commands[ p.functionName];
        if( stc === undefined ) {
          this.printError("syntax");
        }
        else {
            val = commands[ p.functionName]( values );
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

    if( !this.runFlag ) {
      if(this.cursorCount++>15) {
        this.cursorCount = 0;

        c.blinkCursor();
      }
    }
    else {

      var p = this.program;

      for( var cyc=0; cyc<5; cyc++) {
        var l = p[ this.runPointer ];

        //console.log("line:",l);
        this.runCommands( l[1] );
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
          console.log("command", command);

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
      this.gotoFlag = false;
    }
  }

  doIf( a,b,comp,block ) {

    if( comp == "=" ) {
      if( this.evalExpression(a) == this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }
    else if( comp == "<" ) {
      if( this.evalExpression(a) < this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }
    else if( comp == ">" ) {
      if( this.evalExpression(a) > this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }
    else if( comp == "<=" ) {
      if( this.evalExpression(a) <= this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }
    else if( comp == ">=" ) {
      if( this.evalExpression(a) >= this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }
    else if( comp == "<>" ) {
      if( this.evalExpression(a) != this.evalExpression(b) ) {
        this.runCommands( block );
      }
    }

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
        ctxv.cmdPointer = 0;
      }
    }

    console.log("ctxv:", ctxv);
    console.log("var:"+varName + " set to " + this.vars[ varName ]);
  }

  doForNext() {
    var ctx = this.forContext;
    var varName = ctx.default;

    var ctxv = ctx[varName];

    this.vars[ varName ] += ctxv.step;
    if( ctxv.step > 0) {
      if(this.vars[ varName ]<=ctxv.to) {
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

  runCommands( cmds ) {
    var commands = this.commands;
    var EXPR = 0, PAR = 1;

    var end = cmds.length;
    var i=0;
    while( i<end ) {
      var cmd=cmds[i];
      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
        }
        else if( cn == "if" ) {
          this.doIf( cmd.params[0], cmd.params[1], cmd.comp, cmd.block );
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
                  this.gotoFlag = true;
                }
                return;
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
            //console.log(p);
            values.push( { type: "value", value: p } );
          }
          else {

            var varName = cmd.params[0].parts[0].data;
            var varType = "num";
            if( varName.indexOf("$") > -1) {
              varType = "str";
            }

            values.push( { type: "var", value: varName, varType: varType } );
          }
        }
        try {
          var stc = commands[ "_stat_" + cmd.statementName];
          if( stc === undefined ) {
            this.printError("syntax");
          }
          else {
              commands[ "_stat_" + cmd.statementName]( values );
          }

        }
        catch ( e ) {
          console.log(e);
          this.printError("unexpected");
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

  }

  setVar( a, b ) {
    this.vars[ a ] = b;
  }

  insertPgmLine( linenr, commands, raw ) {

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
    //this.autoSave();

  }

  new( linenr ) {

    this.program = [];
    //this.autoSave();
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
    //this.autoSave();
  }

  getDir() {
    var storageName =  "w64AutoSav_dir";
    var json = localStorage.getItem( storageName );
    var dir = JSON.parse( json );

    var title = "0 \u0012\"VDisk          \"\u0092 00 2A"
    if(!json) {
      return {files:[], title: title };
    }
    dir.title = title;
    dir.free = 32-dir.files.length;
    return dir;

  }

  setDir( dir ) {
    var storageName =  "w64AutoSav_dir";

    localStorage.setItem(storageName, JSON.stringify( dir ) );

  }


  loadDir() {
    var dir = this.getDir();
    var row;

    this.program=[];
    this.program.push([null,null,dir.title]);
    for( var i=0; i<dir.files.length; i++) {

      row = dir.files[i].size +"     \"" + dir.files[i].fname + "\"";
      this.program.push([null,null,row]);
    }

    row = dir.free +" slots free.";
    this.program.push([null,null,row]);

    var tmp=2;

  }


  updateDir( fileName, programLen ) {
    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      dir.files[i].size = programLen;
    }
    else {
      dir.files.push( {fname: fileName, size: programLen } );
    }
    this.setDir(dir);
  }

  save( fileName0 ) {
    var myStorage = window.localStorage;
    var fileName = "default.prg";

    if( this.saveCount == 0 && this.settings.cookies == false) {
      this.printLine("!warning");
      this.printLine("!save will use cookies or local storage");
      this.printLine("!type save again to agree");
      this.saveCount++;

      return;
    }
    console.log( "saving..." );
    console.log( this.program );


    if( fileName0 ) {
      fileName = fileName0;
    }

    var storageName = 'w64AutoSav_'+fileName;

    //save pgm
    localStorage.setItem(storageName, JSON.stringify( this.program ) );

    this.updateDir( fileName, this.program.length );

    //save settings
    if( this.saveCount == 1 && this.settings.cookies == false) {
      this.settings.cookies = true;
      localStorage.setItem('w64Settings', JSON.stringify( this.settings ) );
    }
    this.saveCount++;

  }

  load( fileName ) {

    if( fileName == "$" ) {
      this.loadDir();
      return true;
    }
    else if( fileName == "*" ) {
      return this.load( null );
    }

    var storageName = 'w64AutoSav_default';
    if( fileName ) {
      storageName =  "w64AutoSav_" + fileName;
    }

    var json = localStorage.getItem( storageName );
    this.program = JSON.parse( json );
    if( json == null ) {
      this.program=[];
      return false;
    }
    var p = this.program;
    for( var i=0; i<p.length; i++) {
      if( p[i] == null ) {
        delete p[i];
      }
    }
    return true;
  }


  getVirtualDisk() {
    var dir = this.getDir();
    var content = [];

    for( var i=0; i<dir.files.length; i++) {
        var fileName = dir.files[i].fname;
        var storageName =  "w64AutoSav_" + fileName;
        var json = localStorage.getItem( storageName );
        content.push( { fname: fileName ,content: json} );
    }

    var disk = {
      dir: dir,
      content: content
    };

    var diskStr = JSON.stringify( disk );

    console.log( diskStr );

    return diskStr;
  }

  handleLineInput( str ) {
    var p = new Parser( this.commands );
    p.init();
    var l = p.parseLine( str );
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
      this.runCommands( l.commands );
      if( ! this.runFlag ) {
        this.printLine("ready.");
      }

    }

    console.log("program:",this.program);
    console.log("Line: ", l );
  }

}
