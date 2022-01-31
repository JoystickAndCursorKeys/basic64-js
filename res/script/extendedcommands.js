class ExtendedCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};
    this.enabled = false;

    this.statementList = null;

    this.g_colIndex = 1;
    this.g_col0 = -1;
    this.g_col1 = -1;
    this.g_col2 = -1;
  }

  _intGetColorRecord() {
    return {
      c0: this.g_col0,
      c1: this.g_col1,
      c2: this.g_col2
    }
  }

  _intGFXLine( _x0, _y0, _x1, _y1 ) {

    var points = new Array();

    if( _x0 == _x1 && _y0 == _y1 ) {
      points.push( { x: Math.round(_x0), y: Math.round(_y0) } );
      return points;
    }

    var x0 = _x0;
    var y0 = _y0;
    var x1 = _x1;
    var y1 = _y1;

    var w = Math.abs(x1 - x0);
    var h = Math.abs(y1 - y0);

    var tmp;
    if( w > h ) {

      if( x0 > x1 ) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;

        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }

      var yfact = 1;
      if( y1 < y0 ) { yfact = -1 ;}
      for( var x = 0; x<=w ; x++ ) {

        var xx = x + x0;

        var progress = (x / w);
        var yy = y0 + (yfact * (progress * h));

        points.push( { x:Math.round(xx), y:Math.round(yy) } );
      }

    }
    else {

      if( y0 > y1 ) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;

        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }

      var xfact = 1;
      if( x1 < x0 ) { xfact = -1 ;}
      for( var y = 0; y<=h ; y++ ) {

        var yy = y + y0;

        var progress = (y / h);
        var xx = x0 + (xfact * (progress * w));

        points.push( { x:Math.round(xx), y:Math.round(yy) } );
      }
    }

    return points;
  }


  _intGFXPointOnLine( _x0, _y0, _x1, _y1, progress0 ) {

    var pathProgress = progress0;

    if( pathProgress<0) { pathProgress=0; }
    else if( pathProgress>1) { pathProgress=1; }

    if( _x0 == _x1 && _y0 == _y1 ) {
      return { x: Math.round(_x0), y: Math.round(_y0) };
    }

    var x0 = _x0;
    var y0 = _y0;
    var x1 = _x1;
    var y1 = _y1;

    var w = Math.abs(x1 - x0);
    var h = Math.abs(y1 - y0);

    var tmp;
    if( w > h ) {

      if( x0 > x1 ) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;

        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }

      var yfact = 1;
      if( y1 < y0 ) { yfact = -1 ;}
      var lastpoint = w;

      var thePointIx;
      if( _x0 < _x1 ) {
        thePointIx = Math.floor( lastpoint * pathProgress);
      }
      else {
        thePointIx = Math.floor( lastpoint * (1-pathProgress));
      }

      for( var x = 0; x<=w ; x++ ) {
        var xx = x + x0;

        var progress = (x / w);
        var yy = y0 + (yfact * (progress * h));

        if( x == thePointIx ) {
          return { x:Math.round(xx), y:Math.round(yy) };
        }
      }

    }
    else {

      if( y0 > y1 ) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;

        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }

      var xfact = 1;
      if( x1 < x0 ) { xfact = -1 ;}

      var lastpoint = h;

      var thePointIx;
      if( _y0 < _y1 ) {
        thePointIx = Math.floor( lastpoint * pathProgress);
      }
      else {
        thePointIx = Math.floor( lastpoint * (1-pathProgress));
      }

      for( var y = 0; y<=h ; y++ ) {

        var yy = y + y0;

        var progress = (y / h);
        var xx = x0 + (xfact * (progress * w));

        if( y == thePointIx ) {
          return { x:Math.round(xx), y:Math.round(yy) };
        }
      }
    }

    return{ x: _x0, y: _y0 };
  }


  getStatements() {
    if( this.enabled == false ) { return []; }

    if( this.statementList != null ) {
      return this.statementList;
    }

    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        stats2.push( stats[i].substr(6 ).toUpperCase() );
      }
    }

    this.statementList = stats2;

    return stats2;
  }

  getFunctions() {
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_fun_")) {
        stats2.push( stats[i].substr(5 ).toUpperCase() );
      }
    }

    return stats2;
  }

  /************************ commands ************************/

  _stat_xon( pars ) {
    this.enabled = true;
  }

  _stat_xoff( pars ) {
    this.enabled = false;
  }

  _stat_help( pars ) {
    this.context.printLine("");
    this.context.printLine("extended commands");
    this.context.printLine("-----------------");

    var stats = this.getStatements();
    for( var i=0; i<stats.length; i++) {
      this.context.printLine( stats[i] );
    }

    var fun = this.getFunctions();
    for( var i=0; i<fun.length; i++) {
      this.context.printLine( fun[i] + "()");
    }
  }

  _stat_panic( pars ) {
    this.context.resetVic();
  }

  _stat_unnew( pars ) {
    this.context.old();
  }

  _stat_disklabel( pars ) {

    if( pars.length == 0 ) {
      this.context.printError("specify label");
      return;
    }

    this.context.setDiskLabel( pars[0].value );
  }

  _stat_reset( pars ) {
    this.context.reset( true, true );
  }

  _stat_turbo( pars ) {
    this.context.setTurbo( true );
  }

  _stat_cls( pars ) {
    this.context.clearScreen();
  }

  _stat_gcls( pars ) {

    if( pars.length > 0 ) {
      throw("@too many parameters");
    }

    this.context.clearGFXScreen(
      this.g_col0,
      this.g_col1,
      this.g_col2 );
  }

  _stat_slow( pars ) {
    this.context.setTurbo( false );
  }

  _stat_synctime( pars ) {
    this.context.synchClock();
  }

  _stat_renumber( pars ) {

    var start = 100, step = 100;

    if( pars.length == 1 ) {
      start = pars[0].value;
    }

    if( pars.length == 2 ) {
      start = pars[0].value;
      step = pars[1].value;
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
      return;
    }

    this.context.renumberProgram( start, step );

  }

  _stat_reformat( pars ) {

    var start = 100, step = 100;

    if( pars.length != 0 ) {
      throw("@unexpected parameter");
      return;
    }

    this.context.normalizeProgram();

  }

  _stat_dir( pars ) {
    var dir = this.context.getDir();

    this.context.sendChars( "DIR OF " +
      "\u0012\""+dir.title+"          \"\u0092" , true);

    for( var i=0; i<dir.files.length; i++) {

      var row = this.context.padSpaces6( dir.files[i].size ) +" \"" + dir.files[i].fname + "\"";

      this.context.printLine( row );
    }

  }

  _stat_delete( pars ) {

    if( pars.length == 0 ) {
      this.context.printError("specify file");
      return;
    }

    var rv = this.context.deleteFile( pars[0].value );

    if( rv != "ok" ) {
      this.context.printError(rv);
      return;
    }
  }

    //--graphics
    _stat_mode( pars ) {

      if( pars.length != 1 ) {
        throw("@mode missing");
        return;
      }
      if( pars[0].value < 0 | pars[0].value > 3) {
        throw("@only mode 0-3 supported");
        return;
      }

      console.log ("set mode " + pars[0].value);

      var ctx = this.context;
      if( pars[0].value == 0 ) {
        ctx.poke( 53265, ctx.peek(53265) & (255-32));
        ctx.poke( 53270, ctx.peek(53270) & (255-16));
        ctx.poke( 53272, ctx.peek(53272) & (255-8));
      }
      else if( pars[0].value == 1 ) {
        ctx.poke( 53265, ctx.peek(53265) & (255-32));
        ctx.poke( 53270, ctx.peek(53270) | 16 );
        ctx.poke( 53272, ctx.peek(53272) & (255-8));
      }
      else if( pars[0].value == 2 ) {
        ctx.poke( 53265, ctx.peek(53265) | 32 );
        ctx.poke( 53270, ctx.peek(53270) & (255-16));
        ctx.poke( 53272, ctx.peek(53272) | 8);
      }
      else if( pars[0].value == 3 ) {
        ctx.poke( 53265, ctx.peek(53265) | 32 );
        ctx.poke( 53270, ctx.peek(53270) | 16);
        ctx.poke( 53272, ctx.peek(53272) | 8);
      }
      console.log(pars);

      if( pars.length > 1 ) {
        throw("@too many parameters");
        return;
      }
    }

    _stat_pen( pars ) {

      if( pars.length < 1 ) {
        throw("@col missing");
        return;
      }
      console.log(pars);

      this.console.setColor( pars[0].value );

      if( pars.length > 1 ) {
        throw("@too many parameters");
        return;
      }
    }


    _stat_gpen( pars ) {
      if( pars.length < 1 ) {
        throw("@pen missing");
        return;
      }

      this.g_colIndex = pars[0].value;
    }


    _stat_gcoldef( pars ) {

      if( pars.length < 1 ) {
        throw("@color index missing");
        return;
      }

      if( pars.length < 2 ) {
        throw("@color missing");
        return;
      }

      var index = pars[0].value;
      if(index<0 || index>2 ) {
        throw("@index out of range");
      }

      if( index==0 ) {
          this.g_col0 = pars[1].value;
      }
      else if( index==1 ) {
          this.g_col1 = pars[1].value;
      }
      else if( index==2 ) {
          this.g_col2 = pars[1].value;
      }

      if( pars.length > 2 ) {
        throw("@too many params");
        return;
      }
    }

    _stat_gcolors( pars ) {

      if( pars.length < 1 ) {
        throw("@color0 missing");
        return;
      }
      this.g_col0 = pars[0].value;

      if( pars.length < 2 ) {
        return;
      }
      this.g_col1 = pars[1].value;

      if( pars.length < 3 ) {
        return;
      }
      this.g_col2 = pars[2].value;

      if( pars.length > 3 ) {
        throw("@too many colors");
        return;
      }
    }

    _if_seek() {
        var EXPR = 0, PAR = 1, RAW=2;
        return [RAW,RAW,RAW,RAW,RAW,RAW,RAW,RAW];
    }

    _stat_seek( pars ) {
      console.log("seek");
      var start = 0;
      var end   = 999999;
      var parts = [];

      var mode = "noparam";

      if( pars.length==0 ) {
        throw "@seek what"
      }

      this.context.printLine( "" );
      var context = this.context;

      for (const l of context.program)
        {
          for( var i=0; i<pars.length; i++) {
            for( var j=0; j<pars[i].parts.length; j++) {

            if( l[2].indexOf( pars[i].parts[j].data ) > -1 ) {
              this.context.listCodeLine( l[2] );
              break;
            }
          }
        }
      }
    }

    _if_debug() {
        var EXPR = 0, PAR = 1, RAW=2;
        return [RAW];
    }

    _stat_debug( pars ) {

        var context = this.context;
        var ln = context.runPointer;

        var prefix = "DEBUG["+context.program[ln][0]+"]: ";
        if( pars.length == 0 ) {
          console.log( prefix+" ---------------" );
          return;
        }
        else if( pars.length == 1 ) {
          if( pars[0].parts.length == 0 ) {
            console.log( prefix+" ---------------" );
            return;
          }
        }

        var newLine = true;
        var value;
        var buffer = "";
        for( var i=0; i<pars.length; i++) {

          newLine = true;
          if( i<(pars.length-1)) {
            newLine = false;
          }

          if( i>0) {
            buffer+= "         ";
          }

          var exparts = pars[i];
          var exparts2=
            { parts: [],
              binaryNegate: exparts.binaryNegate,
              negate: exparts.negate  };

          for( var j=0; j<exparts.parts.length; j++) {
            if( exparts.parts[j].type == "uniop" &&
                exparts.parts[j].op == ";" && j==(exparts.parts.length-1)
                && (i == pars.length-1)) {

              newLine = false;
            }
            else {
              exparts2.parts.push( exparts.parts[j] );
            }
          }
          value = context.evalExpression( exparts2 );

          buffer += value;
          if( newLine ) {
            console.log(prefix + buffer );
            buffer = "";
          }
        }
        if( buffer != "" ) {
          console.log(prefix + buffer );
        }
    }

    _stat_wjiffy( pars ) {
      this.context.breakCycle();
    }

    _stat_color( pars ) {

      if( pars.length == 0 ) {
        throw("@index missing");
        return;
      }
      console.log(pars);
      if( pars.length >= 1 ) {
          if( !(pars[0].value >=0
              && pars[0].value <=14) ) {
              throw("@index must be in range 0-14");
          }
      }

      if( pars.length >= 2 ) {
          this.context.vpoke(53280 + pars[0].value, pars[1].value );
      }
      else {
        throw("@color missing");
      }
    }

    _stat_bgcolor( pars ) {

      if( pars.length == 0 ) {
        throw("@color missing");
        return;
      }

      if( pars.length == 1 ) {
        this.context.vpoke(53281 , pars[0].value );
        return;
      }

      if( pars.length >= 2 ) {
        throw("@too many params");
        return;
      }

    }

    _stat_border( pars ) {

      if( pars.length == 0 ) {
        throw("@color missing");
        return;
      }

      if( pars.length == 1 ) {
        this.context.poke(53280 , pars[0].value );
        return;
      }

      if( pars.length >= 2 ) {
        throw("@too many params");
        return;
      }

    }

    _stat_penpos( pars ) {

      if( pars.length == 0 ) {
        throw("@x missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y missing");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

      this.context.setCursor( pars[0].value %40, pars[1].value%25);

    }


    _stat_sprite( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@on/off flag");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spriteEnable( pars[0].value %8, pars[1].value %2 );

    }

    _stat_spmcol( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@mode flag");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }


      this.context.spriteMultiCol( pars[0].value %8, pars[1].value %2 );

    }

    _stat_sx2( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@x flag");
        return;
      }

      if( pars.length == 2 ) {
        throw("@y flag");
        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spriteDouble( pars[0].value %8, pars[1].value %2, pars[2].value %2 );

    }


    _stat_sframecp( pars ) {

      if( pars.length == 0 ) {
        throw("@srcframe");
        return;
      }

      if( pars.length == 1 ) {
        throw("@dstframe");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spriteFrameCopy( pars[0].value %256, pars[1].value %256 );
    }


    _stat_sframe( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@frame");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spriteFrame( pars[0].value %8, pars[1].value );
    }

    _stat_scol( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@color");
        return;
      }

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spriteColor( pars[0].value %8, pars[1].value %16 );

    }


    _stat_spoke( pars ) {

      if( pars.length == 0 ) {
        throw("@frame nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@address");
        return;
      }

      if( pars.length == 2 ) {
        throw("@value");
        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spritePoke(
          pars[0].value % 256, //frame
          pars[1].value % 64,  //offset
          pars[2].value % 256, //value
          );

    }

    _stat_spos( pars ) {

      if( pars.length == 0 ) {
        throw("@sprite nr missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@x");
        return;
      }

      if( pars.length == 2 ) {
        throw("@y");
        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }

      this.context.spritePos(
          pars[0].value,
          pars[1].value % 512,
          pars[2].value % 256,
          );

    }

    _if_path() {
        var EXPR = 0, PAR = 1, RAW=2;
        return [EXPR,EXPR,EXPR,EXPR,EXPR,PAR,PAR];
    }

    _stat_path( pars ) {

      if( pars.length == 0 ) {
        throw("@x1 missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y1 missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@x2 missing");
        return;
      }

      if( pars.length == 3 ) {
        throw("@y2 missing");
        return;
      }

      if( pars.length == 4 ) {
        throw("@progress missing");
        return;
      }

      if( pars.length == 5 ) {
        throw("@xout missing");
        return;
      }

      if( pars.length == 6 ) {
        throw("@yout missing");
        return;
      }

      if( pars.length >7 ) {
        throw("@too many params");
        return;
      }

      var p5 = pars[ 5 ];
      var p6 = pars[ 6 ];

      if( p5.type != "var" ) {
        throw "@not a variable";
      }

      if( p6.type != "var" ) {
        throw "@not a variable";
      }

      var progress =  pars[4].value;

      var thePoint = this._intGFXPointOnLine(
        Math.floor( pars[0].value ),
        Math.floor( pars[1].value ),
        Math.floor( pars[2].value ),
        Math.floor( pars[3].value ),
        progress
      );

      this.context.setVar(p5.value, thePoint.x );
      this.context.setVar(p6.value, thePoint.y );

    }

    _stat_line( pars ) {

      if( pars.length == 0 ) {
        throw("@x1 missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y1 missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@x2 missing");
        return;
      }

      if( pars.length == 3 ) {
        throw("@y2 missing");
        return;
      }

      if( pars.length >5 ) {
        throw("@too many params");
        return;
      }

      var colIndex = -1;
      if( pars.length == 5 ) {
        colIndex =
          pars[4].value % 4;
      }
      else {
        colIndex = this.g_colIndex;
      }
      if( colIndex < 0 ) {
        throw "@pen is -1"
      }


      this.context.drawLine(
          { c:this, m: "_intGFXLine"},
          Math.floor( pars[0].value ) %320,
          Math.floor( pars[1].value ) %200,
          Math.floor( pars[2].value ) %320,
          Math.floor( pars[3].value ) %200,
          this._intGetColorRecord(),
          colIndex );

    }

    _stat_box( pars ) {

      if( pars.length == 0 ) {
        throw("@x1 missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y1 missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@x2 missing");
        return;
      }

      if( pars.length == 3 ) {
        throw("@y2 missing");
        return;
      }

      if( pars.length >5 ) {
        throw("@too many params");
        return;
      }

      var colIndex = -1;
      if( pars.length == 5 ) {
        colIndex =
          pars[4].value % 4;
      }
      else {
        colIndex = this.g_colIndex;
      }
      if( colIndex < 0 ) {
        throw "@pen is -1"
      }

      this.context.drawBox(
          Math.floor( pars[0].value ) %320,
          Math.floor( pars[1].value ) %200,
          Math.floor( pars[2].value ) %320,
          Math.floor( pars[3].value ) %200,
          this._intGetColorRecord(),
          colIndex );


    }

    _stat_hline( pars ) {

      if( pars.length == 0 ) {
        throw("@x1 missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y1 missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@x2 missing");
        return;
      }

      if( pars.length >4 ) {
        throw("@too many params");
        return;
      }

      var colIndex = -1;
      if( pars.length == 4 ) {
        colIndex =
          pars[3].value % 4;
      }
      else {
        colIndex = this.g_colIndex;
      }
      if( colIndex < 0 ) {
        throw "@pen is -1"
      }

      this.context.drawBox(
          Math.floor( pars[0].value ) %320,
          Math.floor( pars[1].value ) %200,
          Math.floor( pars[2].value ) %320,
          Math.floor( pars[1].value ) %200,
          this._intGetColorRecord(),
          colIndex );

    }

    _stat_plot( pars ) {


      if( pars.length == 0 ) {
        throw("@x missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y missing");
        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }

      var colIndex = -1;
      if( pars.length == 3 ) {
        colIndex =
          pars[2].value % 4;
      }
      else {
        colIndex = this.g_colIndex;
      }
      if( colIndex < 0 ) {
        throw "@pen is -1"
      }

      this.context.setPixel(
          Math.floor( pars[0].value ) %320,
          Math.floor( pars[1].value ) %200,
          this._intGetColorRecord(),
          colIndex );

    }


    _stat_charcol( pars ) {

      if( pars.length == 0 ) {
        throw("@x missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@col missing");
        return;
      }

      if( pars.length == 3 ) {
        this.context.setTextCol(
            pars[0].value %40,
            pars[1].value %25,
            pars[2].value %16
          );

        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }
    }


    _stat_char( pars ) {

      if( pars.length == 0 ) {
        throw("@x missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@charcode missing");
        return;
      }

      if( pars.length == 3 ) {
        this.context.setTextChar(
            pars[0].value %40,
            pars[1].value %25,
            pars[2].value %256
          );

        return;
      }

      if( pars.length > 3 ) {
        throw("@too many parameters");
        return;
      }
    }

  /************************ functions ************************/
/*
  _fun_rbound( pars ) {

    if( pars.length == 0 ) {
      throw("@min missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@max missing");
      return;
    }

    if( pars.length == 2 ) {
      throw("@val missing");
      return;
    }

    if( pars.length == 3 ) {
      var v = pars[2].value;
      if( v< pars[0].value ) {
        return pars[0].value;
      }
      else if( v> pars[1].value ) {
        return pars[1].value;
      }
      return v;
    }

    if( pars.length > 3 ) {
      throw("@too many parameters");
    }

  }

  _fun_rwrap( pars ) {

    if( pars.length == 0 ) {
      throw("@min missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@max missing");
      return;
    }

    if( pars.length == 2 ) {
      throw("@val missing");
      return;
    }

    if( pars.length == 3 ) {
      var v = pars[2].value;

      if( v< pars[0].value ) {
          v=pars[1].value - (pars[0].value-v);
          if( v< pars[0].value ) {
            return pars[0].value;
          }
          else {
            return v;
          }
      }
      else if( v> pars[1].value ) {
          v=pars[0].value + (v-pars[1].value);
          if( v> pars[1].value ) {
            return pars[1].value;
          }
          else {
            return v;
          }
      }
      return v;
    }

    if( pars.length > 3 ) {
      throw("@too many parameters");
    }

  }
*/

  _fun_pixcol( pars ) {

    if( pars.length == 0 ) {
      throw("@x missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@y missing");
      return;
    }

    if( pars.length == 2 ) {
      return this.context.getPixel(
          pars[0].value %320,
          pars[1].value %200,
          0
        );
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
    }

  }

  _fun_pixel( pars ) {

    if( pars.length == 0 ) {
      throw("@x missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@y missing");
      return;
    }

    if( pars.length == 2 ) {
      return this.context.getPixel(
          pars[0].value %320,
          pars[1].value %200,
          0
        );
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
    }

  }


  _fun_char( pars ) {

    if( pars.length == 0 ) {
      throw("@x missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@y missing");
      return;
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
    }

    return this.context.getTextChar(
        pars[0].value %40,
        pars[1].value %25
      );
  }

  _fun_charcol( pars ) {

    if( pars.length == 0 ) {
      throw("@x missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@y missing");
      return;
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
    }

    return this.context.getTextColor(
        pars[0].value %40,
        pars[1].value %25
      );
  }

}
