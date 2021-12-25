const NOSTATECHANGE = 99999;

var gameRenderFrameFunctionRec = {}

function gameRenderFrameFunction(  )
{
  var r = gameRenderFrameFunctionRec;

  r._this.renderFrame( r.ctx, r.exceptionHandler );
}


class GameState {


  constructor ( stateDefinitions, properties ) {
    this.playbooks = stateDefinitions.playbooks;
    this.defaultSuffix = stateDefinitions.defaultSuffix;
    this.properties = properties;
    this.exception = false;

    this.stateTypes = [];
    var type;

    for (const [typeId, existingFlagsArray] of Object.entries(stateDefinitions.stateTypes )) {
      type = {};

      type.LOD    = false;
      type.INI    = false;
      type.CLE    = false;
      type.BRA    = false;
      type.REN    = false;
      type.PRO    = false;
      type.INP    = false;

      for (const existingFlag of existingFlagsArray ){
          if( existingFlag == 'LOAD' )             { type.LOD    = true;  }
          else if( existingFlag == 'INIT' )       { type.INI    = true;  }
          else if( existingFlag == 'CLEANUP' )    { type.CLE    = true;  }
          else if( existingFlag == 'RENDER' )     { type.REN    = true;  }
          else if( existingFlag == 'PROCESS' )    { type.PRO    = true;  }
          else if( existingFlag == 'HANDLEINPUT' ){ type.INP    = true;  }
          else if( existingFlag == 'BRANCH' )     { type.BRA    = true;  }
      }

      var errorMessage = undefined;
      if( type.LOD && type.INI ) {
          var errorMessage = "state type " + typeId + " cannot have INIT flag when LOAD flag is set" ;
      } else if( type.LOD && type.CLE ) {
        var errorMessage = "state type " + typeId + " cannot have CLEANUP flag when LOAD flag is set" ;
      } else if( type.LOD && type.INP ) {
        var errorMessage = "state type " + typeId + " cannot have HANDLEINPUT flag when LOAD flag is set" ;
      } else if( type.LOD && type.BRA ) {
        var errorMessage = "state type " + typeId + " cannot have BRANCH flag when LOAD flag is set" ;
      }

      if( type.INP && !type.PRO ) {
          var errorMessage = "state type " + typeId + " cannot have HANDLEINPUT flag when PROCESS flag is not set" ;
      } else if( type.INP && !type.REN ) {
        var errorMessage = "state type " + typeId + " cannot have BRANCH flag when LOAD flag is set" ;
      }

      if( ( type.INI || type.CLE ) && type.LOD) {
          var errorMessage = "state type " + typeId + " cannot have LOAD flag when INIT/CLEANUP flags are set" ;
      } else if( ( type.INI || type.CLE ) && type.BRA) {
          var errorMessage = "state type " + typeId + " cannot have BRANCH flag when INIT/CLEANUP flags are set" ;
      }
      //else if( ( type.INI || type.CLE ) && !(type.PRO)) {
      //    var errorMessage = "state type " + typeId + " must have PROCESS flags when INIT/CLEANUP flags are set" ;
      //}

      if( ( type.LOD || type.INI || type.CLE || type.REN || type.PRO || type.INP)
            && type.BRA) {
          var errorMessage = "state type " + typeId + " cannot have any other flag when BRANCH flag is set" ;
      }


      if( errorMessage != undefined ) {
        console.log( errorMessage );
        throw errorMessage;
      }

      this.stateTypes[ typeId ] = type;
    }

    for (const [playbookId, playbook] of Object.entries(this.playbooks )) {
      for (const [stateId, state] of Object.entries( playbook.states )) {
        state.__typedef = this.stateTypes[ state._type ]; //double underscore after insert
      }
    }

    this.gotoPlayBook( stateDefinitions.startPlaybook, this.properties );
  }

  getBookClass() {
    var pb = this.playbooks[ this.playBookId ];
    if( pb == undefined ) { return undefined; }

    var myClass = pb.object;

    return myClass;
  }

  getCurrentPlayBookId() {
    return this.playBookId;
  }

  getCurrentPlayBook() {
      var currentPlayBook = this.playbooks[ this.playBookId ];

      return currentPlayBook;
  }

