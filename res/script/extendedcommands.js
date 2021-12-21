class ExtendedCommands {

  constructor( context ) {
    this.console = context.console;
    this.context = context;
    this.cmds = {};
    this.func = {};
    this.enabled = false;

  }

  getStatements() {
    if( this.enabled == false ) { return []; }
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

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

  _stat_xon( pars ) {
    this.enabled = true;
  }

  _stat_xoff( pars ) {
    this.enabled = false;
  }

  _stat_xhelp( pars ) {
    this.context.printLine("");
    this.context.printLine("extended commands");
    this.context.printLine("-----------------");

    var stats = this.getStatements();
    for( var i=0; i<stats.length; i++) {
      this.context.printLine( stats[i] );
    }

  }

  _stat_xrestore( pars ) {
    this.context.reset( false, true );
  }

  _stat_xunnew( pars ) {
    this.context.old();
  }

  _stat_xdisks( pars ) {
    var disks = this.context.getDisks();

    for( var i=0; i<disks.length; i++) {
      var row = this.context.padSpaces8( "" ) +" \"" + disks[i] + "\"";

      this.context.printLine( row );
    }
  }

  _stat_xdisksel( pars ) {
    console.log(pars);
    //this.context.selectDisk( id );
  }

  _stat_xdir( pars ) {
    var dir = this.context.getDir();

    for( var i=0; i<dir.files.length; i++) {
      //list.items.push( { name: dir.files[i].fname, id:  dir.files[i].fname } );

      var row = this.context.padSpaces6( dir.files[i].size ) +" \"" + dir.files[i].fname + "\"";

      this.context.printLine( row );
    }

  }

  /************************ functions ************************/


}
