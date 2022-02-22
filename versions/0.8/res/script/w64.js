
class Program {

  constructor( console ) {
    this.console = console;
    this.basiccontext = new BasicContext( this.console );
    this.basiccontext.setEditModeCallBacks("edit");

    this.stringMode = false;

    this.keyToCode = [];
    var k2c = this.keyToCode;

    //Columns 1 in https://www.c64-wiki.com/wiki/PETSCII_Codes_in_Listings

    k2c["ALT_:1"] = '\xc1';
    k2c["ALT_:2"] = '\xd5';
    k2c["ALT_:3"] = '\xd6';
    k2c["ALT_:4"] = '\xd7';
    k2c["ALT_:5"] = '\xd8';
    k2c["ALT_:6"] = '\xd9';
    k2c["ALT_:7"] = '\xda';
    k2c["ALT_:8"] = '\xdb';

    k2c["CTRL_:1"] = '\xd0';
    k2c["CTRL_:2"] = '\x85';
    k2c["CTRL_:3"] = '\x9c';
    k2c["CTRL_:4"] = '\xdf';
    k2c["CTRL_:5"] = '\xdc';
    k2c["CTRL_:6"] = '\x9e';
    k2c["CTRL_:7"] = '\x9f';
    k2c["CTRL_:8"] = '\xde';
    k2c["CTRL_:9"] = '\x92';
    k2c["CTRL_:0"] = '\xd2';
    k2c[":Home"]  = '\x93';
    k2c["SHFT_:Home"]  = '\xd3';

    //Columns 3 in https://www.c64-wiki.com/wiki/PETSCII_Codes_in_Listings
    this.keyToCTRLCode = [];
    var k2c = this.keyToCTRLCode;
    k2c["ALT_:1"] = '\x81';
    k2c["ALT_:2"] = '\x95';
    k2c["ALT_:3"] = '\x96';
    k2c["ALT_:4"] = '\x97';
    k2c["ALT_:5"] = '\x98';
    k2c["ALT_:6"] = '\x99';
    k2c["ALT_:7"] = '\x9a';
    k2c["ALT_:8"] = '\x9b';


    k2c["CTRL_:1"] = '\x90'; //1
    k2c["CTRL_:2"] = '\x05'; //2
    k2c["CTRL_:3"] = '\x1c'; //3
    k2c["CTRL_:4"] = '\x9f'; //4
    k2c["CTRL_:5"] = '\x9c'; //5
    k2c["CTRL_:6"] = '\x1e'; //6
    k2c["CTRL_:7"] = '\x1f'; //7
    k2c["CTRL_:8"] = '\x9e'; //8
    k2c["CTRL_:9"] = '\x12'; //9
    k2c["CTRL_:0"] = '\x92'; //9
    k2c[":Home"]  = '\x13';
    k2c["SHFT_:Home"]  = '\x93';
  }

  rescale( xs,ys ) {
    this.console.rescale( xs,ys);
  }

  initPlayBook( properties ) {
    this.width = properties.w;
    this.height = properties.h;

    this.console.reset();

  }

  /*
		Loading
  */

