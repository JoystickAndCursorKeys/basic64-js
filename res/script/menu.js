class Uploader {

	constructor ( callbackC, callbackM ) {
		this.callbackC = callbackC;
		this.callbackM = callbackM;
	}

	handleEvent(evt) {
		console.log("handleEvent " + evt.type);
		switch(evt.type) {
		case "change":
			console.log("--------------handle upload event");
			console.log(evt);
			this.handleUpload( evt );

		break;
		}
	}

	handleUpload(e){

    console.log("handleUpload " + e);
		var reader = new FileReader();

		var thisFileName = e.target.files[0].name;
		var _this = this;


			reader.onload = function(event){

				console.log("reader onload " + thisFileName);

				var text =  event.target.result ;
				console.log( text );

				_this.callbackC[ _this.callbackM ]( text );

			}

			console.log("read " + e.target.files[0]);
			console.log(e.target.files[0]);
			reader.readAsText(e.target.files[0]);

	}
}


class Menu {

  constructor( screen, context ) {
    this.console = screen;
    this.context = context;

    this.uploader = new Uploader( this, "do_importBasCallBack" );

    this.menuvmState = "main";
    this.optSelect = 0;

    this.options = {};
    this.menus = {};
    this.menuOffset = {};

    var opts = [];
    //opts.push({opt: "status", display: "Status" });
    //opts.push({opt: "loadsave", display: "Load/Save" });
    opts.push({opt: "clipboardMenu", display: "Clipboard" });
    opts.push({opt: "exportMenu", display: "Disk" });
    //opts.push({opt: "keys", display: "Keys" });
    //opts.push({opt: "tools", display: "Tools" });
    opts.push({opt: "reset", display: "Reset" });
    opts.push({opt: "documentation", display: "Documentation" });

    this.options["main"] = opts;
    this.menus["main"] = "basic power menu";
    this.menuOffset["main"] = 10;

    opts = [];
    opts.push({opt: "copyPGMtoClip", display: "Copy Program to Clipboard" });
//    opts.push({opt: "pastePGMFromClip", display: "Overwrite Program with Clipboard" });
//    opts.push({opt: "pastePGMFromClipAppend", display: "Merge Program with Clipboard" });
    this.options["clipboard"] = opts;
    this.menus["clipboard"] = "clipboard power menu";
    this.menuOffset["clipboard"] = 0;


    opts = [];
    opts.push({opt: "listDirectory", display: "List VDisk Directory" });
    opts.push({opt: "exportVDisk", display: "Export Virtual Disk" });
    opts.push({opt: "exportBas", display: "Export Basic Program" });
    opts.push({opt: "importBas", display: "Import Basic Program" });
    opts.push({opt: "importBasRun", display: "Import/Run Basic Program" });
    opts.push({opt: "exportSnapshot", display: "Export Snapshot" });
    opts.push({opt: "saveSnapshot", display: "Save Snapshot" });
    //opts.push({opt: "selectVDisk", display: "Select Virtual Disk" });
//    opts.push({opt: "pastePGMFromClip", display: "Overwrite Program with Clipboard" });
//    opts.push({opt: "pastePGMFromClipAppend", display: "Merge Program with Clipboard" });
    this.options["export"] = opts;
    this.menus["export"] = "disk power menu";
    this.menuOffset["export"] = 7;
  }


  rendervmStateText() {
    var t=this;
    var context = this.context;
    t.console.clearScreen();
    t.console.setColor(1);


    var title = t.menus[ t.menuvmState ];
    var options = this.options[ t.menuvmState ];

    var x;

    t.nl();
    var menuStr = "***** " + title +" *****";
    x = 20 - (Math.floor(menuStr.length / 2));
    t.padLine( x, menuStr );
    t.nl();t.nl();t.nl();t.nl();

    x=this.menuOffset[ t.menuvmState ];

    this.curs = [];
    for( var i=0; i<8 && i<options.length; i++) {

        if( i == this.optSelect ) {
          t.console.setColor(1);
        }
        else {
          t.console.setColor(15);
        }
        t.pad( x, " F" +(i+1)+ " - " + options[i].display );

        this.curs.push( t.console.getCursorPos() );

        t.nl();
        t.nl();
    }

    var selectCursor = this.curs[ this.optSelect ];

    t.console.setCursorX( selectCursor[0]);
    t.console.setCursorY( selectCursor[1]);

    //t.padLine( x, " F2 - Load/Save"); t.nl();
    //t.padLine( x, " F3 - Clipboard"); t.nl();
    //t.padLine( x, " F4 - Snapshot");  t.nl();
    //t.padLine( x, " F5 - Settings");  t.nl();
  }