  gotoPlayBook( newPlayBookId, properties ) {

    console.log( "----------------" );
    console.log( "Goto PlayBook "+ newPlayBookId );

      if( this.playbooks[ newPlayBookId ] == undefined ) {
        return "error";
      }

      this.playBookId = newPlayBookId;

      if( this.getBookClass() != null ) {
        var myClass = this.getBookClass();

        myClass.initPlayBook( properties );
        this.bookClass = myClass;

        this.states = this.playbooks[ newPlayBookId ].states;

        this.gotoState( this.playbooks[ newPlayBookId ].enter );

      }

      return null;
  }

  char_count(str, letter)
  {
   var letter_Count = 0;
   for (var position = 0; position < str.length; position++)
   {
      if (str.charAt(position) == letter)
        {
        letter_Count += 1;
        }
    }
    return letter_Count;
  }


  gotoState( stateId ) {

    if( stateId == undefined || stateId == null ) {
      throw "gotoState:: stateid = undefined || null ";
    }

    if( stateId.playBook != undefined ) {
      this.gotoPlayBook( stateId.playBook, this.properties );
      return;
    }

    console.log( "----------------" );
    console.log( "Initialize State "+ stateId );
    this.stateId = stateId;
    this.state = this.states[ this.stateId ];

    var playbook = this.playbooks[ this.playBookId ];
    var definitions = playbook.definition;
    var state = this.state;

    if( state == undefined ) {
      throw "no state defined for id='" + stateId + "'";
    }

    console.log( "State dump:" );
    console.log( state );

    this.method = stateId;
    this.methodRender = null;
    this.methodProcess = null;
    this.methodEvents = null;
    this.stateClass = this.bookClass;

    if( this.char_count( stateId, '.' ) > 0 ) {
      if( this.char_count( stateId, '.' ) > 1 ) {
        throw "State name/id " + stateId+ " can only point out one subclass. (can only contain one dot)";
      }

      var parts = stateId.split('.');

      this.stateClass = this.bookClass[ parts[0] ];

      this.method = parts[ 1 ] ;

      console.log( this.stateClass );
    }

    var myClass = this.stateClass;


    if( this.state.__typedef.LOD == true ||
        this.state.__typedef.INI == true ||
        this.state.__typedef.CLE == true) {


        if (typeof this.stateClass[ this.method ] !== "function") {
          throw "Class " + this.stateClass.constructor.name +
                " does not contain elementary state function " + this.method + "(...)'" +
                ", but state " + stateId+ " contains LOAD, INIT or CLEANUP as state type.";
        }
    }

    if( this.state.__typedef.LOD == true ) {

      var method = this.method + "";
      var data = { currentState: this.stateId , resources: null };
      this.stateClass[ this.method ]( 'GETURLS', data );

      if( data.urls == null ) {
        var newState = this.state[ 'next' ];
        console.log( "seturls ended, no resources, nextstate => " + newState );
        this.gotoState( newState );
        return;
      }

      this.loadResources( data.urls );
      //return;
    }

    if( this.state.__typedef.INI == true ) {
      this.stateClass[ this.method ]( 'INIT' );

      if( this.state.__typedef.REN == false && this.state.__typedef.PRO == false )
      {
        var newState = this.state[ 'next' ];
        console.log( "init ended, nothing more to do, nextstate => " + newState );
        this.gotoState( newState );
        return;
      }

    }
    if( this.state.__typedef.REN == true &&  this.state.__typedef.LOD == true ) {
      this.methodRender       = this.method + definitions.stateMethodSuffix.LSRENDER;

      if (typeof this.stateClass[ this.methodRender ] !== "function") {
        throw "Class " + this.stateClass.constructor.name +
              " does not contain render state function " + this.methodRender + "(...)'" +
              ", but state " + stateId+ " contains LSRENDER as state type.";
      }
    }
    if( this.state.__typedef.REN == true &&  this.state.__typedef.LOD == false ) {
      this.methodRender       = this.method + definitions.stateMethodSuffix.RENDER;

      if (typeof this.stateClass[ this.methodRender ] !== "function") {
        throw "Class " + this.stateClass.constructor.name +
              " does not contain render state function " + this.methodRender + "(...)'" +
              ", but state " + stateId+ " contains RENDER as state type.";
      }

    }
    if( this.state.__typedef.PRO == true &&  this.state.__typedef.LOD == true ) {
      this.methodProcess       = this.method + definitions.stateMethodSuffix.LSPROCESS;

      if (typeof this.stateClass[ this.methodProcess ] !== "function") {
        throw "Class " + this.stateClass.constructor.name +
              " does not contain process state function " + this.methodProcess + "(...)'" +
              ", but state " + stateId+ " contains LSPROCESS as state type.";
      }
    }
    if( this.state.__typedef.PRO == true &&  this.state.__typedef.LOD == false ) {
      this.methodProcess       = this.method + definitions.stateMethodSuffix.PROCESS;

      if (typeof this.stateClass[ this.methodProcess ] !== "function") {
        throw "Class " + this.stateClass.constructor.name +
              " does not contain process state function " + this.methodProcess + "(...)'" +
              ", but state " + stateId+ " contains PROCESS as state type.";
      }

    }
    if( this.state.__typedef.INP == true ) {
      this.methodEvents       = this.method + definitions.stateMethodSuffix.HANDLEINPUT;

      if (typeof this.stateClass[ this.methodEvents ] !== "function") {
        throw "Class " + this.stateClass.constructor.name +
              " does not contain process state function " + this.methodEvents + "(...)'" +
              ", but state " + stateId+ " contains HANDLEINPUT as state type.";
      }

    }
    if( this.state.__typedef.BRA == true  ) {

      var stateChange = this.state._branchFunction( this.bookClass );

      if( stateChange == false ) {
        throw "State ("+this.stateId+") MUST return a next event";
      }

      if( this.state[ stateChange ] == undefined ) {
        throw "unknown exitEvent '"+ stateChange +"' in state ("+this.stateId+")";
      }


      if( this.state[ stateChange ] == undefined ) {
          throw "unknown exitEvent '"+ stateChange +"' in state ("+this.stateId+")";
      }
      this.gotoState( this.state[ stateChange ] );
    }
  }

