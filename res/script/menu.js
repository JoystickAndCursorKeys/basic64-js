class Uploader {

	setCallback ( callbackC, callbackM ) {
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

				_this.callbackC[ _this.callbackM ]( text, thisFileName );

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

    this.uploader = new Uploader( );

    var uploadElement = document.getElementById( "imageLoader" );
    this.runImportedPGMFlag = false;
    this.uploader.setCallback( this, "notset" );

		uploadElement.addEventListener('change', this.uploader, true);

    this.menuvmState = "main";
		this.listSelector = false;
    this.optSelect = 0;

    this.options = {};
    this.menus = {};
    this.menuOffset = {};

    this.stateMemory = new Uint8Array( 256 * 256 );

    var opts = [];
    //opts.push({opt: "status", display: "Status" });
    //opts.push({opt: "loadsave", display: "Load/Save" });

    opts.push({opt: "basicMenu", display: "Basic" });
    opts.push({opt: "diskMenu", display: "Virtual Disk" });
    opts.push({opt: "exportMenu", display: "Import" });
    opts.push({opt: "clipboardMenu", display: "Clipboard" });
    opts.push({opt: "docsSettingsMenu", display: "Settings and docs" });
		opts.push({opt: "toolsMenu", display: "Tools" });
    opts.push({opt: "reset", display: "Reset" });

    this.options["main"] = opts;
    this.menus["main"] = "main";
    this.menuOffset["main"] = 10;

    opts = [];
    opts.push({opt: "copyPGMtoClip", display: "Copy program" });
    opts.push({opt: "pastePGMFromClip", display: "Paste Program" });
		opts.push({opt: "pastePGMFromClipAppend", display: "Paste and Merge" });
    this.options["clipboard"] = opts;
    this.menus["clipboard"] = "clipboard";
    this.menuOffset["clipboard"] = 10;

		opts = [];
    opts.push({opt: "generatePGMUrl",   display: "Generate Program URL" });
	  opts.push({opt: "copyPGMURLtoClip", display: "Generate Inline Program URL" });
    this.options["tools"] = opts;
    this.menus["tools"] = "tools";
    this.menuOffset["tools"] = 3;

    opts = [];
    opts.push({opt: "list", display: "List" });
    opts.push({opt: "renumber", display: "Renumber Basic Program" });
    opts.push({opt: "compress", display: "Remove Spaces" });
    opts.push({opt: "normalize", display: "Normalize Spaces" });
    this.options["basic"] = opts;
    this.menus["basic"] = "basic";
    this.menuOffset["basic"] = 7;

    opts = [];
		opts.push({opt: "importBas", display: "Import Basic Program" });
    opts.push({opt: "importBasRun", display: "Import/Run Basic Program" });
    opts.push({opt: "exportBas", display: "Export Basic Program" });
    opts.push({opt: "importSnapshot", display: "Import Snapshot" });
    opts.push({opt: "exportSnapshot", display: "Export Snapshot" });
    opts.push({opt: "importVDisk", display: "Import Virtual Disk" });
		opts.push({opt: "exportVDisk", display: "Export Virtual Disk" });

    this.options["export"] = opts;
    this.menus["export"] = "export";
    this.menuOffset["export"] = 7;


    opts = [];
    opts.push({opt: "changeExitMode", display: "exit mode" });
    opts.push({opt: "changeImmersiveMode", display: "immersive mode" });
    opts.push({opt: "changeClock", display: "clock mode" });
    opts.push({opt: "changeTurbo", display: "turbo mode" });
    opts.push({opt: "changeExtended", display: "Extended commands" });
		opts.push({opt: "changeZoom", display: "Display" });
		opts.push({opt: "changeTheme", display: "Change Menu Theme" });
    opts.push({opt: "documentation", display: "documentation" });
    this.options["docssettings"] = opts;
    this.menus["docssettings"] = "docs & settings";
    this.menuOffset["docssettings"] = 9;

    opts = [];
    opts.push({opt: "listDirectory", display: "Load File" });
		opts.push({opt: "formatDisk", display: "Format Disk", confirm: true });
    opts.push({opt: "listDisks",    display: "Swap Disks" });
		opts.push({opt: "createDisk",    display: "Create new Disk", confirm: true });

//    opts.push({opt: "listDirectory", display: "Save" });
    opts.push({opt: "saveSnapshot", display:  "Save Snapshot" });
//    opts.push({opt: "listDirectory", display: "Format" });
//    opts.push({opt: "listDirectory", display: "Disk Swap" });
//    opts.push({opt: "listDirectory", display: "Rename Disk" });

    this.options["disk"] = opts;
    this.menus["disk"] = "disk";
    this.menuOffset["disk"] = 12;

    this.themes =  [];


		this.themes.push(
      {
        bg: 2,
        border: 2,
        fg: 0,
        hl: 7,
        logorows: [8,8,7,4],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

		this.themes.push(
      {
        bg: 6,
        border: 6,
        fg: 14,
        hl: 1,
        logorows: [3,3,3,3],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

    this.themes.push(
      {
        bg: 6,
        border: 6,
        fg: 14,
        hl: 1,
        logorows: [8,8,8,8],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

    this.themes.push(
      {
        bg: 6,
        border: 6,
        fg: 14,
        hl: 1,
        logorows: [14,14,14,14],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

    this.themes.push(
      {
        bg: 0,
        border: 0,
        fg: 8,
        hl: 7,
        logorows: [8,8,8,8],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

    this.themes.push(
      {
        bg: 0,
        border: 0,
        fg: 14,
        hl: 1,
        logorows: [6,6,6,6],
        splotches: [[36,2,14],[36,3,14]]
      }
    );

    this.themes.push(
      {
        bg: 0,
        border: 0,
        fg: 5,
        hl: 13,
        logorows: [5,5,5,5],
        splotches: [[36,2,13],[36,3,13]]
      }
    );

		this.themes.push(
			{
				bg: 11,
				border: 11,
				fg: 12,
				hl: 1,
				logorows: [0,0,0,0],
				splotches: [[36,2,7],[36,3,7]]
			}
		);

    this.themes.push(
      {
        bg: 11,
        border: 12,
        fg: 12,
        hl: 1,
        logorows: [0,0,0,0],
        splotches: [[36,2,1],[36,3,1]]
      }
    );

		this.themes.push(
      {
        bg: 14,
        border: 6,
        fg: 6,
        hl: 0,
        logorows: [0,6,3,1],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

		this.themes.push(
      {
        bg: 0,
        border: 5,
        fg: 13,
        hl: 1,
        logorows: [1,1,7,13],
        splotches: [[36,2,8],[36,3,8]]
      }
    );

    this.themes.push(
      {
        bg: 6,
        border: 14,
        fg: 14,
        hl: 1,
        logorows: [5,5,3,5],
        splotches: [[36,2,7],[36,3,7]]
      }
    );
    this.themes.push(
      {
        bg: 6,
        border: 14,
        fg: 14,
        hl: 1,
        logorows: [4,4,8,4],
        splotches: [[36,2,7],[36,3,7]]
      }
    );
    this.themes.push(
      {
        bg: 6,
        border: 14,
        fg: 14,
        hl: 1,
        logorows: [7,7,1,7],
        splotches: [[36,2,7],[36,3,7]]
      }
    );
    this.themes.push(
      {
        bg: 6,
        border: 14,
        fg: 14,
        hl: 1,
        logorows: [1,1,1,1],
        splotches: [[36,2,7],[36,3,7]]
      }
    );

    this.theme = 0;

    var menuSettings = localStorage.getItem( "BJ64_Menu" );
    if( menuSettings != null ) {
      menuSettings = JSON.parse( menuSettings );
      this.theme = menuSettings.theme;
    }

    //this.initLogo();
  }

  initLogo() {

    var context = this.context;

    var logo = getMenuLogo();
    this.logo = logo;

    context.poke( 53265, 27 );
    context.poke( 53272, 12 );
    context.poke( 1, 0 );
    for( var i=0; i<(64*8); i++) {
      context.poke(12288+i, context.peek(53248+i));
    }
    context.poke( 1, 255 );

    for( var i=0; i<this.logo.length; i++) {
      context.poke(12288+(64*8)+i,this.logo[i]);
    }

  }

  rendervmState() {

    var t=this;
    var context = this.context;
    var theme = this.themes[ this.theme ];

    context.poke(53280,theme.border);
    context.poke(53281,theme.bg);
    context.poke(53269,0);
    context.poke(53270,200);

    t.rendervmStateText() ;

  }


  rendervmStateText() {

    var t=this;
    var context = this.context;
    var theme = this.themes[ this.theme ];

    var txtColor = theme.fg;
    var hlColor = theme.hl;
    var cols1= theme.logorows;

    t.console.clearScreen();
    t.console.setColor(txtColor);

    var title = t.menus[ t.menuvmState ];
    var options = this.options[ t.menuvmState ];

		var x;

		//draw logo
		var c=64, xof = 4, yof=1;
    var x,y,addr,caddr;
    for( y = 0; y<4; y++) {
      for( x = 0; x<34; x++) {
        addr = 1024 + xof + x + ((y+yof)*40);
        caddr = 55296 + xof + x + ((y+yof)*40);
        this.context.poke( addr, c );
        var col = cols1[y] ;
        this.context.poke( caddr, col );
        c++;
      }
    }

    for( var i=0;i<theme.splotches.length;i++) {
      var sp = theme.splotches[i];
        x=sp[0];y=sp[1];caddr = 55296 + x + ((y)*40);this.context.poke( caddr, sp[2] );
    }
		//end draw logo

    t.nl();t.nl();t.nl();t.nl();t.nl();t.nl();

		if( !this.selectList ) { //menu
			if( title != "main" ) {
	      var menuStr = "*** " + title +" ***";
	      x = 20 - (Math.floor(menuStr.length / 2));
	      t.padLine( x, menuStr );
	    }

	    t.nl();

	    x=this.menuOffset[ t.menuvmState ];

	    this.curs = [];
	    for( var i=0; i<8 && i<options.length; i++) {

	        if( i == this.optSelect ) {
	          t.console.setColor(hlColor);
	        }
	        else {
	          t.console.setColor(txtColor);
	        }
	        t.pad( x, " " +(i+1)+ " - " + options[i].display );

	        this.curs.push( t.console.getCursorPos() );

	        t.nl();
	        t.nl();
	    }

	    //var selectCursor = this.curs[ this.optSelect ];
	    //t.console.setCursorX( selectCursor[0]);
	    //t.console.setCursorY( selectCursor[1]);

		}
		else { //list

			var menuStr = "*** " + this.listTitle +" ***";
			x = 20 - (Math.floor(menuStr.length / 2));
			var offX = x;
			if( this.listOffset != -1 ) {
				offX = this.listOffset;
			}
			t.padLine( x, menuStr );

			t.nl();

			this.listPage = Math.floor((this.optSelect-2) / 4);
			if( this.listPage < 0) {
				this.listPage = 0;
			}
			var offset = this.listPage * 4;
			var printCount = 0;
			this.curs = [];
			var more = false;

			if( this.showNumbers) {
				if( offset > 0 ) {
					t.pad( offX, "..." );
					t.nl();
					t.nl();
				}
			}
			else {
				if( offset > 0 ) {
					t.pad( offX, "..." );
					t.nl();
				}
				else {
					t.pad( offX, "" );
					t.nl();
				}
			}

			var first = true;
			for( var i=0; i<this.listItems.length; i++) {

					if( i< offset ) {
						continue;
					}
					else {
						if( first ) {
							this.page_first = i;
							first = false;
						}
					}
					this.page_last = i;

					if( !this.showNumbers) {
						if( printCount >= 12 ) {
							more = true;
							break;
						}
					}
					else {
						if( printCount >= 8 ) {
							more = true;
							break;
						}
					}

					if( i == this.optSelect ) {
						t.console.setColor(hlColor);
					}
					else {
						t.console.setColor(txtColor);
					}
					if( this.showNumbers) {
						t.padSave( this.listOffset , " " +(i+1)+ " - " + this.listItems[i].name );
						t.nl();
					}
					else {
						t.printCodeLine( this.listItems[i].name );
					}

					this.curs.push( t.console.getCursorPos() );

					printCount++;
			}
			if( more ) {
				t.pad( offX, "..." );
			}
		}
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

	padSave( pad, txt ) {

    var padStr = "";
    for(var i=0; i<pad;i++) {
      padStr+=" ";
    }

    this.context.printLine( padStr + txt.toUpperCase() );
  }


	printCodeLine( x ) {
		this.context.listCodeLine( x );
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
        pgmState: this.context.getProgramState(),
    }

    var mem = this.console.getMemory();
    for( var i=0; i<(256*256); i++) {
      this.stateMemory[ i ] = mem[ i ];
    }

    console.log( this.vmState );
    this.initLogo();
    this.rendervmState();

  }

	startList( l ) {

    this.selectList = true;
		this.oldOptSelect = this.optSelect;
		this.optSelect = 0;
		this.listPage = 0;
	  this.listTitle = l.title;
		this.listItems = l.items;
		this.listResult = -1;
		this.listCallback = l.callback;
		this.listOffset = -1;
		this.listAtExit = "close";
		if( ! (l.offset === undefined ) ) {
			this.listOffset = l.offset;
		}
		if( ! (l.atExit === undefined ) ) {
			this.listAtExit = l.atExit;
		}
		this.showNumbers = true;
		if( ! (l.showNum === undefined ) ) {
			this.showNumbers = l.showNum;
		}

		this.rendervmStateText();
  }


  message( m ) {
    this.context.printLine("*** " + m);
  }

  errorMessage( m, extra0 ) {
		var extra = "";
		if( ! (extra0 === undefined )) {
			extra = " " + extra0;
		}
    this.context.printLine("??" + m + " error" + extra);
  }

  stop() {
    console.log( "End menu");

    this.console.setState( this.vmState.console );

    var mem = this.console.getMemory();
    for( var i=0; i<(256*256); i++) {
      mem[i] = this.stateMemory[ i ];
    }
    this.console.clearCursor();
		//this.context.setBorderChangedFlag();
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

  endMenuWithError( m, extra ) {
    this.context.endMenu();
    this.stop();
    this.context.printLine( "" );
    this.errorMessage(m, extra);

  }



  handleKey( evt ) {

    if( evt.key == "Enter") {

			if( this.selectList == true ) {

					var listIndex = this.optSelect;

					console.log("List selected " + listIndex );
					console.log("List selected item " + this.listItems[listIndex].id );

					if( this.listAtExit != "stay" ) {

        		this.selectList = false;
						this.optSelect = this.oldOptSelect;

					}

					this.rendervmStateText();

					this[ this.listCallback ]( this.listItems[listIndex].id,
						{
							ixFrom: this.page_first,
							ixTo:  this.page_last
						});

      }
			else {
				var options = this.options[ this.menuvmState ];

	      console.log( this.optSelect );

	      var opt = options[ this.optSelect ];

				if( ! opt.confirm ) {
					this[ "do_" +  opt.opt ]();
				}
	      else {
					this.chooseYesOrNo( opt.display , "do_" +  opt.opt);
				}
			}
    }
    if( evt.key == "Escape") {

			if( this.selectList == true ) {
        this.selectList = false;
				this.optSelect = this.oldOptSelect;
				this.rendervmStateText();
      }
      else if( this.menuvmState == "main" ) {
        this.endMenu();
      }
      else {
        this.do_mainMenu();
      }

    }
    else if( evt.key == "Pause" && evt.ctrlKey) {
    }
    else if( evt.key == "ArrowUp") {
      //var options = this.options[ this.menuvmState ];
      if( (this.optSelect) >0 ) {
        this.optSelect--;
        this.rendervmStateText();
        evt.preventDefault();
      }
    }
    else if( evt.key == "ArrowDown") {

			if( this.selectList == true ) {
				if( (this.optSelect+1) < this.listItems.length ) {
	        this.optSelect++;
	        this.rendervmStateText();
	      }
			}
			else
			{
				var options = this.options[ this.menuvmState ];
	      if( (this.optSelect+1) < options.length ) {
	        this.optSelect++;
	        this.rendervmStateText();
	      }
			}
			evt.preventDefault();
    }
    else if( evt.key == "F1" || evt.key == "1") {
      this.executeOption( 0 );
      evt.preventDefault();
    }
    else if( evt.key == "F2" || evt.key == "2") {
      this.executeOption( 1 );
      evt.preventDefault();
    }
    else if( evt.key == "F3" || evt.key == "3") {
      this.executeOption( 2 );
      evt.preventDefault();
    }
    else if( evt.key == "F4" || evt.key == "4") {
      this.executeOption( 3 );
      evt.preventDefault();
    }
    else if( evt.key == "F5" || evt.key == "5") {
      this.executeOption( 4 );
      evt.preventDefault();
    }
    else if( evt.key == "F6" || evt.key == "6") {
      this.executeOption( 5 );
      evt.preventDefault();
    }
    else if( evt.key == "F7" || evt.key == "7") {
      this.executeOption( 6 );
      evt.preventDefault();
    }
    else if( evt.key == "F8" || evt.key == "8") {
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


  do_docsSettingsMenu() {
    this.menuvmState = "docssettings";
    this.optSelect = 0
    this.rendervmState();
  }

  do_exportMenu() {
    this.menuvmState = "export";
    this.optSelect = 0
    this.rendervmState();
  }

  do_diskMenu() {
    this.menuvmState = "disk";
    this.optSelect = 0
    this.rendervmState();
  }

	do_toolsMenu() {
    this.menuvmState = "tools";
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

  do_basicMenu() {
    this.menuvmState = "basic";
    this.optSelect = 0
    this.rendervmState();
  }


	do_copyPGMURLtoClip() {

		var text = this.context.getProgramAsText();

		var url = window.location +
							"?pgm=" +
							encodeURIComponent(btoa( text ));

	  console.log( url );
		console.log( btoa( text ) );

		console.log( atob( btoa( text ) ) );

		navigator.clipboard.writeText( url );

		this.endMenuWithMessage("url to clip");
	}

	do_generatePGMUrl() {

    registerClipboardCallback( this, "do_generatePGMUrlCallBack" );
    enableConvertLinkWidget();
    this.runImportedPGMFlag = false;
  }

	do_generatePGMUrlCallBack( text ) {

		var encodedLink = encodeURIComponent( text );
		setLinkCallbackText( document.URL +  "?linkpgm=" + encodedLink );
  }


  do_copyPGMtoClip() {
    navigator.clipboard.writeText( this.context.getProgramAsText() );

    this.endMenuWithMessage("copied to clip");
  }

	do_pastePGMFromClipAppend() {

    registerClipboardCallback( this, "do_pastePGMFromClipAppendCallback" );
    enableClipBoardWidget();
    this.runImportedPGMFlag = false;
  }

  do_pastePGMFromClip() {

    registerClipboardCallback( this, "do_pastePGMFromClipCallback" );
    enableClipBoardWidget();
    this.runImportedPGMFlag = false;
  }


	do_pastePGMFromClipAppendCallback( text ) {

    console.log("callback3");
    var lines = text.split(/\r?\n/);

    try {
      var bas = this.context.textLinesToBas( lines );
      this.context.appendProgram( bas );

        this.endMenuWithMessage("paste ok");
        this.context.printLine("list");

        var pgm = this.context.getProgramLines();
        for (const l of pgm )
          {
            this.context.listCodeLine( l[2] );
            console.log(l[2]);
          }

    }
    catch (e) {
      this.endMenuWithError("syntax");
    }
  }

  do_pastePGMFromClipCallback( text ) {

    console.log("callback2");
    var lines = text.split(/\r?\n/);

    try {
      var bas = this.context.textLinesToBas( lines );
      this.context.setProgram( bas );

      this.endMenuWithMessage("paste ok");
      this.context.printLine("list");

      var pgm = this.context.getProgramLines();
      for (const l of pgm )   {
          this.context.listCodeLine( l[2] );
          console.log(l[2]);
      }
    }
    catch (e) {
			if( typeof(e) == "object" ) {
				if(! (e["lineNr"] === undefined )) {
					this.endMenuWithError("parse", "on line " + e["lineNr"]);
					return;
				}
			}
      this.endMenuWithError("syntax");
    }
  }

	do_listDisks() {

    if( !this.context.confirmCookies() ) {
      return;
    }

		var list = { title: "Select Disk", items: [] };

		var disks = this.context.getDisks();
		for( var i=0; i<disks.length; i++) {
			list.items.push( { name: disks[i], id:  disks[i] } );
		}

		list.callback = "select_Disk";

		this.startList( list );

	}

	select_Disk( id ) {

		this.context.selectDisk( id );
	}

	select_ExitMode( id ) {
		localStorage.setItem( "BJ64_ExitMode", JSON.stringify( { exitmode: id } ) );

		if( id == "stay" ) {
			this.context.setExitMode("stay");
		}
		else {
			this.context.setExitMode("panic");
		}

	}

	select_ImmersiveMode( id ) {
		localStorage.setItem( "BJ64_ImmersiveMode", JSON.stringify( { immersive: id } ) );

		if( id == "immersive" ) {
			this.context.setImmersiveFlag(true);
			this.context.setBorderChangedFlag();
		}
		else {
			this.context.setImmersiveFlag(false);
			default_Document_Page_Color();
		}

	}

	select_Clock( id ) {
		console.log( id );

		localStorage.setItem( "BJ64_Clock", JSON.stringify( { synchronized: id } ) );

		if( id == "clocksync" ) {
			this.context.synchClock();
		}
	}


	select_Extended( id ) {
		console.log( id );

		localStorage.setItem( "BJ64_Extended", JSON.stringify( { extended: id } ) );

		if( id == "on" ) {
			this.context.enableExtended( true );
		}
	}

	do_createDisk() {
		if( !this.context.confirmCookies() ) {
			return;
		}

		this.context.createDisk();
		this.infoBox("a new disk has been created");
	}

	do_formatDisk() {
		if( !this.context.confirmCookies() ) {
			return;
		}
		console.log( "do_FormatDisk" );

		//this.context.formatDisk();
		console.log("Formating Disk...");

		this.infoBox("Disk has been formatted");
	}

	chooseYesOrNoCallBack( id ) {

		if( id == "yes" ) {
			this[this.chooseYesCallBack]();
		}

	}

	chooseYesOrNo( action, callback ) {

		var list = { title: action + " - Are you sure?", items: [
			{ name: "Yes", id: "yes"},
			{ name: "No",  id: "no"}
		] };

		this.chooseYesCallBack = callback;
		list.callback = "chooseYesOrNoCallBack";

		console.log("list options");
		this.startList( list );

	}

	emptyCallBack( id ) {
	}

	infoBox( info  ) {

		var list = { title: info, items: [
			{ name: "Ok", id: "ok"}
		] };

		list.callback = "emptyCallBack";

		this.startList( list );

	}

	do_changeZoom() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Select Zoom", items: [
			{ name: "1.0x", id: "1.0"},
			{ name: "1.5x", id: "1.5"},
			{ name: "2.0x", id: "2.0"},
			{ name: "2.5x", id: "2.5"},
			{ name: "3.0x", id: "3.0"},
			{ name: "3.5x", id: "3.5"},
			{ name: "4.0x", id: "4.0"},
			{ name: "4.5x", id: "4.5"},
			{ name: "5.0x", id: "5.0"},
			{ name: "5.5x", id: "5.5"}

		] };

		list.callback = "select_Zoom";
		list.atExit = "stay";

		console.log("list options");
		this.startList( list );

	}

	select_Zoom( id ) {
		console.log( id );

		localStorage.setItem( "BJ64_Zoom", JSON.stringify( { zoom: id } ) );

		this.context.setScale( id );
	}

	do_changeExtended() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Extended Commands", items: [
			{ name: "on at startup", id: "on"},
			{ name: "'XON' command to enable", id: "xon"}
		] };

		list.callback = "select_Extended";

		console.log("list options");
		this.startList( list );

	}

	select_Turbo( id ) {
		console.log( id );

		localStorage.setItem( "BJ64_Turbo", JSON.stringify( { turbo: id } ) );

		if( id == "on" ) {
			this.context.setTurbo( true );
		}
	}

	select_List( id, page ) {
		console.log( id, page  );
		this.endMenuWithMessage("LISTING PAGE");

		var pgm = this.context.getProgramLines();

		for(var i=page.ixFrom; i<=page.ixTo; i++ )
		{
				var l = pgm[i];
				var display = l[2].trim();
				if( display.length > 35 ) {
					display = l[2].substr(0,34)+"..";
				}
				this.context.listCodeLine( l[2] );
				//console.log(l[2]);
		}

	}


	do_list() {

		var list = { title: "Basic Listing", showNum: false, offset:0, items: []
//			{ name: "compatible",   id: "compat"},
//			{ name: "synchronized with host", id: "clocksync"}
		 };

		list.callback = "select_List";

		var pgm = this.context.getProgramLines();
		for( var i=0; i<pgm.length; i++ )
		{
				var l = pgm[i];
				var display = l[2].trim();
				if( display.length > 35 ) {
					display = l[2].substr(0,34)+"..";
				}
				list.items.push({name: display, id: i});
//				this.context.listCodeLine( l[2] );
				console.log(l[2]);
		}

		this.startList( list );

	}


	do_changeExitMode() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "when program exists:", items: [
			{ name: "stay in current graphics mode",   id: "stay"},
			{ name: "return to text mode", id: "panic"}
		] };

		list.callback = "select_ExitMode";

		this.startList( list );

	}

	do_changeImmersiveMode() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "immersive mode:", items: [
			{ name: "on",   id: "immersive"},
			{ name: "off", id: "off"}
		] };

		list.callback = "select_ImmersiveMode";

		this.startList( list );

	}

	do_changeClock() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Clock Mode", items: [
			{ name: "compatible",   id: "compat"},
			{ name: "synchronized with host", id: "clocksync"}
		] };

		list.callback = "select_Clock";

		this.startList( list );

	}


	do_changeTurbo() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Turbo Mode", items: [
			{ name: "on at startup", id: "on"},
			{ name: "'turbo' command to enable", id: "manual"}
		] };

		list.callback = "select_Extended";

		console.log("list options");
		this.startList( list );

	}

	select_File( id ) {

		this.endMenu();
		console.log( id );
		this.context.load( id );

		this.context.printLine("list");

		var pgm = this.context.getProgramLines();
		for (const l of pgm )
			{
				this.context.listCodeLine( l[2] );
				console.log(l[2]);
			}
	}

  do_listDirectory() {

		if( !this.context.confirmCookies() ) {
      return;
    }

		var list = { title: "Directory", items: [] };
		var dir = this.context.getDir();
		var row;

		for( var i=0; i<dir.files.length; i++) {
			list.items.push( { name: dir.files[i].fname.trim(), id:  dir.files[i].fname } );

		}

		list.callback = "select_File";

		console.log("list dir");
		this.startList( list );
  }

  do_renumber() {
    this.renumber(100,10);
  }

  do_normalize() {
    this.context.normalizeProgram();

    this.endMenuWithMessage("normalize ok");
    this.context.printLine("list");

    var pgm = this.context.getProgramLines();
    for (const l of pgm )
      {
        this.context.listCodeLine( l[2] );
        console.log(l[2]);
      }
  }

	do_compress() {
    this.context.compressProgram();

    this.endMenuWithMessage("compress ok");
    this.context.printLine("list");

    var pgm = this.context.getProgramLines();
    for (const l of pgm )
      {
        this.context.listCodeLine( l[2] );
        console.log(l[2]);
      }
  }

  renumber(x,y) {
    this.context.renumberProgram(x,y);

    this.endMenuWithMessage("renumber ok");
    this.context.printLine("list");

    var pgm = this.context.getProgramLines();
    for (const l of pgm )
      {
        this.context.listCodeLine( l[2] );
        console.log(l[2]);
      }
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

  do_importVDisk() {
    var uploadElement = document.getElementById( "imageLoader" );

    this.runImportedPGMFlag = true;
    this.uploader.setCallback( this, "do_importVDiskCallBack" );

		uploadElement.click();
		console.log( "clicked" );

  }

  do_importVDiskCallBack( text, fName ) {
    console.log("import vdisk " + text);
    console.log("import vdisk " + fName);
    var diskName = fName;

    if( diskName == null || diskName == "") {
      diskName = "noname";
    }

    if( diskName.endsWith(".vd64") ) {
      diskName = diskName.substring(0,diskName.length-5);
    }
    this.context.createDiskFromImage( diskName, JSON.parse( text ) );
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

    this.runImportedPGMFlag = true;
    this.uploader.setCallback( this, "do_importBasCallBack" );

		uploadElement.click();
		console.log( "clicked" );

  }

  do_importBas() {

		var uploadElement = document.getElementById( "imageLoader" );
    this.runImportedPGMFlag = false;

    this.uploader.setCallback( this, "do_importBasCallBack" );

		uploadElement.click();
		console.log( "clicked" );

  }

  do_importBasCallBack( text, fName ) {

    var lines = text.split(/\r?\n/);
		try {
    	var bas = this.context.textLinesToBas( lines );
		}
		catch (e) {
			this.endMenuWithMessage("syntax on import");
			console.log( e );
			return;
		}

		try {
    	this.context.setProgram( bas );
		}
		catch (e) {
			this.endMenuWithMessage("setpgm on import");
			console.log( e );
			console.log( text );
			return;
		}

    if( this.runImportedPGMFlag ) {
      this.runImportedPGMFlag = false;
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

  do_importSnapshot() {

		var uploadElement = document.getElementById( "imageLoader" );
    this.runImportedPGMFlag = false;

    this.uploader.setCallback( this, "do_importSnapshotCallBack" );

		uploadElement.click();
		console.log( "clicked" );

  }

  do_importSnapshotCallBack( text, fName ) {

    console.log("Import Snapshot");

    this.endMenuWithMessage("snapshot restore");

    this.context.loadContainer(
      {
        type: "snp",
        data: text
      });
  }

  do_saveSnapshot() {

    var data = JSON.stringify(this.vmState);

    this.context.saveSerializedData( "SNAPSHOT", data, "snp", 65536 );

    this.endMenuWithMessage("snapshot saved");
  }

  do_reset() {
    this.endMenu();
    this.context.reset( true );
  }

  do_changeTheme() {
      this.theme++;
      if( this.theme > (this.themes.length - 1) ) {
        this.theme = 0;
      }

      if( this.context.confirmCookies() ) {
        localStorage.setItem( "BJ64_Menu", JSON.stringify( { theme: this.theme } ) );
      }

      this.rendervmState();
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
