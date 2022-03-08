class VDisk {

  constructor() {
    this.initialized = false;
  }

  initialize() {
    this.disks = [];
    this.currentDisk = null;
    var defaultDisk = "0001"

    var json = localStorage.getItem( "BJ64_disks_list" );
    if( json == null ) {

      var diskId = "0001";
      var diskName = "Default";
      this.disks = [ diskId ];
      this.currentDisk = diskId;
      this.lastDisk = 1;

      localStorage.setItem( "BJ64_disks_list", JSON.stringify( this.disks ) );
      localStorage.setItem( "BJ64_0001_dir", JSON.stringify( {files:[], title: diskName, readOnly: false } ) );
      localStorage.setItem( "BJ64_disk_current", diskId );
    }
    else {
      this.disks = JSON.parse( json );
      this.currentDisk = localStorage.getItem( "BJ64_disk_current" );

      var last = -1;
      for( var i=0; i<this.disks.length; i++) {
        if( parseInt( this.disks[i] ) > last ) {
          last = parseInt( this.disks[ i ] );
        }
      }
      this.lastDisk = last;
    }


    this.initialized=true;

  }

  selectDisk( diskId ) {
    this.currentDisk = diskId;
    localStorage.setItem( "BJ64_disk_current", diskId );
  }

  ready() {
    return this.initialized;
  }


  getDisks() {

    if( !this.initialized ) {
      return [];
    }

    var storageName =  "BJ64_disks_list";
    var json = localStorage.getItem( storageName );
    var disks = JSON.parse( json );

    return disks;

  }

  getEmptyDirStructure(name) {
    return {files:[], title: "null" };
  }

  getDir() {

    if( !this.initialized ) {
      return getEmptyDirStructure(null);
    }

    var storageName =  "BJ64_" + this.currentDisk + "_dir";
    var json = localStorage.getItem( storageName );
    var dir = JSON.parse( json );

    //var title = "0 \u0012\""+dir.title+"          \"\u0092 00 2A";
    var title = dir.title;

    if(!json) {
      return {files:[], title: title };
    }
    dir.title = title;
    dir.free = 32-dir.files.length;

    var foundNullIx = -1;

    while( true ) {
      for( var i=0; i<dir.files.length; i++) {
        if( dir.files[i] == null) {
          foundNullIx = i;
          break;
        }
      }
      if( foundNullIx > -1) {
        dir.files.splice( foundNullIx, 1 );
        foundNullIx = -1;
      }
      else {
        break;
      }
    }
    return dir;

  }

  getSelectedDir( x ) {

    if( !this.initialized ) {
      return {files:[], title: "null" };
    }

    var storageName =  "BJ64_" + x + "_dir";
    var json = localStorage.getItem( storageName );
    var dir = JSON.parse( json );

    //var title = "0 \u0012\""+dir.title+"          \"\u0092 00 2A";
    var title = dir.title;

    if(!json) {
      return {files:[], title: title };
    }
    dir.title = title;
    dir.free = 32-dir.files.length;
    return dir;

  }

  setDir( dir ) {

    if( !this.initialized ) {
      return;
    }

    var storageName =  "BJ64_" + this.currentDisk + "_dir";

    localStorage.setItem(storageName, JSON.stringify( dir ) );

  }

  existsFile( fileName ) {

    if( !this.initialized ) {
      return false;
    }

    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      return true;
    }
    return false;
  }


  removeFromDir( fileName ) {

    if( !this.initialized ) {
      return;
    }

    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      dir.files.splice( i, 1 );
    }
    this.setDir(dir);
  }

  updateDir( fileName, programLen ) {

    if( !this.initialized ) {
      return;
    }

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

  saveFile( fileName0, data, type, length ) {

    if( !this.initialized ) {
      return;
    }

    var fileName = fileName0;
    if( fileName0.length > 32) {
        fileName = fileName0.substr(0,32);
    }

    var storageName =  "BJ64_" + this.currentDisk + "_" + fileName;

    //save pgm
    var container = JSON.stringify( { type: type, data: data} );
    localStorage.setItem(storageName, container );

    this.updateDir( fileName, length );
  }

  loadFile( fileName ) {

    if( !this.initialized ) {
      return null;
    }

    var storageName =  "BJ64_" + this.currentDisk + "_" + fileName;

    var json = localStorage.getItem( storageName );

    return JSON.parse( json );
  }

  deleteFile( fileName ) {
    if( ! this.existsFile( fileName ) ) {
      return "no such file";
    }

    try {
      this.removeFromDir( fileName );
      this._removeFile( fileName );
    }
    catch ( e ) {
      return "unexpected";
    }
    return "ok";
  }

  _removeFile( fileName ) {

    var storageName =  "BJ64_" +
      this.currentDisk + "_" +
      fileName;

    localStorage.removeItem( storageName );

  }

  formatDisk() {

    var dir = this.getDir();

    for( var i=0; i<dir.files.length; i++) {

        var fileName = dir.files[i].fname;
        this._removeFile( fileName );

    }

    dir.files = [];
    dir.title = "Empty"
    this.setDir( );

  }

  createDiskFromImage( name, image ) {

    this.lastDisk++;
    var labl = "" + this.lastDisk;
    labl = labl.padStart( 4,"0");
    var dir = image.dir;
    var content = image.content;

    var storageName =  "BJ64_" + labl + "_dir";
    localStorage.setItem(storageName, JSON.stringify( dir ) );

    for( var i=0; i<content.length; i++) {
        var fileName = content[i].fname;
        var storageName =  "BJ64_" + labl + "_" + fileName;
        localStorage.setItem( storageName, content[i].content );
    }

    this.disks.push( labl );
    localStorage.setItem( "BJ64_disks_list", JSON.stringify( this.disks ) );

  }

  createDisk() {

    var existingDisks = this.getDisks();
    this.lastDisk ++;
    var labl = "" + this.lastDisk;
    labl = labl.padStart( 4,"0");

    var newDir = this.getEmptyDirStructure("NEW DISK");

    var storageName =  "BJ64_" + labl + "_dir";
    localStorage.setItem(storageName, JSON.stringify( newDir ) );

    this.disks.push( labl );
    localStorage.setItem( "BJ64_disks_list", JSON.stringify( this.disks ) );

  }

  getFullDisk() {

    if( !this.initialized ) {

      var dir = this.getDir();

      var disk = {
        dir: dir,
        content: []
      };

      var diskStr = JSON.stringify( disk );

      return diskStr;
    }

    var dir = this.getDir();
    var content = [];

    for( var i=0; i<dir.files.length; i++) {
        var fileName = dir.files[i].fname;
        var storageName =  "BJ64_" + this.currentDisk + "_" + fileName;
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

}