  loadResources( resources ) {

    var myClass = this.stateClass;

    var myArray, myDestArray, myState;
    var imgState, audioState, dataState;
    imgState = { count:0 };
    audioState = { count:0 };
    dataState = { count:0 };

    imgState.load = false;
    audioState.load = false;
    dataState.load = false;

    if( resources == undefined ) {
      this.gotoState( this.state.next );
      return;
    }

    myArray = resources.imgSrcArray;
    myState = imgState;
    if( myArray  != undefined ) {
      myState.keys = Object.keys( myArray );
      myState.urls = myArray;
      myState.count = myState.keys.length;
      if( myState.count > 0 ) {
        myState.load = true;
      }
    }

    myArray = resources.audioSrcArray;
    myState = audioState;
    if( myArray  != undefined ) {
      myState.keys = Object.keys( myArray );
      myState.urls = myArray;
      myState.count = myState.keys.length;
      if( myState.count > 0 ) {
        myState.load = true;
      }
    }

    myArray = resources.dataSrcArray;
    myState = dataState;
    if( myArray  != undefined ) {
      myState.keys = Object.keys( myArray );
      myState.urls = myArray;
      myState.count = myState.keys.length;
      if( myState.count > 0 ) {
        myState.load = true;
      }
    }

    this.loadedCount = 0;
    this.loadingCount = imgState.count + audioState.count + dataState.count;

    if( this.loadingCount == 0 ) {
      this.gotoState( this.state.next );
      return;
    }

    var loadedResources = {};
    loadedResources.imgArray = [];
    loadedResources.audioArray = [];
    loadedResources.dataArray = [];

    myArray = resources.imgSrcArray;
    myDestArray = loadedResources.imgArray;
    myState = imgState;
    for( var i=0; i<myState.count; i++ )  {
      var key = myState.keys[i];
      var url = myArray[ key ];

      var obj = new Image();
      obj.id = myClass.constructor.name+ '.i.' + url;

      myDestArray[key ] = obj;
  	}

    myArray = resources.audioSrcArray;
    myDestArray = loadedResources.audioArray;
    myState = audioState;
    for( var i=0; i<myState.count; i++ )  {
      var key = myState.keys[i];
      var url = myArray[ key ];

      var obj = new Audio();
      obj.style="display:none";
      obj.id = myClass.constructor.name+'.a.' + url;

      myDestArray[ key ] = obj;
  	}


    myArray = resources.dataSrcArray;
    myDestArray = loadedResources.dataArray;
    myState = dataState;
    for( var i=0; i<myState.count; i++ )  {
      var key = myState.keys[i];
      var url = myArray[ key ];

      myDestArray[ key ] = new Object();
      myDestArray[ key ].data = null;
      myDestArray[ key ].url = url;
  	}

    var __this = this;
    var urls, count, res, keys;
    var srcArrays = [ resources.imgSrcArray, resources.audioSrcArray, resources.dataSrcArray ];
    var dstArrays = [ loadedResources.imgArray, loadedResources.audioArray, loadedResources.dataArray ];
    var states = [ imgState, audioState, dataState ];

    for( var h=0; h<srcArrays.length; h++ )  {

      myArray = srcArrays[ h ];
      myDestArray = dstArrays[ h ];
      myState = states[ h ];

      console.log("h=" + h);
      console.log(myState);

      for( var i=0; i<myState.count; i++ )  {
        var key = myState.keys[i];
        var url = myState.urls[ key ];
        var browserResource = false;
        console.log(key + ":" + url + " " + i);
        res = myDestArray[ key ];

        if( h==0 ) { /* images */
          res.onload = function ( evt ) {
            __this.onLoadedResource( evt, myClass, loadedResources );
          }

          browserResource = true;
        }
        else if( h==1 ) /*audio*/
        {
          res.onloadeddata = function ( evt ) {
            __this.onLoadedResource( evt,  myClass, loadedResources );
          }

          browserResource = true;
        }
        else /*data*/
        {

          browserResource = false;
          this.fetchData( url, res, myClass, loadedResources  );

        }

        if( browserResource ) {
          res.onerror = function ( evt ) {
            alert( "Could not find resource " + evt.target.src );
          }
          res.src = url;
        }

    	}
    }
  }

