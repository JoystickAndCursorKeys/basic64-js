class ErrorHandler {
  throwError( context, detail, lineNr ) {
    throw { context: context, detail: detail, lineNr: lineNr };
  }

  isError( e ) {
    if( Object.prototype.toString.call( e ) === '[object Object]' ) {
      var ctx = e[ "context" ];
      var dtl = e[ "detail" ];

      if( !( ctx === undefined  || dtl === undefined ) ) {
        return true;
      }
    }
    return false;
  }
}
