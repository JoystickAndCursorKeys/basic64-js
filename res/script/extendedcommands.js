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

  }

  _stat_panic( pars ) {
    this.context.resetVic();
  }

  _stat_unnew( pars ) {
    this.context.old();
  }

  _stat_disks( pars ) {
    var disks = this.context.getDisks();

    for( var i=0; i<disks.length; i++) {
      var row = this.context.padSpaces8( "" ) +" \"" + disks[i] + "\"";

      this.context.printLine( row );
    }
  }

  _stat_dselect( pars ) {
    if( pars.length == 0 ) {
      this.context.printError("specify disk");
      return;
    }
    this.context.selectDisk( pars[0].value );
  }

  _stat_dlabel( pars ) {

    if( pars.length == 0 ) {
      this.context.printError("specify label");
      return;
    }

    this.context.setDiskLabel( pars[0].value );
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



  /************************ functions ************************/


}