  fetchData( url, res, myClass, loadedResources  ) {

    var __this = this;

    if( url.endsWith( ".json" ) ) {
      fetch( url )
        .then(response => response.json())
        .then((data) => {
          var evt = { currentTarget: { id: 'jsondata.'+url } };
          console.log(data)
          res.data = data;

          __this.onLoadedResource( evt,  myClass, loadedResources );
        })
    }
    else {
      fetch( url )
        .then(response => response.text())
        .then((data) => {
          var evt = { currentTarget: { id: 'txtdata.'+url } };
          console.log(data)
          res.data = data;

          __this.onLoadedResource( evt,  myClass, loadedResources );
        })
    }
  }

  onLoadedResource( evt, myClass, loadedResources ) {

    console.log("resource is loaded " + evt.currentTarget.id );
    this.loadedCount ++;
    console.log("resources loaded " + this.loadedCount );
    console.log("resources to be loaded " + this.loadingCount );
    if( this.loadedCount == this.loadingCount ) {
      console.log("all loaded, signalling");

      var data  = { currentState: this.stateId , resources: loadedResources  };
      this.stateClass[ this.method ]( 'LOADED', data );

      console.log("goto next state " + this.state.next);
      this.gotoState(this.state.next );
    }
  }


  gotoNextState() {

      this.gotoState( this.state.next );
      return null;
  }

  handleEvent( evt ) {

      var myClass = this.stateClass;
      try {
        if( this.methodEvents != undefined ) {
          myClass[ this.methodEvents ]( evt );
        }
      }
      catch ( except ) {
        var err = {};
        err.message="Exception[" +
        myClass.constructor.name +  "." + this.methodEvents + "(...) at chapter '" + this.getCurrentPlayBookId()+ "']:" + except.message;
        err.exception = except;
        err.myClass = myClass;

        console.log( except );
        throw err;
      }

  }