  load(action, data) {

    if (action == 'GETURLS') {

        this.cursorCount = 1;
        var c = this.console;
        var basiccontext = this.basiccontext;

        basiccontext.reset( true );

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        var url = urlParams.get('linkpgm');
        var extended = urlParams.get('x');

        if( url != null ) {
          var dataURLs = [];
          this.bgcolor = 0;
          dataURLs[ 'externalPGM' ] = url;
          data.urls = {
              imgSrcArray: [],
              audioSrcArray: [],
              dataSrcArray: dataURLs
            };

          if( extended != null ) {
            this.basiccontext.enableExtended(true);
          }
          this.basiccontext.clearScreen();
          this.basiccontext.printLine("load \"*\",98");
          this.basiccontext.printLine("");
          this.basiccontext.printLine("searching for *");
        }
        else {
          var dataURLs = [];
          this.bgcolor = 0;
          dataURLs[ 'examples' ] = "doc/examples.json";
          data.urls = {
              imgSrcArray: [],
              audioSrcArray: [],
              dataSrcArray: dataURLs
            };
        }
        return;


    } else if (action == 'LOADED') {
      var pgm = data.resources.dataArray["externalPGM"];
      if( pgm ) { pgm = pgm.data; }

      var examples = data.resources.dataArray["examples"];
      if( examples ) { examples = examples.data; }

      if( pgm != null ) {
        console.log("External URL Program detected, size " + pgm.length );
        console.log(pgm);

        this.basiccontext.printLine("loading");

        try {

          console.log(pgm);
          var regExp=/\r\n|\n\r|\n|\r/g;
          var lines = pgm.replace(regExp,"\n").split("\n");
          var bas = this.basiccontext.textLinesToBas( lines );

          this.basiccontext.printReady();
          this.basiccontext.printLine("run");

          this.basiccontext.setProgram( bas );

          this.basiccontext.clearScreen();

          this.basiccontext.runPGM();
          return;
        }
        catch ( e ) {
          this.basiccontext.runStop();
          this.basiccontext.printError("load");
          this.basiccontext.printReady();
        }
      }
      else if( examples != null ) {
        console.log("Loaded examples " , examples );
      }
    }
  }

  loadLSRender() {
    this.console.renderDisplay();

  }



  /*
		Loading Example
  */

  loadexample(action, data) {

    if (action == 'GETURLS') {

        this.cursorCount = 1;
        var c = this.console;
        var basiccontext = this.basiccontext;

        var exampleURL = this.exampleURL;
        var exampleIsExtended = this.exampleIsExtended;

        basiccontext.reset( true );

        var dataURLs = [];
        this.bgcolor = 0;
        dataURLs[ 'example' ] = exampleURL;
        data.urls = {
            imgSrcArray: [],
            audioSrcArray: [],
            dataSrcArray: dataURLs
          };

        return;


    } else if (action == 'LOADED') {
      var pgm = data.resources.dataArray["example"];
      if( pgm ) { pgm = pgm.data; }

      if( pgm != null ) {
        console.log("Exammple URL Program detected, size " + pgm.length );
        console.log(pgm);

        this.basiccontext.printLine("loading example");

        try {

          console.log(pgm);
          var regExp=/\r\n|\n\r|\n|\r/g;
          var lines = pgm.replace(regExp,"\n").split("\n");
          var bas = this.basiccontext.textLinesToBas( lines );

          this.basiccontext.printReady();
          this.basiccontext.printLine("run");
          this.basiccontext.setProgram( bas );
          this.basiccontext.clearScreen();
          this.basiccontext.runPGM();
          return;
        }
        catch ( e ) {
          this.basiccontext.runStop();
          this.basiccontext.printError("load");
          this.basiccontext.printReady();
        }
      }
    }
  }

  loadexampleLSRender() {
    this.console.renderDisplay();

  }


  /*
	Playing the emulator
  */
  play(action, data) {

    if (action == "INIT") {

        //get basic code from url here:
        this.basiccontext.setScale(null);

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        var pgm = urlParams.get('pgm');
        var extended = urlParams.get('x');

        if( pgm != null ) {
          console.log("URL-Embedded Program Detected");
          console.log(pgm);

          if( extended != null ) {
            this.basiccontext.enableExtended(true);
          }

          this.basiccontext.clearScreen();
          this.basiccontext.printLine("load \"*\",99");
          this.basiccontext.printLine("");
          this.basiccontext.printLine("searching for *");
          this.basiccontext.printLine("loading");

          try {
            pgm = atob( pgm );

            this.basiccontext.printReady();
            this.basiccontext.printLine("run");

            console.log(pgm);
            var regExp=/\r\n|\n\r|\n|\r/g;
            var lines = pgm.replace(regExp,"\n").split("\n");
            var bas = this.basiccontext.textLinesToBas( lines );
            this.basiccontext.setProgram( bas );

            this.basiccontext.clearScreen();

            this.basiccontext.runPGM();
            return;
          }
          catch ( e ) {
            this.basiccontext.runStop();
            this.basiccontext.printError("load");
            this.basiccontext.printReady();
          }
        }
    }
  }

