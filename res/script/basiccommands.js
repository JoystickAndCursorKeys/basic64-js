class BasicCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};

  }

  /*pushCmd( cmd, def ) {
    this.cmds[cmd] = def;
  }

  pushFunc( cmd, def ) {
    this.func[cmd] = def;
  }
  */

  /* commands */
  new( pars ) {
    this.context.new();
  }

  list( pars ) {
    var context = this.context;

    for (const l of context.program)
      {
        context.printLine( l[2] );
      }
  }


  _if_get() {
      var EXPR = 0, PAR = 1;
      return [PAR];
  }

  get( pars ) {
    var p0 = pars[ 0 ];
    if( p0.type != "var" ) {
      throw "GET: Param 0 is not a var";
    }

    var k = this.context.pullKeyBuffer();
    if( k<0 ) { this.context.setVar(p0.value, ""); }
    else { this.context.setVar(p0.value, String.fromCharCode( k ) ); }


  }

  load( pars ) {
    var context = this.context;
    var result;

    if( pars.length == 0) {
        result = context.load( false );
    }
    else {
      result = context.load( pars[0].value );
    }

    context.printLine("");


    if( result ) {
      if( pars.length == 0) {
        context.printLine("searching");
        context.printLine("found default.prg");
      }
      else {
        context.printLine("searching for " + pars[0].value);
        context.printLine("found "+pars[0].value);
      }
      context.printLine("loading");

    }
    else  {
      context.printLine("?not found error");
    }


  }

  save( pars ) {
    var context = this.context;

    if( pars.length == 0) {
        context.save( false );
    }
    else {
      context.save( pars[0].value );
    }
  }


  run( pars ) {
    var context = this.context;

    context.runPGM();
  }

  print( pars ) {
    console.log(pars);
    var context = this.context;

    if( pars.length != 0 ) {
        context.sendChars( "" + pars[0].value, true );
    }
    else {
      context.sendChars( "", true );
    }
  }

  poke( pars ) {

    var context = this.context;
    context.poke( pars[0].value, pars[1].value);

  }

  /* functions */
  len( pars ) {
    return pars[0].value.length;
  }

  val( pars ) {
    return parseInt( pars[0].value );
  }

  exp( pars ) {
    return Math.exp( pars[0].value );
  }

  rnd( pars ) {
    return Math.random();
  }

  sqr( pars ) {
    return Math.sqrt( pars[0].value);
  }

  log( pars ) {
    return Math.log( pars[0].value);
  }

  sin( pars ) {
    return Math.sin( pars[0].value);
  }

  cos( pars ) {
    return Math.cos( pars[0].value);
  }

  spc( pars ) {
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

  usr() {
    return 0;
  }

  int( pars ) {
    return Math.floor( pars[0].value );
  }

  tab( pars ) {
    var context = this.context;
    context.setCursXPos( _max( pars[0].value, 39) );
    return "";
  }

  sgn( pars ) {
    var x = pars[0].value;

    if( x<0 ) { return -1; }
    else if( x>0 ) { return 1; }
    return 0;
  }
}