  renderFrame( ctx, exceptionHandler ) {

    var myClass = this.stateClass;

    if( myClass == undefined ) {
      throw "game1.state[" + this.getCurrentPlayBookId() + "]."+this.methodRender+":Cannot execute, 'myClassUndefined' for chapter '" + this.getCurrentPlayBookId() +"'";
    }

    try {
      if( this.methodRender != undefined ) {
        myClass[this.methodRender]( ctx );
      }
    }
    catch ( except ) {
      var err = {};
      err.message="Exception[" +
          myClass.constructor.name +  "." + this.methodRender + "(...) at chapter '" + this.getCurrentPlayBookId()+ "']:" + except.message;
      err.exception = except;
      err.myClass = myClass;

      exceptionHandler.doException( err );
    }

    if( this.exception == false ) {

      gameRenderFrameFunctionRec = {
        _this: this,
        ctx: ctx,
        exceptionHandler: exceptionHandler
      };


      requestAnimationFrame( gameRenderFrameFunction );
    }

  }

  processIteration () {

    var myClass = this.stateClass;

    if( myClass == undefined ) {
      throw "game1.state[" + this.getCurrentPlayBookId() + "].processIteration:Cannot execute, 'myClassUndefined' for chapter '" + this.getCurrentPlayBookId() +"'";
    }

    var stateChange = false;
    //try {
      if( this.methodProcess != null ) {
        stateChange = myClass[this.methodProcess]();
      }
    //}
    /*catch ( except ) {
      var err = {};
      err.message="Exception[" +
          myClass.constructor.name +  ".cycle(...) at chapter '" + this.getCurrentPlayBookId()+ "']:" + except.message;
      err.exception = except;
      err.myClass = myClass;
      throw err;
    }*/

    if( stateChange != false ) {
        if( this.state._type == "WATCH" && stateChange != 'next' ) {
          throw "Only next or false allowed in run phase of WATCH state ("+this.stateId+")";
        }

        if( this.state[ stateChange ] == undefined ) {
          throw "unknown exitEvent '"+ stateChange +"' in state ("+this.stateId+")";
        }
        this.gotoState( this.state[ stateChange ] );
    }
  }
}

class DefaultStateDefinitions {

  constructor ( classObject ) {

    this.startPlaybook = "basic";

    /* -----------------------------------------------------
      Playbooks
       ----------------------------------------------------- */

    this.playbooks = {
        basic: { object: classObject, enter: 'load', definition: this },
    };

    /* -----------------------------------------------------
      Global state setup
       ----------------------------------------------------- */

    this.stateTypes = {
      LOADSILENT:   ['LOAD'],
      PLAY:         ['INIT','CLEANUP','RENDER','PROCESS','HANDLEINPUT'],
      WATCH:        ['INIT','CLEANUP','RENDER','PROCESS'],
      INIT:         ['INIT'],
      BRANCH:       ['BRANCH']
    };

    this.stateMethodSuffix = {
      LSRENDER:     undefined,
      LSPROCESS:    undefined,
      RENDER:       'Render',
      PROCESS:      'Run',
      HANDLEINPUT:  'Handle'
    };


	  /* basic playbook */
    var playbook = this.playbooks.basic;
    playbook.states = {

		/* Only load, play and repeat since this is a demo, not a game */

        'load':    { _type: "LOADSILENT",  next: 'play'},
        'play':    { _type: "PLAY", next: 'play' },

      } ;
  }
}


