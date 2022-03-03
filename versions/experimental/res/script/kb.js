
function VirtualKB_event( x ) {

  console.log("VirtualKB_event",x);

}

class  VirtualKB {

  constructor( kbTable, eventHandlerClass  ) {

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
    kbRow.push( T.singleKey( "F1" ) );
    kbRow.push( T.singleKey( "F3" ) );
    kbRow.push( T.singleKey( "F5" ) );
    kbRow.push( T.singleKey( "F7" ) );

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
    kbRow.push( T.singleKey( "/" ) );
    kbRow.push( T.singleKey( "#" ) );
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "&larr;", false, "cursleft" ) );
    kbRow.push( T.singleKey( "&darr;", false, "cursdown" ) );
    kbRow.push( T.singleKey( "&rarr;", false, "cursright" ) );

    kbArray.push( kbRow );


    var kbRow = [];
    kbRow.push( T.padDummyKey() );

    kbRow.push( T.singleKey( "1" ) );
    kbRow.push( T.singleKey( "2" ) );
    kbRow.push( T.singleKey( "3" ) );
    kbRow.push( T.singleKey( "4" ) );
    kbRow.push( T.singleKey( "5" ) );
    kbRow.push( T.singleKey( "6" ) );
    kbRow.push( T.singleKey( "7" ) );
    kbRow.push( T.singleKey( "8" ) );
    kbRow.push( T.singleKey( "9" ) );
    kbRow.push( T.singleKey( "0" ) );
    kbRow.push( T.singleKey( "home", true ) );
    kbRow.push( T.singleKey( "del", true, "delete" ) );

    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );

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

    kbRow.push( T.singleKey( "&uarr;", false, "uparrow" ) );

    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );

    kbRow.push( T.singleKey( "LOCK", true  ) );
    kbRow.push( T.singleKey( "a" ) );
    kbRow.push( T.singleKey( "s" ) );
    kbRow.push( T.singleKey( "d" ) );
    kbRow.push( T.singleKey( "f" ) );
    kbRow.push( T.singleKey( "g" ) );
    kbRow.push( T.singleKey( "h" ) );
    kbRow.push( T.singleKey( "j" ) );
    kbRow.push( T.singleKey( "k" ) );
    kbRow.push( T.singleKey( "l" ) );
    kbRow.push( T.singleKey( ":" ) );
    kbRow.push( T.singleKey( ";" ) );


    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "z" ) );
    kbRow.push( T.singleKey( "x" ) );
    kbRow.push( T.singleKey( "c" ) );
    kbRow.push( T.singleKey( "v" ) );
    kbRow.push( T.singleKey( "b" ) );
    kbRow.push( T.singleKey( "n" ) );
    kbRow.push( T.singleKey( "m" ) );
    kbRow.push( T.singleKey( "." ) );
    kbRow.push( T.singleKey( "," ) );
    kbRow.push( T.singleKey( "=" ) );
    kbRow.push( T.longKey( "RETURN", 2.0, "return" ) );
    kbRow.push( T.padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
    kbRow.push( T.padDummyKey() );
    kbRow.push( T.singleKey( "c=" ) );
    kbRow.push( T.longKey( "SHFT",1.5, "shift" ) );

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
             td.innerHTML = k.visual;
             //td.appendChild(document.createTextNode(k.visual;));
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
             td.addEventListener('touchend', this, false);
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

     if( key.eventValue == "shift") {
       this.shift = ! this.shift;
       this.shiftKey = key;
       if( this.shift ) {
         key.td.style="background-color: #0000aa"
       }
       else {
         key.td.style="background-color: #000000"
       }

     }
     else {
       if( this.shift ) {
         this.shift = false;
         this.shiftKey.td.style="background-color: #000000"
       }

     }

     var newkey = {
       shift: this.shift,
       visual: key.visual,
       width: key.width,
       eventValue: key.eventValue,
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
