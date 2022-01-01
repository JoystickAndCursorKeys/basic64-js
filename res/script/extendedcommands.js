class ExtendedCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};
    this.enabled = false;

    this.statementList = null;

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

    var c2 = null;
    if( pars.length == 0 ) {
      throw("@col0 missing");
    }
    else if( pars.length == 1 ) {
      throw("@col1 missing");
    }
    else if( pars.length == 3 ) {
      c2 = pars[2].value;
    }
    else if( pars.length > 3 ) {
      throw("@too many parameters");
    }

    this.context.clearGFXScreen( pars[0].value, pars[1].value, c2 );
  }

  _stat_slow( pars ) {
    this.context.setTurbo( false );
  }

  _stat_synctime( pars ) {
    this.context.synchClock();
  }

  _stat_renumber( pars ) {

    if( pars.length == 0 ) {
      throw("@start missing");
      return;
    }

    if( pars.length == 1 ) {
      throw("@step missing");
      return;
    }

    if( pars.length > 2 ) {
      throw("@too many parameters");
      return;
    }

    this.context.renumberProgram( pars[0].value, pars[1].value);

  }

  _stat_dir( pars ) {
    var dir = this.context.getDir();

    this.context.sendChars( "DIR OF " +
      "\u0012\""+dir.title+"          \"\u0092" , true);

    //this.context.printLine( this.context.padSpaces6( "" ) + dir.title );

    for( var i=0; i<dir.files.length; i++) {
      //list.items.push( { name: dir.files[i].fname, id:  dir.files[i].fname } );

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

      var ctx = this.context;
      if( pars[0].value == 0 ) {
        ctx.poke( 53265, ctx.peek(53265) & (255-32));
        ctx.poke( 53270, ctx.peek(53270) & (255-16));
      }
      else if( pars[0].value == 1 ) {
        ctx.poke( 53265, ctx.peek(53265) & (255-32));
        ctx.poke( 53270, ctx.peek(53270) | 16 );
      }
      else if( pars[0].value == 2 ) {
        ctx.poke( 53265, ctx.peek(53265) | 32 );
        ctx.poke( 53270, ctx.peek(53270) & (255-16));
      }
      else if( pars[0].value == 3 ) {
        ctx.poke( 53265, ctx.peek(53265) | 32 );
        ctx.poke( 53270, ctx.peek(53270) | 16);
      }
      console.log(pars);

      if( pars.length > 1 ) {
        throw("@too many parameters");
        return;
      }
    }

    _stat_pcol( pars ) {

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

    _stat_rcol( pars ) {

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

      if( pars.length > 2 ) {
        throw("@too many parameters");
        return;
      }

    }

    _stat_cursor( pars ) {

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

    _stat_peekchr( pars ) {

      if( pars.length == 0 ) {
        throw("@x missing");
        return;
      }

      if( pars.length == 1 ) {
        throw("@y missing");
        return;
      }

      if( pars.length == 2 ) {
        throw("@char missing");
        return;
      }

      if( pars.length == 3 ) {
        this.context.setTextChar(
            pars[0].value %40,
            pars[1].value %25,
            pars[2].value %256,
            undefined );

        return;
      }

      if( pars.length == 4 ) {
        this.context.setTextChar(
            pars[0].value %40,
            pars[1].value %25,
            pars[2].value %256,
            pars[3].value %16 );

        return;
      }

      if( pars.length > 4 ) {
        throw("@too many parameters");
        return;
      }
    }


    _stat_cpoke( pars ) {

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


  /************************ functions ************************/

  _fun_tpeek( pars ) {

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

  _fun_cpeek( pars ) {

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