class Boot {
	constructor ( _renderCanvasId, _SCRW, _SCRH, stateDefinitions ) {

    		/* Prevent reload, without confirmation */
    		window.onbeforeunload = function() {
      		return "";
    		}

    		document.addEventListener('contextmenu', event => event.preventDefault());

    		this.renderCanvasId = _renderCanvasId;
    		this.renderCanvas = document.getElementById( _renderCanvasId );

    		this.renderCanvas.style.touchAction = "none";

    		this.renderCanvas.id     = "ApplicationCanvas";
    		this.SCRW = _SCRW;
    		this.SCRH = _SCRH;

        this.properties = {};
        this.properties.w = _SCRW;
        this.properties.h = _SCRH;

    		this.sizeCanvas( this.SCRW, this.SCRH );
    		this.renderContext = this.renderCanvas.getContext('2d',
          {
          alpha: false,
          desynchronized: true
          });

        this.renderContext.fillStyle = 'rgba(100,100,150,1)';
        this.renderContext.fillRect(
          0,
          0,
          _SCRW,
          _SCRH
        );

        if( Array.isArray( stateDefinitions ) ) {
            var errorString = "new Boot( ..., ..., ..., stateDefinitions ), stateDefinitions must be either and object or an array of [ runClassObject, 'basic' ]";
            if( stateDefinitions.length != 2 ) {
              throw errorString;
            }
            else {
              if( stateDefinitions[ 1 ] != 'basic' ) {
                throw errorString;
              }
            }

            var stateDef = new DefaultStateDefinitions( stateDefinitions[ 0 ] );
            this.state = new GameState ( stateDef, this.properties );
        }
        else {
            this.state = new GameState ( stateDefinitions, this.properties );
        }

        var __this = this;

        try {
          this.state.renderFrame( this.renderContext, this );
        }
        catch( except ) {
          console.log( "RENDER ERROR");
        }

        this.loopTimer = setInterval(
          function() {
            //try {
              __this.state.processIteration();
            /*}
            //catch(except) {
              clearInterval( __this.loopTimer );

              __this.state.exception = true;
              __this.logException( except );
              }
              */
          }
          , 20
        );


        this.renderCanvas.addEventListener("keyup", this.state, true);
        this.renderCanvas.addEventListener("keydown", this.state, true);

  }


/*
  doException( obj ) {

    clearInterval( this.loopTimer );
    //clearInterval( this.renderTimer );
    this.logException( obj );

  }
*/


  doException( obj ) {
    this.state.exception = true;
    this.logException( obj );
  }

  logException( obj ) {

    var cause = obj;

    if( obj.message != undefined ) {
      cause = obj.message;
    }
    var parts = cause.split(":");

    var consoletext = 'Zen! Exception ('+parts[0]+') => ' + parts[1];
    var text1 = 'Exception: ' + parts[1];
    var text2 = 'From ('+parts[0]+')';

    console.error( consoletext );
    console.error( obj.exception );
    if( obj.exception.stack != undefined ) {
      console.log( obj.exception.stack );
      console.log( obj.myClass);
    }

    var  flip = 0;
    var __this = this;
    var bwidth = 8;
    var yoffset = 16;

    var errorTimer = setInterval(
      function() {
      var line;
      flip ++;

      if( flip <= 4  ) {
        __this.renderContext.fillStyle = 'rgba(255,100,0,1)';
      }
      else {
        __this.renderContext.fillStyle = 'rgba(0 ,0,0,1)';
      }
      if( flip == 8 ) { flip =0; }

      __this.renderContext.fillRect(
        0,
        0,
        __this.SCRW,
        105
      );

      __this.renderContext.fillStyle = 'rgba(0,0,0,1)';
      __this.renderContext.fillRect(
        bwidth,
        bwidth,
        __this.SCRW - (bwidth*2),
        105-(bwidth*2)
      );

      __this.renderContext.font = '15px arial';
      __this.renderContext.textBaseline  = 'top';
      __this.renderContext.fillStyle = "rgba(255,100,000,1)";

      line = 0;
      __this.renderContext.fillText( "Game1 Zen Exception",
          bwidth + 5,bwidth + 5 + (yoffset * line)
        );

      line++;
      __this.renderContext.fillText( text1,
          bwidth + 5,bwidth + 5 + (yoffset * line)
        );

      line++;
      __this.renderContext.fillText( text2,
            bwidth + 5,bwidth + 5 + (yoffset * line)
          );

      line++;
      __this.renderContext.fillText( "Check console for more information.",
                bwidth + 5,bwidth + 5 + (yoffset * line)
              );


      __this.renderContext.fillStyle = "rgba(100,255,100,1)";
      line++;
      __this.renderContext.fillText( "Fix the bug, and return to the light :)",
              bwidth + 5,bwidth + 5 + (yoffset * line)
              );


        },
        300
      );
  }

  sizeCanvas( w, h )
  {

    this.renderCanvas.width  = w;
    this.renderCanvas.height = h;

  }
}