  rendervmState() {

    var t=this;
    var context = this.context;


    context.vpoke(53280,0);
    context.vpoke(53281,0);
    context.vpoke(53269,0);
    context.vpoke(53270,200);

    t.rendervmStateText() ;

  }

  color(x) {
    this.console.setColor(x);
  }

  nl() {
    this.context.printLine("");
  }

  pad( pad, txt ) {

    var padStr = "";
    for(var i=0; i<pad;i++) {
      padStr+=" ";
    }
    this.context.print( padStr + txt );
  }

  padLine( pad, txt ) {

    var padStr = "";
    for(var i=0; i<pad;i++) {
      padStr+=" ";
    }
    this.context.printLine( padStr + txt );
  }

  start() {

    this.console.clearCursor();

    this.vmState =
    {
        console: this.console.getState(),
        pgm: this.context.getProgram(),
        pgmState: this.context.getProgramState()
    }

    console.log( this.vmState );
    this.rendervmState();

  }

  message( m ) {
    this.context.printLine("*** " + m);
  }

  errorMessage( m ) {
    this.context.printLine("?" + m + " error");
  }

  stop() {
    console.log( "End menu");

    this.console.setState( this.vmState.console );
    this.console.clearCursor();
  }

  endMenu() {
    this.context.endMenu();
    this.stop();
  }

  endMenuWithMessage( m ) {
    this.context.endMenu();
    this.stop();
    this.context.printLine( "" );
    this.message(m);

  }


  handleKey( evt ) {

    if( evt.key == "Enter") {
      var options = this.options[ this.menuvmState ];

      console.log( this.optSelect );

      var opt = options[ this.optSelect ];

      console.log( opt );
      this[ "do_" +  opt.opt ]();
    }
    if( evt.key == "Escape") {

      if( this.menuvmState == "main" ) {
        this.endMenu();
      }
      else {
        this.do_mainMenu();
      }

    }
    else if( evt.key == "Pause" && evt.ctrlKey) {
    }
    else if( evt.key == "ArrowUp") {
      var options = this.options[ this.menuvmState ];
      if( (this.optSelect) >0 ) {
        this.optSelect--;
        this.rendervmStateText();
        evt.preventDefault();
      }
    }
    else if( evt.key == "ArrowDown") {
      var options = this.options[ this.menuvmState ];
      if( (this.optSelect+1) < options.length ) {
        this.optSelect++;
        this.rendervmStateText();
        evt.preventDefault();
      }
    }
    else if( evt.key == "F1") {
      this.executeOption( 0 );
      evt.preventDefault();
    }
    else if( evt.key == "F2") {
      this.executeOption( 1 );
      evt.preventDefault();
    }
    else if( evt.key == "F3") {
      this.executeOption( 2 );
      evt.preventDefault();
    }
    else if( evt.key == "F4") {
      this.executeOption( 3 );
      evt.preventDefault();
    }
    else if( evt.key == "F5") {
      this.executeOption( 4 );
      evt.preventDefault();
    }
    else if( evt.key == "F6") {
      this.executeOption( 5 );
      evt.preventDefault();
    }
    else if( evt.key == "F7") {
      this.executeOption( 6 );
      evt.preventDefault();
    }
    else if( evt.key == "F8") {
      this.executeOption( 7 );
      evt.preventDefault();
    }
  }

  executeOption( no ) {
    var options = this.options[ this.menuvmState ];

    if( (no+1) <= options.length ) {

      this.optSelect = no;

      console.log( this.optSelect );

      var opt = options[ this.optSelect ];

      console.log( opt );
      this[ "do_" +  opt.opt ]();

    }

  }

  do_exportMenu() {
    this.menuvmState = "export";
    this.optSelect = 0
    this.rendervmState();
  }

  do_clipboardMenu() {
    this.menuvmState = "clipboard";
    this.optSelect = 0
    this.rendervmState();
  }

