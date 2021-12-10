
class Program {

  constructor( console ) {
    this.console = console;
  }

  initPlayBook( properties ) {

    this.basiccontext = new BasicContext( this.console );

    this.width = properties.w;
    this.height = properties.h;

    this.stringMode = false;

    this.console.reset();

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

  /*
		Loading
  */
  load(action, data) {

    if (action == 'GETURLS') {
      return;
    } else if (action == 'LOADED') {
      var loadedResources = data.resources;
    }
  }


  /*
	Playing the demo
  */
  play(action, data) {

    if (action == "INIT") {
        this.cursorCount = 1;
        var c = this.console;
        var basiccontext = this.basiccontext;

        basiccontext.reset( true );

        this.x=0; this.y=21;

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
    var menuScreen = bcontext.isMenu();
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

    if( ! running && !menuScreen ) {
      this.handleScrEditKeys( evt, bcontext );
      return;
    }
    else if( menuScreen ) {
      bcontext.handleMenuKey( evt );

      return;
    }

    if( evt.key.length == 1) {
        bcontext.pushKeyBuffer( evt.key.charCodeAt(0) );
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


  handleScrEditKeys( evt, bcontext ) {

    if( evt.type == 'keydown' ) {

      //console.log(evt);
      var c = this.console;
      var stringMode;
      stringMode = this.stringMode;

      if( evt.key == "Enter") {

          c.clearCursor();
          var line=c.getCurrentLine();

          this.stringMode = false;
          stringMode = false;

          c.writeString("", true);
          bcontext.handleLineInput( line );

      }
      else if( evt.key == "Pause" && evt.ctrlKey) {
        this.basiccontext.reset( false );
      }
      else if( evt.key == "Backspace"  && !evt.ctrlKey) {
          c.clearCursor();
          c.deleteChar();
      }
      else if( evt.key == "Backspace" && evt.ctrlKey) {
          this.basiccontext.reset( false );
      }
      else if( evt.key == "ArrowLeft") {

          c.clearCursor();
          c.cursorLeft();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowRight") {
          c.clearCursor();
          c.cursorRight();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowUp") {
          c.clearCursor();
          c.cursorUp();
          evt.preventDefault();
      }
      else if( evt.key == "ArrowDown") {
          c.clearCursor();
          c.cursorDown();
          evt.preventDefault();
      }
      else if( evt.key == "F1") {
        c.writeString('LIST');
      }
      else if( evt.key == "F2") {
        c.writeString('RUN');
      }
      else if( evt.key == "F5") {
        c.writeString('LOAD "$":LIST');
        evt.preventDefault();
      }
      else if( evt.key == "F6") {
        c.writeString('LOAD "*"');
        evt.preventDefault();
      }
      else if( evt.key == "I") {
        c.clearCursor();
        c.writeChar( evt.key );
      }
      else if( evt.key == "\"") {
        c.clearCursor();
        c.writeChar( evt.key );
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

            c.writePetsciiChar( mapEntry );
            evt.preventDefault();
            return;
          }
        }
        else {
          var mapEntry = this.keyToCTRLCode[checkKey];
          if( ! (mapEntry===undefined)) {

            console.log("check_key: " + checkKey + " - out string " + mapEntry.charCodeAt(0));
            c.clearCursor();
            this.basiccontext.sendChars( mapEntry, false );
            evt.preventDefault();
            return;
          }
        }


        if( evt.key.length == 1) {
            c.clearCursor();
            //console.log("key=",evt);
            this.basiccontext.sendChars( evt.key.toUpperCase(), false );
            evt.preventDefault();
        }

      }


    }
  }


  playRun() {

    var basiccontext = this.basiccontext;

    basiccontext.cycle();

    return false;
  }


  playRender(context) {

    this.console.renderDisplay();

  }


}