  resetKeyModifiers() {
    this.k_altGraph = false;
    this.k_shift = false;
    this.k_control = false;
    this.k_alt = false;
  }


  reset() {
    this.basiccontext.reset( false );
    this.basiccontext.runStop()
    this.stringMode = false;
    this.reverseOn  = false;
    this.resetKeyModifiers();
  }

  playHandle( evt ) {

    var bcontext = this.basiccontext;
    var running = bcontext.isRunning();
    var listing = bcontext.isListing();
    var menuScreen = bcontext.isMenu();
    var input = bcontext.isInput();
    var modifierKey = false;

    //console.log( evt );

    if( evt.key == "AltGraph") {
      this.k_altGraph = (evt.type  == 'keydown');
      modifierKey = true;
    }
    else if( evt.key == "Control") {
      this.k_control = (evt.type  == 'keydown');
      modifierKey = true;
    }
    else if( evt.key == "Shift") {
      this.k_shift = (evt.type  == 'keydown');
      modifierKey = true;
    }
    else if( evt.key == "Alt") {
      this.k_alt = (evt.type  == 'keydown');
      modifierKey = true;
    }

    if( modifierKey ) {
      return; //for now, untill we want to check for only modifier keys
    }

    if( evt.type != 'keydown' ) {
      return;
    }

    evt.k_altGraph = this.k_altGraph;
    evt.k_control = this.k_control;
    evt.k_shift = this.k_shift;
    evt.k_alt = this.k_alt;


    if( evt.key == "F9" || evt.key=="Tab") {
      bcontext.toggleMenu();
      console.log("Menu");
      evt.preventDefault();
    }

    if( !running && !menuScreen && !listing) {
      this.handleScrEditKeys( evt, bcontext, false );
      return;
    }
    else if( ! running && !menuScreen  && listing ) {
      this.handleScrListKeys( evt, bcontext, false );
      return;
    }
    else if( running && !menuScreen && input && !listing) {
      this.handleScrEditKeys( evt, bcontext, true );
      return;
    }
    else if( menuScreen ) {
      bcontext.handleMenuKey( evt );
      return;
    }

    if( evt.key.length == 1) {
        var code = evt.key.charCodeAt(0);
        if( (code >96 && code <123)) {
          code -=32;
        }
        bcontext.pushKeyBuffer( code );
    }
    else if( evt.key == "Home") {
        if( evt.k_shift ) {
            bcontext.pushKeyBuffer( String.fromCharCode(147) );
        }
        else {
            bcontext.pushKeyBuffer( String.fromCharCode(19) );
        }
    }
    else if( evt.key == "Pause" && evt.ctrlKey) {
      this.reset();
    }
    else if( evt.key == "Escape") {
        this.basiccontext.runStop();
    }


    //this.resetKeyModifiers();
    return;
  }


  handleScrListKeys( evt, bcontext, isInputCommand ) {

    if( evt.type == 'keydown' ) {

        if( evt.key == "Escape") {
            this.basiccontext.listStop();
        }
      }

  }


