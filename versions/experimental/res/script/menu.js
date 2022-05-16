class Uploader {

	setCallback ( callbackC, callbackM ) {
		this.callbackC = callbackC;
		this.callbackM = callbackM;
		this.debugFlag = false;
	}

	handleEvent(evt) {
		if( this.debugFlag ) {
			console.log("handleEvent " + evt.type);
		}

		switch(evt.type) {
		case "change":
			if( this.debugFlag ) {
				console.log("--------------handle upload event");
				console.log(evt);
			}
			this.handleUpload( evt );

		break;
		}
	}

	handleUpload(e){

		if( this.debugFlag ) {
    	console.log("handleUpload " + e);
		}

		var reader = new FileReader();

		var thisFileName = e.target.files[0].name;
		var _this = this;

		reader.onload = function(event){

				if( this.debugFlag ) {
					console.log("reader onload " + thisFileName);
				}

				var text =  event.target.result ;
				if( this.debugFlag ) {
					console.log( text );
				}

				_this.callbackC[ _this.callbackM ]( text, thisFileName );

		}

		if( this.debugFlag ) {
			console.log("read " + e.target.files[0]);
			console.log(e.target.files[0]);
		}

		reader.readAsText(e.target.files[0]);

	}
}


class Menu {

  constructor( screen, context ) {

		this.debugFlag = false;
    this.console = screen;
    this.context = context;
    this.erh = new ErrorHandler();

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

		this.directPageMode = false;

    this.stateMemory = new Uint8Array( 256 * 256 );

    var opts = [];
    //opts.push({opt: "status", display: "Status" });
    //opts.push({opt: "loadsave", display: "Load/Save" });

    opts.push({opt: "diskMenu", display: "Virtual Disk" });
    opts.push({opt: "basicMenu", display: "Basic" });
    opts.push({opt: "exportMenu", display: "Import" });
    opts.push({opt: "clipboardMenu", display: "Clipboard" });
    opts.push({opt: "docsSettingsMenu", display: "Settings and docs" });
		opts.push({opt: "toolsMenu", display: "Tools" });
    opts.push({opt: "reset", display: "Reset" });

    this.options["main"] = opts;
    this.menus["main"] = "main";
    this.menuOffset["main"] = 10;

    opts = [];
		opts.push({opt: "copyPGMtoClipTokens", display: "Copy program - tokens" });
		opts.push({opt: "copyPGMtoClipNoPet", display: "Copy program - nopet" });
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
    opts.push({opt: "compress2", display: "Compress" });
		opts.push({opt: "PETSCIIreplace", display: "Strip PETSCII Chars" });
    opts.push({opt: "normalize", display: "Normalize Spaces" });
    this.options["basic"] = opts;
    this.menus["basic"] = "basic";
    this.menuOffset["basic"] = 4;

    opts = [];
		opts.push({opt: "importBas", display: "Import Basic Program" });
    opts.push({opt: "importBasRun", display: "Import/Run Basic Program" });
    opts.push({opt: "exportBas", display: "Export Basic Program" });
		opts.push({opt: "exportBasNoPETSCII", display: "Export Basic Program:nopet" });
    opts.push({opt: "importSnapshot", display: "Import Snapshot" });
    opts.push({opt: "exportSnapshot", display: "Export Snapshot" });
    opts.push({opt: "importVDisk", display: "Import Virtual Disk" });
		opts.push({opt: "exportVDisk", display: "Export Virtual Disk" });

    this.options["export"] = opts;
    this.menus["export"] = "export";
    this.menuOffset["export"] = 5;

    opts = [];
    opts.push({opt: "changeExitMode", display: "exit mode" });
		opts.push({opt: "changeListingMode", display: "enhanced listing" });
    opts.push({opt: "changeClock", display: "clock sync" });
    opts.push({opt: "changeTurbo", display: "speed" });
    opts.push({opt: "changeRenum", display: "renumber mode" });
    opts.push({opt: "changeExtended", display: "Extended commands" });
		opts.push({opt: "changeDisplay", display: "Zoom" });
		opts.push({opt: "changeDisplay2", display: "Colors" });
		opts.push({opt: "changeDisplay3", display: "Border" });
		opts.push({opt: "changeTheme", display: "Change Menu Theme" });
    opts.push({opt: "documentation", display: "documentation" });
    this.options["docssettings"] = opts;
    this.menus["docssettings"] = "docs & settings";
    this.menuOffset["docssettings"] = 9;

    opts = [];
    opts.push({opt: "listDirectory", display: "Load File" });
		opts.push({opt: "saveSnapshot", display:  "Save Snapshot" });
    opts.push({opt: "listDisks",    display: "Swap Disks" });
		opts.push({opt: "formatDisk", display: "Format Disk", confirm: true });
		opts.push({opt: "createDisk",    display: "Create new Disk", confirm: true });

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

	rendervmLogo( theme, cols1 ) {

			var c=64, xof = 4, yof=1;
			var t = this;
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

			t.nl();t.nl();t.nl();t.nl();t.nl();t.nl();
	}


  rendervmStateMenuPage( theme ) {

		var x;
		var t=this;
		var maxPrintCount, verticalLinePadding;
    var title = t.menus[ t.menuvmState ];
		var options = this.options[ t.menuvmState ];
    var txtColor = theme.fg;
    var hlColor = theme.hl;
    var cols1= theme.logorows;

		if( title != "main" ) {
			var menuStr = "*** " + title +" ***";
			x = 20 - (Math.floor(menuStr.length / 2));
			t.padLine( x, menuStr );
		}

		t.nl();

		x=this.menuOffset[ t.menuvmState ];

		if( options.length<=8 ) {
				maxPrintCount = 8;
				verticalLinePadding = true;
		}
		else {
				maxPrintCount = 16;
				verticalLinePadding = false;
		}

		for( var i=0; i<maxPrintCount && i<options.length; i++) {

			if( i == this.optSelect ) {
				t.console.setColor(hlColor);
			}
			else {
				t.console.setColor(txtColor);
			}
			t.pad( x, " " +(i+1)+ " - " + options[i].display );

			t.nl();
			if( verticalLinePadding ) {
				t.nl();
			}
		}

	}


  rendervmStateListPage( theme, drawLogo ) {

		var x;
		var t = this;
		var maxPrintCount, verticalLinePadding = false;
    var txtColor = theme.fg;
    var hlColor = theme.hl;
		var drawTitle = drawLogo;

		if( drawLogo ) {
			maxPrintCount = 7;
			verticalLinePadding = true;
		}
		else {

			maxPrintCount = 23;
			verticalLinePadding = false;

		}

		if( drawTitle ) {

			var menuStr = "*** " + this.listTitle +" ***";
			x = 20 - (Math.floor(menuStr.length / 2));
			var offX = x;
			if( this.listOffset != -1 ) {
				offX = this.listOffset;
			}
			t.padLine( x, menuStr );

			t.nl();

		}

		var more = false;
		var first = true;
		var printCount = 0;
		var firstItem = this.optSelect - ( maxPrintCount / 2)

		if( firstItem > 0 ) {
				t.pad( offX, "..." );
				t.nl();
		}
		else {
				t.pad( offX, "" );
				t.nl();
		}

		for( var i=0; i<this.listItems.length; i++) {

				if( i< firstItem ) {
					continue;
				}
				else {
					if( first ) {
						this.page_first = i;
						first = false;
					}
				}
				this.page_last = i;

				if( printCount >= maxPrintCount ) {
					more = true;
					break;
				}

				if( i == this.optSelect ) {
					t.console.setColor(hlColor);
				}
				else {
					t.console.setColor(txtColor);
				}

				if( this.showNumbers) {
					t.padSave( this.listOffset , " " +(i+1)+ " - " + this.listItems[i].name );
				}
				else {
					t.printCodeLine( this.listItems[i].name );
				}

				if( verticalLinePadding ) {
					t.nl();
				}

				printCount++;
		}
		if( more ) {
			t.pad( offX, "..." );
		}
	}

  rendervmStateText() {

		var x;
		var maxPrintCount;
		var verticalLinePadding;

    var t=this;
    var context = this.context;
    var theme = this.themes[ this.theme ];

    var txtColor = theme.fg;
    var hlColor = theme.hl;
    var cols1= theme.logorows;

    t.console.clearScreen();
    t.console.setColor(txtColor);

    var options = this.options[ t.menuvmState ];

		var drawMenu = !this.selectList;

		var drawLogo = ( !this.hideLogo || drawMenu );
		var drawMenuPage = !this.selectList;
		var drawListPage = !drawMenuPage;

		if( drawLogo ) {
			this.rendervmLogo( theme, cols1 );
		}

		if( drawMenuPage ) {

				this.rendervmStateMenuPage( theme );

		}
		else if( drawListPage ) {

				this.rendervmStateListPage( theme, drawLogo );

		}
		else {
			throw "unexpected error";
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

    this.context.printLineVisibleChars( padStr + txt.toUpperCase() );
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

	saveState() {
		console.log("Implement me");
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

		if( this.debugFlag ) {
    	console.log( this.vmState );
		}
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
		this.hideLogo = false;
		if( l.hideLogo ) {
			this.hideLogo = true;
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
		if( this.debugFlag ) {
    	console.log( "End menu");
		}

    this.console.setState( this.vmState.console );

    var mem = this.console.getMemory();
    for( var i=0; i<(256*256); i++) {
      mem[i] = this.stateMemory[ i ];
    }
    this.console.clearCursor();
		this.directPageMode = false;

  }

  endMenu() {
    this.context.endMenu();
		this.context.updateEditMode();
    this.stop();
  }

  endMenuWithMessage( m, detailError ) {
    this.context.endMenu();
    this.stop();
    this.context.printLine( "" );
		if( ! (detailError === undefined) ) {
			this.message(m);
			this.context.printLine( "" );
			this.context.printLine( "?" + detailError.typeError );
			this.context.printLine( "!" + detailError.detailError );
		}
    else {
			this.message(m);
		}

  }

  endMenuWithError( m, extra ) {
    this.context.endMenu();
    this.stop();
    this.context.printLine( "" );
    this.errorMessage(m, extra);

  }



  handleKey( evt ) {

		var pageSize = 10;

    if( evt.key == "Enter") {

			if( this.selectList == true ) {

					var listIndex = this.optSelect;

					if( this.debugFlag ) {
						console.log("List selected " + listIndex );
						console.log("List selected item " + this.listItems[listIndex].id );
					}

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

				if( this.debugFlag ) {
	      	console.log( this.optSelect );
				}

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


				if( this.directPageMode ) {
						this.endMenu();
						return;
				}

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
//---
    else if( evt.key == "PageUp") {

      if( (this.optSelect) > 0 ) {
        this.optSelect-=pageSize;
				if( this.optSelect < 0 )  {
					this.optSelect = 0;
				}
        this.rendervmStateText();
        evt.preventDefault();
      }
    }
    else if( evt.key == "PageDown") {

			var len = this.options[ this.menuvmState ].length;

			if( this.selectList == true ) {
				len = this.listItems.length;
			}

			if( ( this.optSelect + 1 ) < len ) {
        this.optSelect+=pageSize;
				if( (this.optSelect) >= len ) {
					this.optSelect = len - 1;
				}

      }

			this.rendervmStateText();
			evt.preventDefault();
    }
//---
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

			if( this.debugFlag ) {
      	console.log( this.optSelect );
			}

      var opt = options[ this.optSelect ];

			if( this.debugFlag ) {
      	console.log( opt );
			}
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


	int_getURLWithoutParams() {
		var url = document.URL;
		if( url.indexOf( "?") ) {
			var x=url.split("?");
			return x[0];
		}
		return url;
	}

	do_copyPGMURLtoClip() {

		var text = this.context.getProgramAsText();

		var url = this.int_getURLWithoutParams() +
							"?pgm=" +
							encodeURIComponent(btoa( text ));

		if( this.debugFlag ) {
	  	console.log( url );
			console.log( btoa( text ) );

			console.log( atob( btoa( text ) ) );
		}

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
		setLinkCallbackText( this.int_getURLWithoutParams() +  "?linkpgm=" + encodedLink );
  }

  do_copyPGMtoClipNoPet() {
    navigator.clipboard.writeText( this.context.getProgramAsTextNoPETSCII() );

    this.endMenuWithMessage("copied to clip");
  }

  do_copyPGMtoClipTokens() {
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

		if( this.debugFlag ) {
    	console.log("callback3");
		}

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

						if( this.debugFlag ) {
            	console.log(l[2]);
						}
          }

    }
		catch (e) {

			this.endMenuWithMessage("parse error on import", detailError);
			var detailError = this.handleImportError( e );
			console.log( e );
			return;
		}
  }

  do_pastePGMFromClipCallback( text ) {

		if( this.debugFlag ) {
    	console.log("callback2");
		}

    var lines = text.split(/\r?\n/);

    try {
      var bas = this.context.textLinesToBas( lines );
      this.context.setProgram( bas );

      this.endMenuWithMessage("paste ok");
      this.context.printLine("list");



      var pgm = this.context.getProgramLines();
      for (const l of pgm )   {
          this.context.listCodeLine( l[2] );
          if( this.debugFlag ) {
						console.log(l[2]);
					}
      }

    }
		catch (e) {

			this.endMenuWithMessage("parse error on import", detailError);
			var detailError = this.handleImportError( e );
			console.log( e );
			return;
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


	select_ListingMode( id ) {
		localStorage.setItem( "BJ64_ListingMode", JSON.stringify( { listing: id } ) );

		if( id == "enhanced" ) {
			this.context.setListModeEnhanced(true);
		}
		else {
			this.context.setListModeEnhanced(false);
		}

	}

	select_Clock( id ) {
		if( this.debugFlag ) {
			console.log( id );
		}

		localStorage.setItem( "BJ64_Clock", JSON.stringify( { synchronized: id } ) );

		if( id == "clocksync" ) {
			this.context.synchClock();
		}
	}


	select_Extended( id ) {
		if( this.debugFlag ) {
			console.log( id );
		}

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

		if( this.debugFlag ) {
			console.log( "do_FormatDisk" );
		}
		this.context.formatDisk();

		if( this.debugFlag ) {
			console.log("Formating Disk...");
		}

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

		if( this.debugFlag ) {
			console.log("list options");
		}

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


		do_changeDisplay2() {

			if( !this.context.confirmCookies() ) {
				return;
			}

			var list = { title: "Color Options", items: [
				{ name: "Saturation 0.0", id: "sat:0.0"},
				{ name: "Saturation 0.2", id: "sat:0.2"},
				{ name: "Saturation 0.4", id: "sat:0.4"},
				{ name: "Saturation 0.6", id: "sat:0.6"},
				{ name: "Saturation 0.8", id: "sat:0.8"},
				{ name: "Saturation 1.0", id: "sat:1.0"},
				{ name: "Saturation 1.2", id: "sat:1.2"},
				{ name: "Saturation 1.4", id: "sat:1.4"}

			] };

			list.callback = "select_Display";
			list.atExit = "stay";

			if( this.debugFlag ) {
				console.log("list options");
			}

			this.startList( list );

		}

		do_changeDisplay3() {

			if( !this.context.confirmCookies() ) {
				return;
			}

			var list = { title: "Display Options", items: [
				{ name: "Side Borders", id: "sideborders"},
				{ name: "Fat Borders", id: "fatborders"},

			] };

			list.callback = "select_Display";
			list.atExit = "stay";

			if( this.debugFlag ) {
				console.log("list options");
			}

			this.startList( list );

		}

	do_changeDisplay() {

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
			{ name: "5.5x", id: "5.5"},

		] };

		list.callback = "select_Display";
		list.atExit = "stay";

		if( this.debugFlag ) {
			console.log("list options");
		}

		this.startList( list );

	}

	select_Display( id ) {
		if( this.debugFlag ) {
			console.log( id );
		}

		if( id == "sideborders" ) {
			this.context.toggleSideBorders();
			var flag = this.context.getSideBordersFlag();
			localStorage.setItem( "BJ64_SideBorder", JSON.stringify( { sideborder: flag } ) );

			if( flag == false ) {
				this.context.setImmersiveFlag( false );
				default_Document_Page_Color();

				localStorage.setItem( "BJ64_ImmersiveMode", JSON.stringify( { immersive: "off" } ) );
			}
		}
		else if( id == "fatborders" ) {

			var imF = this.context.getImmersiveFlag();
			imF = !imF;

			this.context.setImmersiveFlag( imF );
			if(!imF) { default_Document_Page_Color(); }

			var label = "immersive";
			if( !imF ) { label = "off"; }
			localStorage.setItem( "BJ64_ImmersiveMode", JSON.stringify( { immersive: label } ) );

		}
		else if( id.startsWith( "sat:" ) ) {
			var sat = id.split(":")[1];
			this.context.setSaturation( sat );

			localStorage.setItem( "BJ64_Saturation", JSON.stringify( { saturation: sat } ) );
		}
		else {
			localStorage.setItem( "BJ64_Zoom", JSON.stringify( { zoom: id } ) );

			this.context.setScale( id );
		}

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

		if( this.debugFlag ) {
			console.log("list options");
		}

		this.startList( list );

	}

	select_RenumberMode( id ) {
		if( this.debugFlag ) {
			console.log( id );
		}

		localStorage.setItem( "BJ64_Renum", JSON.stringify( { renumMode: id } ) );

		this.context.setRenumMode( id );
	}

	select_Turbo( id ) {
		if( this.debugFlag ) {
			console.log( id );
		}

		localStorage.setItem( "BJ64_Turbo", JSON.stringify( { turbo: id } ) );

		if( id == "on" ) {
			this.context.setTurbo( true );
		}
	}



	select_List( id, page ) {
		if( this.debugFlag ) {
			console.log( id, page  );
		}
		this.endMenu(); //WithMessage("LISTING PAGE");
		this.console.clearScreen();
		this.message( "LISTING PAGE" );

		var pgm = this.context.getProgramLines();
		var start = id-3;

		if( start < 0 ) { start = 0; }

		var col1 = this.console.getColor();
		var col2 = 1;
		if( col1 == 1 ) { col2 = 7; }
		var max = 20;
		var hlY = 0;

		for(var i=start; max>0 && i<pgm.length; i++ )
		{
				var l = pgm[i];
				if( id == i ) {
					this.console.setColor( col2 );
					hlY = this.console.getCursorY();
					this.context.listCodeLine( l[2] );
					this.console.setColor( col1 );
				}
				else {
					this.context.listCodeLine( l[2] );
				}

				if( l[2].length > 38 ) {
						max-=2;
				}
				else {
					max-=1;
				}
		}

		this.console.setCursorY( hlY );

	}

  start2() {

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

		if( this.debugFlag ) {
    	console.log( this.vmState );
		}
    this.initLogo();

  }

/*
		HINTS for restore
    this.menuvmState = "docssettings";
    this.optSelect = 0
    this.rendervmState();
*/

	startBasicList() {

		this.directPageMode = true;
		this.start2();

		var list = { title: "Basic Listing", showNum: false, offset:0, items: [] };

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

				if( this.debugFlag ) {
					console.log(l[2]);
				}
		}

		if( list.items.length == 0 ) {
			list.items.push({name: "NO PROGRAM IN MEMORY", id: 0});
		}

		list.hideLogo = true;
		this.startList( list );

    //this.initLogo();
    this.rendervmState();
	}


	do_list() {

		var list = { title: "Basic Listing", showNum: false, offset:0, items: [] };

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

				if( this.debugFlag ) {
					console.log(l[2]);
				}
		}

		if( list.items.length == 0 ) {
			list.items.push({name: "NO PROGRAM IN MEMORY", id: 0});
		}

		list.hideLogo = true;
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

	do_changeListingMode() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "list mode:", items: [
			{ name: "enhanced",   id: "enhanced"},
			{ name: "normal", id: "normal"}
		] };

		list.callback = "select_ListingMode";

		this.startList( list );

	}


	do_changeClock() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Clock Sync", items: [
			{ name: "compatible",   id: "compat"},
			{ name: "synchronized with host", id: "clocksync"}
		] };

		list.callback = "select_Clock";

		this.startList( list );

	}

