class ErrorHandler {

  newError( clazz, detail, context, lineNr ) {
    return { context: context, clazz: clazz, detail: detail, lineNr: lineNr };
  }

  throwError( clazz, detail, context, lineNr ) {
    throw this.newError( clazz, detail, context, lineNr );
  }

  fromSerializedError( s, context, lineNr0 ) {

    var lineNr = lineNr0;
    if( lineNr === undefined ) {
      lineNr = -1;
    }
    if( ! this.isSerializedError( s ) ) {
      return this.newError( "unknown", null, context, lineNr );
    }
    var parts = s.substr(1).split("@");
    if( parts.length == 1 ) {
        return this.newError( parts[0], null, context, lineNr );
    }
    return this.newError( parts[0], parts[1], context, lineNr );

  }

  isSerializedError( e ) {
    if( typeof e != "string" ) {
      return false;
    }
    return e.startsWith( "@" );
  }

  isError( e ) {
    if( Object.prototype.toString.call( e ) === '[object Object]' ) {
      var ctx = e[ "context" ];
      var clss = e[ "clazz" ];
      var dtl = e[ "detail" ];

      if( !( clss === undefined ) ) {
        return true;
      }
    }
    return false;
  }
}
