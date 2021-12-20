class BasicCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};

  }

  getStatements() {
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        stats2.push( stats[i].substr(6 ).toUpperCase() );
      }
    }

    return stats2;
  }

  getFunctions() {
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_fun_")) {
        stats2.push( stats[i].substr(5 ).toUpperCase() );
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

    this.context.printLine( "" );
    var context = this.context;

    for (const l of context.program)
      {
        var lineNr = parseInt(l[0]);
        if(  lineNr>= start && lineNr<= end ) {
          this.context.listCodeLine( l[2] );
        }
      }
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
      return [PAR, PAR, PAR, PAR, PAR, PAR, PAR, PAR, PAR, PAR];
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
      console.log( "PARS["+i+"]", pars[i] );
      if( pars[i].type != "var" ) {

        throw "INPUT: Param " + i +" is not a var";
      }
      vars.push( pars[i].value );
    }

    this.context.startConsoleDataInput( vars );

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
    //TODO also fix RUN and LIST

    var context = this.context;
    if( pars.length == 0 ) {
      context.sendChars( "", true );
      return;
    }
    console.log(pars);

    var newLine = true;
    var value;
    for( var i=0; i<pars.length; i++) {

      newLine = true;
      if( i<(pars.length-1)) {
        newLine = false;
      }

      console.log( "i=" +i+ " newline: " + newLine);
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
              console.log( "i="+i+" newline: set to false");
          newLine = false;
        }
        else {
          exparts2.parts.push( exparts.parts[j] );
        }
      }
      value = context.evalExpression( exparts2 );
      console.log( " newline: " + newLine);
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
    context.poke( pars[0].value, pars[1].value);

  }

  /************************ functions ************************/

  _fun_chr_DLR_( pars ) {
    return String.fromCharCode( pars[0].value );
  }

  _fun_len( pars ) {
    return pars[0].value.length;
  }

  _fun_val( pars ) {
    return parseInt( pars[0].value );
  }

  _fun_exp( pars ) {
    return Math.exp( pars[0].value );
  }

  _fun_rnd( pars ) {
    return Math.random();
  }

  _fun_sqr( pars ) {
    return Math.sqrt( pars[0].value);
  }

  _fun_log( pars ) {
    return Math.log( pars[0].value);
  }

  _fun_sin( pars ) {
    return Math.sin( pars[0].value);
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
    context.setCursXPos( _max( pars[0].value, 39) );
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
}
