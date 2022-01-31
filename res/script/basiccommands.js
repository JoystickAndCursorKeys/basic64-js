class BasicCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};
    this.statementList = null;

    this.randnrs = [];
    for(var i=0; i<10000;i++) {
      this.randnrs.push( Math.random() );
    }
    this.randIndex = 0;
    this.randStep = 1;

  }

  getStatements() {

    //if( this.statementList != null ) {
    //  return this.statementList;
    //}

    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        stats2.push( stats[i].substr(6 ).toUpperCase() );
      }
    }

    //this.statementList = stats2;
    return stats2;
  }

  getFunctions() {
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_fun_")) {
        var name = stats[i].substr(5 ).toUpperCase().replace("_DLR_","$");

        stats2.push( name );
      }
    }

    return stats2;
  }

  /************************ commands ************************/
  _stat_new( pars ) {
    this.context.new();
  }

  _stat_list( pars ) {

    var start = 0;
    var end   = 999999;
    var parts = [];

    var mode = "noparam";

    if( pars.length==1 ) {
      parts = pars[0].parts;
    }

    if( parts.length == 1 && parts[0].type == "num" && parts[0].data >=0 ) {
      start = parts[0].data;
      end = parts[0].data;
    }
    else if( parts.length == 1 && parts[0].type == "num" && parts[0].data <0 ) {
      /*NOTE, this will stop working if RAW changes to return uniop + posnum */
      end = -parts[0].data;
    }
    else if( parts.length == 2
        && parts[0].type == "num"
        && parts[1].type == "num"
        && parts[1].op == "-"
          ) {
      start = parts[0].data;
      end = parts[1].data;

    }
    else if( parts.length == 2
        && parts[0].type == "num"
        && parts[1].type == "uniop"
        && parts[1].op == "-"
          ) {
      start = parts[0].data;
    }

    var context = this.context;
    var list = [];
    for (const l of context.program)
      {

        var lineNr = parseInt(l[0]);
        if(  l[0] == null || (lineNr>= start && lineNr<= end) ) {
          list.push( l[2] );
        }
      }

      this.context.enterListMode( list );
  }

  _if_get() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [PAR];
  }

  _if_read() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [PAR];
  }

  _if_input() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW];
  }

  _if_list() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  _if_run() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  _stat_read( pars ) {
    var p0 = pars[ 0 ];
    if( p0.type != "var" ) {
      throw "READ: Param 0 is not a var";
    }

    var data = this.context.readData();
    if( data === undefined ) { throw "@out of data"; }
    else {
      if( data.type =="num" ) {
        this.context.setVar(
          p0.value, parseInt( data.data ) );
        }
        else {
          this.context.setVar(
            p0.value,  data.data );
        }
      }
  }

  _stat_get( pars ) {
    var p0 = pars[ 0 ];

    if( p0.type != "var" ) {
      throw "GET: Param 0 is not a var";
    }

    var k = this.context.pullKeyBuffer();
    if( k<0 ) { this.context.setVar(p0.value, ""); }
    else { this.context.setVar(p0.value, String.fromCharCode( k ) ); }
  }

  _stat_input( pars ) {

    var vars = [];

    for( var i=0; i<pars.length; i++) {
      if( i == 0 ) {
        var par = pars[0];

        if( par.parts.length == 2 ) {
          if( par.parts[0].type == "str" ) {
            this.context.sendChars( par.parts[0].data, false );
            if( par.parts[1].type == "var" && par.parts[1].op == ";" ) {
              vars.push( par.parts[1].data );
            }
          }
        }
        else if( par.parts.length == 1 ) {
          vars.push( par.parts[0].data );
        }

      }
      else {
        console.log( "PARS["+i+"]", pars[i] );
        if( pars[i].parts[0].type != "var" ) {

          throw "INPUT: Param " + i +" is not a var";
        }
        vars.push( pars[i].parts[0].data );
      }
    }

    this.context.startConsoleDataInput( vars );

  }

  _stat_restore( pars ) {
    this.context.restoreDataPtr();
  }

  _stat_load( pars ) {
    var context = this.context;
    var result;

    context.printLine("");

    if( pars.length == 0) {
      context.printLine("searching");
    }
    else {
      context.printLine("searching for " + pars[0].value);
    }

    if( pars.length == 0) {
        result = context.load( false );
    }
    else {
      result = context.load( pars[0].value );
    }



    if( !result ) {
      context.printLine("?not found error");
    }
    else  {

      if( !result[1] ) {  //only print when not a snapshot

        if( pars.length == 0) {
          context.printLine("found default");
        }
        else {
          context.printLine("found "+pars[0].value);
        }
        context.printLine("loading");
      }

    }


  }

  _stat_save( pars ) {
    var context = this.context;

    if( pars.length == 0) {
        context.save( false );
    }
    else {
      context.save( pars[0].value );
    }
  }

  _stat_sys( pars ) {
    throw "@not supported";
  }

  _stat_wait( pars ) {
    throw "@not supported";
  }

  _stat_verify( pars ) {
    throw "@not supported";
  }

  _stat_run( pars ) {
    var context = this.context;

    context.runPGM();
  }

  _if_print() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  normalizeIfNumber( x )  {
    if( this.isNumber( x ) ) {
      if ( x >= 0 ) {
        return " " + x;
      }
    }
    return "" + x;
  }

  _stat_print( pars ) {


    var context = this.context;
    if( pars.length == 0 ) {
      context.sendChars( "", true );
      return;
    }
    else if( pars.length == 1 ) {
      if( pars[0].parts.length == 0 ) {
        context.sendChars( "", true );
        return;
      }
    }

    var newLine = true;
    var value;
    for( var i=0; i<pars.length; i++) {

      newLine = true;
      if( i<(pars.length-1)) {
        newLine = false;
      }

      if( i>0) { context.sendChars( "         " , false ); }

      var exparts = pars[i];
      var exparts2=
        { parts: [],
          binaryNegate: exparts.binaryNegate,
          negate: exparts.negate  };

      for( var j=0; j<exparts.parts.length; j++) {
        if( exparts.parts[j].type == "uniop" &&
            exparts.parts[j].op == ";" && j==(exparts.parts.length-1)
            && (i == pars.length-1)) {
              //console.log( "i="+i+" newline: set to false");
          newLine = false;
        }
        else {
          exparts2.parts.push( exparts.parts[j] );
        }
      }
      value = context.evalExpression( exparts2 );

      if( i == 0) {
        context.sendChars( this.normalizeIfNumber( value ), newLine );
      }
      else {
        context.sendChars( "" + value , newLine );
      }

    }

  }

  _stat_poke( pars ) {

    var context = this.context;
    context.poke( pars[0].value, pars[1].value );

  }

  _stat_clr( pars ) {
    return this.context.clrPGM();
  }

  /************************ functions ************************/

  _fun_chr_DLR_( pars ) {
    return String.fromCharCode( pars[0].value );
  }

  _fun_str_DLR_( pars ) {
    if(pars[0].value>=0) {
      return " " +  pars[0].value;
    }
    return "" +  pars[0].value;
  }

  _fun_abs( pars ) {
    if( pars[0].value < 0 ) {
      return -pars[0].value;
    }
    return pars[0].value;
  }

  _fun_len( pars ) {
    return pars[0].value.length;
  }

  _fun_asc( pars ) {
    return pars[0].value.charCodeAt(0);
  }

  _fun_val( pars ) {
    return parseInt( pars[0].value );
  }

  _fun_exp( pars ) {
    return Math.exp( pars[0].value );
  }

  intGetNextRand() {
    this.randIndex = (this.randIndex + this.randStep) % this.randnrs.length;
    return this.randnrs[ this.randIndex ];
  }

  intSeedRand( x ) {
    var base = Math.floor( x * 11 );
    this.randIndex= base % this.randnrs.length;
    this.randStep = 1+(base % 7);
  }


  _fun_rnd( pars ) {

    if( pars.length <1) {
      throw "?syntax";
    }

    if( pars[0].value < 0) {
      this.intSeedRand( -pars[0].value );
    }

    return this.intGetNextRand();
  }

  _fun_sqr( pars ) {
    return Math.sqrt( pars[0].value);
  }

  _fun_log( pars ) {
    return Math.log( pars[0].value);
  }

  _fun_pos( pars ) {
    return this.context.getLinePos();
  }

  _fun_left_DLR_( pars ) {
      //? LEFT$(A$,8)
      return pars[0].value.substr(0,pars[1].value);
  }

  _fun_right_DLR_( pars ) {
      //? RIGHT$(A$,8)
      var s = pars[0].value;
      return s.substr( s.length - pars[1].value );
  }

  _fun_mid_DLR_( pars ) {
      //? RIGHT$(A$,8)
      var s = pars[0].value;

      if( pars.length == 3) {
        return s.substr( pars[1].value-1, pars[2].value );
      }
      else if( pars.length == 2) {
        return s.substr( pars[1].value-1 );
      }
  }

  _fun_fre( pars ) {
    return -26627;
  }

  _fun_sin( pars ) {
    return Math.sin( pars[0].value);
  }

  _fun_tan( pars ) {
    return Math.tan( pars[0].value);
  }

  _fun_atn( pars ) {
    return Math.atan( pars[0].value);
  }

  _fun_cos( pars ) {
    return Math.cos( pars[0].value);
  }

  _fun_spc( pars ) {
    var out="";
    for( var i=0; i<pars[0].value; i++) {
      out+=" ";
    }
    return out;
  }

  _max(x,m) {
    if( x<m ) {  return x; }
    return m;
  }

  _fun_usr() {
    return 0;
  }

  _fun_int( pars ) {
    return Math.floor( pars[0].value );
  }

  _fun_tab( pars ) {
    var context = this.context;
    context.setCursXPos( this._max( pars[0].value, 39) );
    return "";
  }

  _fun_sgn( pars ) {
    var x = pars[0].value;

    if( x<0 ) { return -1; }
    else if( x>0 ) { return 1; }
    return 0;
  }

  _fun_peek( pars ) {

    var context = this.context;
    return context.peek( pars[0].value );

  }

  _fun_jiffies( pars ) {
    return this.context.getJiffyTime( );
  }
}