  do_mainMenu() {
    this.menuvmState = "main";
    this.optSelect = 0
    this.rendervmState();
  }

  do_copyPGMtoClip() {
    navigator.clipboard.writeText( this.context.getProgramAsText() );

    this.endMenuWithMessage("copied to clip");
  }


  do_listDirectory() {


    if( !this.context.confirmCookies() ) {
      return;
    }

    this.endMenu();

    var dir = this.context.getDir();
    var row;

    this.context.printLine("");
    this.context.listCodeLine( "0 \u0012\""+dir.title+"          \"\u0092 00 2A");
    for( var i=0; i<dir.files.length; i++) {
      row = this.context.padSpaces6( dir.files[i].size ) +" \"" + dir.files[i].fname + "\"";
      this.context.listCodeLine( row );
    }

    row = dir.free +" slots free.";
    this.context.listCodeLine( row );

    this.context.printReady();


  }

  do_exportVDisk() {
    var data = this.context.getVirtualDisk();

    var blob = new Blob( [data] , {
        type: 'text/plain'
    });

    var objectUrl = URL.createObjectURL(blob);

    var link = document.getElementById( "imageSaver" );
    link.download = "basic64js.vd64";
    link.href = objectUrl;
    link.click();

    this.endMenuWithMessage("downloading vdisk");

  }

  do_exportBas() {
    var data = this.context.getProgramAsText();

    var blob = new Blob( [data] , {
        type: 'text/plain'
    });

    var objectUrl = URL.createObjectURL(blob);

    var link = document.getElementById( "imageSaver" );
    link.download = "myprogram.bas";
    link.href = objectUrl;
    link.click();

    this.endMenuWithMessage("downloading bas");

  }

  do_importBasRun() {

		var uploadElement = document.getElementById( "imageLoader" );

    this.run = true;

		uploadElement.addEventListener('change', this.uploader, true);
		uploadElement.click();
		console.log( "clicked" );

  }

  do_importBas() {

		var uploadElement = document.getElementById( "imageLoader" );
    this.run = false;

		uploadElement.addEventListener('change', this.uploader, true);
		uploadElement.click();
		console.log( "clicked" );

  }

  do_importBasCallBack( text ) {

    var lines = text.split(/\r?\n/);
    var bas = this.context.textLinesToBas( lines );
    //this.context.saveSerializedData( "import", JSON.stringify( bas ), "bas", bas.length );
    this.context.setProgram( bas );

    if( this.run ) {
      this.run = false;
      this.endMenu();
      this.context.printLine("run");
      this.context.runPGM();

    }
    else {
      this.endMenuWithMessage("import ok");
      this.context.printLine("list");

      var pgm = this.context.getProgramLines();
      for (const l of pgm )
        {
          this.context.listCodeLine( l[2] );
          console.log(l[2]);
        }
    }

  }

  do_exportSnapshot() {
    var data = JSON.stringify( this.vmState );

    var blob = new Blob( [data] , {
        type: 'text/plain'
    });

    var objectUrl = URL.createObjectURL(blob);

    var link = document.getElementById( "imageSaver" );
    link.download = "basic64js.snap64";
    link.href = objectUrl;
    link.click();

  }



  do_saveSnapshot() {

    var data = JSON.stringify(this.vmState);

    this.context.saveSerializedData( "snapshot", data, "snp", 65536 );

    this.endMenuWithMessage("snapshot saved");
  }


  do_reset() {
    this.endMenu();
    this.context.reset( true );

  }

  do_documentation() {
    window.open("https://github.com/JoystickAndCursorKeys/basic64-js/wiki",'_blank');

    this.endMenuWithMessage("opened docs");
  }

/*

Keyboard

  Special Chars

  PC - Commodore
  ----------------
  F9 - Power Menu Toggle
  F1 - F1
  F2 - F2
  F3 - F3
  F4 - F4
  F5 - Shift F1
  F6 - Shift F2
  F7 - Shift F3
  F8 - Shift F4
  CTRL/PAUSE - Run/Stop + Restore
  ESCAPE - Stop (RUN/STOP)
  ALT 1-8 - Colors
  ALT 9 - Reverse on
  ALT 0 - Reverse off









*/

}
