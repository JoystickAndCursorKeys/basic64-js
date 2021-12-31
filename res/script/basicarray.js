class  BasicArray {

  constructor( indices, defaultValue ) {
    this.indices = indices;
    this.buffer = null;
    this.defaultValue = defaultValue;
  }

  getIndexCount() {
    return this.indices.length;
  }

  _check( indices ) {
    if( indices.length != this.indices.length ) {
      throw "index mismatch";
    }
    for( var i=0; i<indices.length; i++) {
      if ( indices[i] > this.indices[ i ]) {
        throw "out of bounds";
      }
      else if ( indices[i] < 0) {
        throw "index smaller then zero";
      }

    }
  }

  set( indices, val ) {
    this._check( indices );
    if( this.buffer == null ) {
      this.buffer = [];
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        ptr[ indices[ i ]] = val;
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          ptr[ indices[ i ]] = [];
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

  get( indices ) {
    this._check( indices );

    if( this.buffer == null ) {
      return this.defaultValue;
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        return ptr[ indices[ i ]];
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          return this.defaultValue;
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

}
