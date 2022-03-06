
function VirtualKB_event( x ) {

  console.log("VirtualKB_event",x);

}

class  VirtualKB {

  constructor( kbTable, eventHandlerClass  ) {

    var U = undefined;

    this.eventHandlerClass = eventHandlerClass;
    this.kbArray = [];
    this.htmlTable = kbTable;
    this.shift = false;

    var T = this;
    var kbArray = this.kbArray;


    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "STOP", true, "stop" ) );
    kbRow.push( T.singleKey( "MENU", true, "menu" ) );
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey2( "F1", U, "", U, "", U, "F2", U ) );
    kbRow.push( T.singleKey2( "F3", U, "", U, "", U, "F4", U ) );
    kbRow.push( T.singleKey2( "F5", U, "", U, "", U, "F6", U ) );
    kbRow.push( T.singleKey2( "F7", U, "", U, "", U, "F8", U ) );

    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "&uarr;", false, "cursup" ) );
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.longKey( "RESTORE", 2.0, "restore" ) );

    kbArray.push( kbRow );


    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "&larr;", false, "leftarrow" ) );
    kbRow.push( T.singleKey( "+" ) );
    kbRow.push( T.singleKey( "-" ) );
    kbRow.push( T.singleKey( "*" ) );
    kbRow.push( T.singleKey2( "/", U, U, U, U, U, "?", U ) );
    kbRow.push( T.singleKey( "&#163;", false, "pound" ) );
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "&larr;", false, "cursleft" ) );
    kbRow.push( T.singleKey( "&darr;", false, "cursdown" ) );
    kbRow.push( T.singleKey( "&rarr;", false, "cursright" ) );
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey2( "HOME", "home", U, U, U, U, "CLR", "clear", true ) );
    kbArray.push( kbRow );


    var kbRow = [];
    kbRow.push( T.padDummyKey() );

    kbRow.push( T.singleKey2( "1", U, "1", U, "1", U, "!", U ) );
    kbRow.push( T.singleKey2( "2", U, "2", U, "2", U, "\"", U ) );
    kbRow.push( T.singleKey2( "3", U, "1", U, "1", U, "#", U ) );
    kbRow.push( T.singleKey2( "4", U, "2", U, "2", U, "$", U ) );
    kbRow.push( T.singleKey2( "5", U, "1", U, "1", U, "%", U ) );
    kbRow.push( T.singleKey2( "6", U, "2", U, "2", U, "&", U ) );
    kbRow.push( T.singleKey2( "7", U, "1", U, "1", U, "'", U ) );
    kbRow.push( T.singleKey2( "8", U, "2", U, "2", U, "(", U ) );
    kbRow.push( T.singleKey2( "9", U, "1", U, "1", U, ")", U ) );
    kbRow.push( T.singleKey2( "0", U, "2", U, "2", U, "", U ) );

    kbRow.push( T.doubleKey2( "DEL", "delete", U, U, U, U, "INSERT", U ) );
    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );

    kbRow.push( T.singleKey( "&uarr;", false, "uparrow" ) );
    kbRow.push( T.singleKey( "q" ) );
    kbRow.push( T.singleKey( "w" ) );
    kbRow.push( T.singleKey( "e" ) );
    kbRow.push( T.singleKey( "r" ) );
    kbRow.push( T.singleKey( "t" ) );
    kbRow.push( T.singleKey( "y" ) );
    kbRow.push( T.singleKey( "u" ) );
    kbRow.push( T.singleKey( "i" ) );
    kbRow.push( T.singleKey( "o" ) );
    kbRow.push( T.singleKey( "p" ) );
    kbRow.push( T.singleKey( "@" ) );

    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );

    kbRow.push( T.singleKey( "=" ) );
    kbRow.push( T.singleKey( "a" ) );
    kbRow.push( T.singleKey( "s" ) );
    kbRow.push( T.singleKey( "d" ) );
    kbRow.push( T.singleKey( "f" ) );
    kbRow.push( T.singleKey( "g" ) );
    kbRow.push( T.singleKey( "h" ) );
    kbRow.push( T.singleKey( "j" ) );
    kbRow.push( T.singleKey( "k" ) );
    kbRow.push( T.singleKey( "l" ) );
    kbRow.push( T.singleKey2( ":", U, "1", U, "1", U, "[", U )  );
    kbRow.push( T.singleKey2( ";", U, "1", U, "1", U, "]", U )  );


    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "LOCK", true  ) );

    kbRow.push( T.singleKey( "z" ) );
    kbRow.push( T.singleKey( "x" ) );
    kbRow.push( T.singleKey( "c" ) );
    kbRow.push( T.singleKey( "v" ) );
    kbRow.push( T.singleKey( "b" ) );
    kbRow.push( T.singleKey( "n" ) );
    kbRow.push( T.singleKey( "m" ) );
    kbRow.push( T.singleKey2( ".", U, "1", U, "1", U, "<", U )  );
    kbRow.push( T.singleKey2( ",", U, "1", U, "1", U, ">", U )  );

    kbRow.push( T.longKey( "RETURN", 2.0, "return" ) );
    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.longKey( "SHFT",1.5, "shift" ) );
    kbRow.push( T.singleKey( "c=" ) );

    kbRow.push( T.longKey( "SPACE", 8, " " ) );
    kbRow.push( T.longKey( "CTRL", 1.5 ) );
    kbRow.push( T.padDummyKey() );



    kbArray.push( kbRow );



    const body = document.body,
     tbl = kbTable;
     tbl.classList.add("kbbg");

     for (let i = 0; i < kbArray.length; i++) {
       var r = kbArray[ i ];
       const tr = tbl.insertRow();
       for (let j = 0; j < r.length; j++) {

           var k = r[ j ];
           const td = tr.insertCell();
           k.td = td;

           if( k.pad ) {
             var clazz = "kbkeys" + (k.width+"").replace(".","p");
             console.log( clazz );
              td.colSpan = 1 * 2;
           }
           else {
             if( k.visualSHIFT ) {
               var shiftDiv = document.createElement("div");
               shiftDiv.classList.add( "kbkeysShift" );

               var plainDiv = document.createElement("div");
               td.appendChild( shiftDiv );
               td.appendChild( plainDiv );


               shiftDiv.innerHTML = k.visualSHIFT;
               plainDiv.innerHTML = k.visual;

               shiftDiv.id = i + "_" + j + "_SDIV";
               plainDiv.id = i + "_" + j + "_PDIV";

               td.addEventListener('touchend', this, false);
             }
             else {
               td.innerHTML = k.visual;
               td.addEventListener('touchend', this, false);
             }

             var clazz;

             if( k.smallText === undefined ) {
               clazz = "kbkeys" + (k.width+"").replace(".","p");
             }
             else {
               clazz = "kbkeys1p5";
             }

             console.log( k.visual, clazz );
             td.classList.add( clazz );
             td.classList.add( "kbkeysbase" );
             td.colSpan = k.width * 2;
             td.id = i + "_" + j;


           }

           //td.style.border = '1px solid black';
         }

     }

  }

 handleEvent( x ) {
   console.log("handleEvent", x, x.type )

   if( x.type == "touchend" ) {
     var target = x.target.id.split("_");
     var key = this.kbArray[ target[0]][target[1]];
     var shift = this.shift;
     var eventValue;

     if( key.eventValue == "shift") {
       this.shift = ! this.shift;
       this.shiftKey = key;
       if( this.shift ) {
         key.td.style="background-color: #0000aa"
       }
       else {
         key.td.style="background-color: #000000"
       }
       return;
     }
     else {
       eventValue = key.eventValue;

       if( this.shift ) {
         this.shift = false;
         eventValue = key.eventValueSHIFT;
         this.shiftKey.td.style="background-color: #000000";
       }

       key.td.style="background-color: #0000aa";
       setTimeout(function(){
          // The code you want to run goes here.
          key.td.style="background-color: #000000";
        }, 150);
     }

     var newkey = {
       shift: shift,
       visual: key.visual,
       width: key.width,
       eventValue: eventValue,
       smallText: key.smallText,
       pad: key.pad
     }

     this.eventHandlerClass["handleVKPressEvent"]( newkey );

   }
 }

 singleKey( visual, smallText, eventValue ) {

    if( eventValue === undefined ) {
      return {
        visual: visual,
        width: 1,
        eventValue: visual,
        smallText: smallText
      }
    }
    return {
      visual: visual,
      width: 1,
      eventValue: eventValue,
      smallText: smallText
    }
  }


  doubleKey2(
      visualPlain, _eventValuePlain,
      visualCTRL, _eventValueCTRL,
      visualCBM, _eventValueCBM,
      visualSHIFT, _eventValueSHIFT ) {

     var eventValuePlain = _eventValuePlain,
     eventValueCTRL = _eventValueCTRL,
     eventValueCBM = _eventValueCBM,
     eventValueSHIFT = _eventValueCBM;

     if( eventValuePlain === undefined ) { eventValuePlain = visualPlain; }
     if( eventValueCTRL === undefined ) { eventValueCTRL = visualCBM; }
     if( eventValueSHIFT === undefined ) { eventValueSHIFT = visualSHIFT; }
     if( eventValueCBM === undefined ) { eventValueCBM = visualCBM; }

     return {
       visual: visualPlain,
       visualCTRL: visualCTRL,
       visualCBM: visualCBM,
       visualSHIFT: visualSHIFT,

       eventValue: eventValuePlain,
       eventValueCTRL: eventValueCTRL,
       eventValueCBM: eventValueCBM,
       eventValueSHIFT: eventValueSHIFT,

       width: 2,

       smallText: false
     }
   }


  singleKey2(
      visualPlain, _eventValuePlain,
      visualCTRL, _eventValueCTRL,
      visualCBM, _eventValueCBM,
      visualSHIFT, _eventValueSHIFT,
      smallText ) {

     var eventValuePlain = _eventValuePlain,
     eventValueCTRL = _eventValueCTRL,
     eventValueCBM = _eventValueCBM,
     eventValueSHIFT = _eventValueSHIFT;

     if( eventValuePlain === undefined ) { eventValuePlain = visualPlain; }
     if( eventValueCTRL === undefined ) { eventValueCTRL = visualCBM; }
     if( eventValueSHIFT === undefined ) { eventValueSHIFT = visualSHIFT; }
     if( eventValueCBM === undefined ) { eventValueCBM = visualCBM; }

     return {
       visual: visualPlain,
       visualCTRL: visualCTRL,
       visualCBM: visualCBM,
       visualSHIFT: visualSHIFT,

       eventValue: eventValuePlain,
       eventValueCTRL: eventValueCTRL,
       eventValueCBM: eventValueCBM,
       eventValueSHIFT: eventValueSHIFT,

       width: 1,

       smallText: smallText
     }
   }


 padDummyHalfKey() {
    return {
      pad: true,
      width: .5
    }
  }

 padDummyKey() {
    return {
      pad: true,
      width: 1
    }
  }

 longKey( visual, width, eventValue ) {
    return {
      visual: visual,
      width: width,
      eventValue: eventValue
    }
  }

}
