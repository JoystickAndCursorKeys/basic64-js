function singleKey( visual, eventValue ) {
  return {
    visual: visual,
    width: 1,
    eventValue: eventValue
  }
}

function padDummyKey() {
  return {
    pad: true,
    width: 1
  }
}

function longKey( visual, width, eventValue ) {
  return {
    visual: visual,
    width: width,
    eventValue: eventValue
  }
}

function kbInit( kbTable ) {

  var kbArray = [];
  var kbRow = [];
kbRow.push( padDummyKey() );
    kbRow.push( singleKey( "<-" ) );
    kbRow.push( singleKey( "1" ) );
    kbRow.push( singleKey( "2" ) );
    kbRow.push( singleKey( "3" ) );
    kbRow.push( singleKey( "4" ) );
    kbRow.push( singleKey( "5" ) );
    kbRow.push( singleKey( "6" ) );
    kbRow.push( singleKey( "7" ) );
    kbRow.push( singleKey( "8" ) );
    kbRow.push( singleKey( "9" ) );
    kbRow.push( singleKey( "0" ) );
    kbRow.push( singleKey( "+" ) );
    kbRow.push( singleKey( "-" ) );
    kbRow.push( singleKey( "#" ) );
    kbRow.push( singleKey( "clr" ) );
    kbRow.push( singleKey( "ins" ) );
    kbRow.push( padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
  kbRow.push( padDummyKey() );
    kbRow.push( longKey( "ctrl", 1.5 ) );
    kbRow.push( singleKey( "q" ) );
    kbRow.push( singleKey( "w" ) );
    kbRow.push( singleKey( "e" ) );
    kbRow.push( singleKey( "r" ) );
    kbRow.push( singleKey( "t" ) );
    kbRow.push( singleKey( "y" ) );
    kbRow.push( singleKey( "u" ) );
    kbRow.push( singleKey( "i" ) );
    kbRow.push( singleKey( "o" ) );
    kbRow.push( singleKey( "p" ) );
    kbRow.push( singleKey( "@" ) );
    kbRow.push( singleKey( "*" ) );
    kbRow.push( singleKey( "u" ) );
    kbRow.push( longKey( "restore", 1.5 ) );
    kbRow.push( padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
kbRow.push( padDummyKey() );
    kbRow.push( singleKey( "stop" ) );
    kbRow.push( singleKey( "sl" ) );
    kbRow.push( singleKey( "a" ) );
    kbRow.push( singleKey( "s" ) );
    kbRow.push( singleKey( "d" ) );
    kbRow.push( singleKey( "f" ) );
    kbRow.push( singleKey( "g" ) );
    kbRow.push( singleKey( "h" ) );
    kbRow.push( singleKey( "j" ) );
    kbRow.push( singleKey( "k" ) );
    kbRow.push( singleKey( "l" ) );
    kbRow.push( singleKey( ":" ) );
    kbRow.push( singleKey( ";" ) );
    kbRow.push( singleKey( "=" ) );
    kbRow.push( longKey( "return", 2.0 ) );
    kbRow.push( padDummyKey() );
    kbArray.push( kbRow );

    var kbRow = [];
kbRow.push( padDummyKey() );
    kbRow.push( singleKey( "c=" ) );
    kbRow.push( longKey( "sh",1.5 ) );
    kbRow.push( singleKey( "z" ) );
    kbRow.push( singleKey( "x" ) );
    kbRow.push( singleKey( "c" ) );
    kbRow.push( singleKey( "v" ) );
    kbRow.push( singleKey( "b" ) );
    kbRow.push( singleKey( "n" ) );
    kbRow.push( singleKey( "m" ) );
    kbRow.push( singleKey( "<" ) );
    kbRow.push( singleKey( ">" ) );
    kbRow.push( singleKey( "?" ) );
    kbRow.push( longKey( "sh",1.5 ) );
    kbRow.push( singleKey( "up" ) );
    kbRow.push( singleKey( "rg" ) );
    kbRow.push( padDummyKey() );
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

           if( k.pad ) {
             var clazz = "kbkeys" + (k.width+"").replace(".","p");
             console.log( clazz );
              td.colSpan = 1;
           }
           else {
             td.appendChild(document.createTextNode(k.visual));
             var clazz = "kbkeys" + (k.width+"").replace(".","p");
             console.log( clazz );
             td.classList.add( clazz );
             td.classList.add( "kbkeysbase" );
             td.colSpan = k.width * 2;
           }

           //td.style.border = '1px solid black';
         }

     }

}