	do_changeRenum() {

		if( !this.context.confirmCookies() ) {
			return;
		}

		var list = { title: "Renumber Mode", items: [
			{ name: "plain", id: "plain"},
			{ name: "data", id: "data"},
			{ name: "rem", id: "rem"}
		] };

		list.callback = "select_RenumberMode";

		if( this.debugFlag ) {
			console.log("list options");
		}

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

		if( this.debugFlag ) {
			console.log("list options");
		}

		this.startList( list );

	}

	select_File( id ) {

		this.endMenu();

		if( this.debugFlag ) {
			console.log( id );
		}

		this.context.printLine("" );
		this.context.printLine("load" );
		this.context.printLine("searching for " + id );
		this.context.printLine("found "+id );
		this.context.printLine("loading");

		try {
			this.context.load( id );
			this.context.printLine( this.context.program.length + " lines")
			this.context.printLine("ready.");
		}
		catch ( e ) {
				this.handleImportError( e );
		}
	}


  do_listDirectory() {

		if( !this.context.confirmCookies() ) {
      return;
    }

		var list = { title: "Directory", showNum: true, items: [], offset:0 };
		var dir = this.context.getDir();
		var row;

		for( var i=0; i<dir.files.length; i++) {
			list.items.push( { name: dir.files[i].fname.trim(), id:  dir.files[i].fname } );

		}

		list.callback = "select_File";

		if( this.debugFlag ) {
			console.log("list dir");
		}

		list.hideLogo = true;
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
				if( this.debugFlag ) {
        	console.log(l[2]);
				}
      }
  }

	do_compress() {
    this.context.compressProgram( false );

    this.endMenuWithMessage("compress ok");
    this.context.printLine("list");

    var pgm = this.context.getProgramLines();
    for (const l of pgm )
      {
        this.context.listCodeLine( l[2] );
				if( this.debugFlag ) {
        	console.log(l[2]);
				}
      }
  }

	do_compress2() {
    this.context.compressProgram( true );

    this.endMenuWithMessage("compress ok");
    this.context.printLine("list");

    var pgm = this.context.getProgramLines();
    for (const l of pgm )
      {
        this.context.listCodeLine( l[2] );
				if( this.debugFlag ) {
        	console.log(l[2]);
				}
      }
  }

	do_PETSCIIreplace() {

		this.context.PETSCIIreplace( true );

		this.endMenuWithMessage("PETSCIIreplace");
		this.context.printLine("list");

		var pgm = this.context.getProgramLines();
		for (const l of pgm )
			{
				this.context.listCodeLine( l[2] );
				if( this.debugFlag ) {
					console.log(l[2]);
				}
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
        if( this.debugFlag ) {
					console.log(l[2]);
				}
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
		if( this.debugFlag ) {
			console.log( "clicked" );
		}

  }

  do_importVDiskCallBack( text, fName ) {
		if( this.debugFlag ) {
    	console.log("import vdisk " + text);
    	console.log("import vdisk " + fName);
		}

    var diskName = fName;

    if( diskName == null || diskName == "") {
      diskName = "noname";
    }

    if( diskName.endsWith(".vd64") ) {
      diskName = diskName.substring(0,diskName.length-5);
    }
    this.context.createDiskFromImage( diskName, JSON.parse( text ) );
  }

	do_exportBasNoPETSCII() {
		var data = this.context.getProgramAsTextNoPETSCII();

		var blob = new Blob( [data] , {
				type: 'text/plain'
		});

		//console.log(data);

		var objectUrl = URL.createObjectURL(blob);

		var link = document.getElementById( "imageSaver" );
		link.download = "myprogram.bas";
		link.href = objectUrl;
		link.click();

		this.endMenuWithMessage("downloading bas");

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

		if( this.debugFlag ) {
			console.log( "clicked" );
		}

  }

  do_importBas() {

		var uploadElement = document.getElementById( "imageLoader" );
    this.runImportedPGMFlag = false;

    this.uploader.setCallback( this, "do_importBasCallBack" );

		uploadElement.click();

		if( this.debugFlag ) {
			console.log( "clicked" );
		}

  }

	handleImportError( e ) {
		if( this.erh.isError( e ) )  {
					this.context.printLine("");
					this.context.printError( e.clazz, false, e.lineNr );
					this.context.printLine( ">" + e.detail );
					this.context.printLine( "ready." );
		}

	}

  do_importBasCallBack( text, fName ) {

    var lines = text.split(/\r?\n/);
		try {
    	var bas = this.context.textLinesToBas( lines );
		}
		catch (e) {

			this.endMenuWithMessage("parse error on import", detailError);
			var detailError = this.handleImportError( e );
			console.log( e );
			return;
		}

		try {
    	this.context.setProgram( bas );
		}
		catch (e) {
			this.endMenuWithMessage("setpgm error on import");
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
					if( this.debugFlag ) {
          	console.log(l[2]);
					}
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
		if( this.debugFlag ) {
			console.log( "clicked" );
		}

  }

  do_importSnapshotCallBack( text, fName ) {

		if( this.debugFlag ) {
    	console.log("Import Snapshot");
		}

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