  handleScrEditKeys( evt, bcontext, isInputCommand ) {

    if( evt.type == 'keydown' ) {

      var c = this.console;
      var ctx = bcontext;
      var stringMode;
      stringMode = this.stringMode;

      if( evt.key == "Enter") {

          c.clearCursor();
          var line=ctx.getCurrentLine();

          this.stringMode = false;
          stringMode = false;

          ctx.passEnter();

          bcontext.handleLineInput( line, isInputCommand );

      }
      else if( evt.key == "Pause" && evt.ctrlKey) {
        this.basiccontext.reset( false );
      }
      else if( evt.key == "Backspace"  && !evt.ctrlKey) {
          c.clearCursor();
          ctx.passDeleteChar();
      }
      else if( evt.key == "Backspace" && evt.ctrlKey) {
          ctx.reset( false );
      }
      else if( evt.key == "p" && evt.ctrlKey ) {

        ctx.passChars( '\x7e', false  ); //https://sta.c64.org/cbm64pet.html

        evt.preventDefault();
      }
      else if( evt.key == "d" && evt.ctrlKey ) {

        ctx.showDebug(); //https://sta.c64.org/cbm64pet.html

        evt.preventDefault();
      }
      else if( evt.key == "x" && evt.ctrlKey ) {

        ctx.passChars( '\x5e', false   ); //https://sta.c64.org/cbm64pet.html

        evt.preventDefault();
      }
      else if( evt.key == "^"  ) {
        ctx.passChars( '\x5e', false   ); //https://sta.c64.org/cbm64pet.html

        evt.preventDefault();
      }
      else if( evt.key == "ArrowLeft") {

          c.clearCursor();
          c.cursorLeft();
          ctx.updateYPos();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowRight") {
          c.clearCursor();
          c.cursorRight();
          ctx.updateYPos();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowUp"  && !evt.ctrlKey) {
          c.clearCursor();
          c.cursorUp();
          ctx.updateYPos();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowDown") {
          c.clearCursor();
          c.cursorDown();
          ctx.updateYPos();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowUp"  && evt.ctrlKey) {
        ctx.passChars( '\x5e', false   ); //https://sta.c64.org/cbm64pet.html
        evt.preventDefault();
      }
      else if( evt.key == "F1") {
        ctx.passString('LIST');
      }
      else if( evt.key == "F2") {
        ctx.passString('RUN');
      }
      else if( evt.key == "F5") {
        ctx.passString('LOAD "$":LIST');
        evt.preventDefault();
      }
      else if( evt.key == "F6") {
        ctx.passString('LOAD "*"');
        evt.preventDefault();
      }
      else if( evt.key == "I" ) { //why do we need this?
        c.clearCursor();
        ctx.passChars( evt.key, false  );
      }
      else if( evt.key == "\"") {
        c.clearCursor();
        ctx.passChars( evt.key, false  );
        evt.preventDefault();
        this.stringMode = !this.stringMode;
      }
      else {

        /*
        var k2c = this.keyToCode;
        k2c["ALT_CODE49"] = '\xd0'; //1
        */

        var checkKey = "";
        if( evt.k_shift ) {
            checkKey += "SHFT_";
        }
        if( evt.k_control ) {
            checkKey += "CTRL_";
        }
        if( evt.k_alt ) {
            checkKey += "ALT_";
        }
        if( evt.k_altGraph ) {
            checkKey += "ALTGR_";
        }

        checkKey += ":" + evt.key;
        //console.log("check_key: " + checkKey );

        if( this.stringMode ) {
          var mapEntry = this.keyToCode[checkKey];
          if( ! (mapEntry===undefined)) {
            console.log("check_key: " + checkKey + "\/" );

            ctx.passPetsciiChar( mapEntry );
            evt.preventDefault();
            return;
          }
        }
        else {
          var mapEntry = this.keyToCTRLCode[checkKey];
          if( ! (mapEntry===undefined)) {

            console.log("check_key: " + checkKey + " - out string " + mapEntry.charCodeAt(0));
            c.clearCursor();
            ctx.passChars( mapEntry, false );
            evt.preventDefault();
            return;
          }
        }

        if( evt.key.length == 1) {
            c.clearCursor();
            ctx.passChars( evt.key.toUpperCase(), false );
            evt.preventDefault();
        }

      }
    }
  }

  playRun() {

    var basiccontext = this.basiccontext;

    basiccontext.cycle();

    if( this.basiccontext.getPlayExampleFlag() ) {
      return "loadExample";
    }
    return false;
  }


  playRender(context) {

    if( this.renderError ) { return; }
    var c = this.console;
    var cx = this.basiccontext;
    try {

      if( ( c.getBorderChangedState() || cx.getBorderChangedFlag() ) &&
            cx.getImmersiveFlag()) {
        var col = c.getBorderColor();
        col = c.getColorHTML( col );

        var div0 = document.getElementById("outerdiv");
        div0.style.backgroundColor = col;

        console.log("Border update:  " + col);
      }
      this.console.renderDisplay();
    }
    catch ( e ) {
      this.renderError = true;
      console.log( e );
      throw e;
    }
  }


}
