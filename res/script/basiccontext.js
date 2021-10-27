class BasicContext {

  constructor( console ) {
    this.console = console;

    this.program = [];
    this.cursorCount = 0;
    this.runFlag = false;

    var ctx = this.context;
    var c = this.console;
    this.commands = new BasicCommands( this );
    this.vars = [];
    this.saveCount = 0;
    this.kbBuffer = [];

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


  }

  poke_53280( v ) { this.console.setBorderColor( v % 16 );  }
  poke_53281( v ) { this.console.setBGColor( v % 16 );  }
  vpoke(a,b) { this.console.vpoke( a - 53248,b%256  ); }

  poke( a, b ) {
      var addr = "poke_" + a;
      if( this[addr] ) {
        this[addr](b);
      }
      if( a>53247 && a<53295) {

        this.console.vpoke( a - 53248,b%256  )

      }
      else if( a>1023 && a<2024) {
        var v = a - 1024;
        var y = Math.floor(v / 40);
        var x = v%40;
        var c = b%256;

        this.console.setChar(x,y,c);
      }
      else if( a>55295 && a<56296) {
        var v = a - 55296;
        var y = Math.floor(v / 40);
        var x = v%40;
        var c = b%256;

        this.console.setCharCol(x,y,c%16);
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
    this.console.setColor(14);

    this.printLine("");
    if( hard ) {
      this.printLine(" **** commodore 64 basic emulator ****");
      this.printLine("");
      this.printLine("  **** javascript implementation ****");
      this.printLine("");
    }
    this.printLine("ready.");
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
        values.push( par );
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
        //console.log("GOTO: Setting runpointer to "+ i);
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

  runPGM() {
    var c = this.console;
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


  runCommands( cmds ) {
    var commands = this.commands;
    var EXPR = 0, PAR = 1;

    for( var i=0; i<cmds.length; i++) {
      var cmd=cmds[i];
      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
        }
        else if( cn == "if" ) {
          this.doIf( cmd.params[0], cmd.params[1], cmd.comp, cmd.block );
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
            var p = this.evalExpression( cmd.params[j] );;
            values.push( { type: "value", value: p } );
          }
          else {
            values.push( { type: "var", value: cmd.params[0].parts[0].data } );
          }
        }
        try {
          var stc = commands[ cmd.statementName];
          if( stc === undefined ) {
            this.printError("syntax");
          }
          else {
              commands[ cmd.statementName]( values );
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

    var storageName = 'w64AutoSav_default.prg';
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


  handleLineInput( str ) {
    var p = new Parser();
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
      this.runCommands( l.commands );
      if( ! this.runFlag ) {
        this.printLine("ready.");
      }

    }

    console.log("program:",this.program);
    console.log("Line: ", l );
  }

}
