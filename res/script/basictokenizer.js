class StringReader {

	constructor( strIn ) {
			this.buffer = strIn;
			this.index = 0;
			this.lineIndex = 1;
			this.line = 1;
			var a={}; a.b=strIn;
			console.log("Stringreader",  a);
	}

	peek() {
		return this.buffer.substr( this.index,1 );
	}
	peek2() {
		return this.buffer.substr( this.index,2 );
	}


	unconsume( x ) {
		this.index -= x;
	}

	consume() {

		var c = this.buffer.substr( this.index,1 );
		this.index ++;
		if( c == "\n") {
			this.line++;
			this.lineIndex = 1;
		}

	}

	EOF() {
		var len = this.buffer.length;
		if( this.index < len ) {
			return false;
		}
		return true;
	}
}


class Tokenizer {

	constructor( reader, keywords ) {
			this.tokens = [];
			this.reader = reader;
			this.keywords = keywords;
	}

	isOpChar( ctx ) {

		var rv = ctx.c.match("[+]|[-]|[*]|[/]|[\\^]|[;]") != null;

		return [rv,0];

	}

	isCompChar( ctx ) {

		var rv =  (ctx.c == "<" || ctx.c == ">");
		return [rv,0];
	}

	isEqChar( ctx ) {
			if( ctx.c == "=" ) {
				return [true,0];
			}
			return [false,0];
	}


	isNameChar( ctx  ) {

		//console.log("SEQ: " + ctx.seq);
		if( ctx.endFound ) {
			return [false,0];
		}
		var rv = ctx.c.match("[a-zA-Z0-9$%?]") != null;

		if( ctx.c=="$" || ctx.c== "%") {
			ctx.endFound = true;
		}

		if( this.keywords.indexOf( ctx.seq ) >-1 ) {
			//console.log("Found Keyword: " + ctx.seq );
			ctx.endFound = true;
		}
		else if( ! (ctx.seq === undefined )) {
			var trappedKW = false;
			var trapped = null;
			for( var i=0; i<this.keywords.length; i++) {
				var kw = this.keywords[i];
				if( ctx.seq.indexOf( kw ) > 0 )  {
					trappedKW = true;
					trapped = kw;
					//console.log( "trapped-------------" );
					//console.log( kw );
					//console.log( ctx.seq );
					//console.log( ctx );
					return [rv, kw.length ];
				}
			}

		}
		return [rv,0];
	}

	isNumChar( ctx  ) {
		return [(ctx.c.match("[0-9\.~]") != null),0];
	}

	isPadChar( ctx  ) {
			if( ctx.c == " " || ctx.c == "\t" || ctx.c == "\n" || ctx.c == "\r") {
				return [true,0];
			}
			return [false,0];
	}

	isCommandSepChar( ctx  ) {
			if( ctx.c == ":" ) {
				return [true,0];
			}
			return [false,0];
	}


	isSepChar( ctx  ) {
			if( ctx.c == "," ) {
				return [true,0];
			}
			return [false,0];
	}

	isAnyChar( ctx  ) {
			return [true,0]; /* Will be executed last */
	}


	isBracket( ctx  ) {
		if( ctx.c == "(" || ctx.c == ")" || ctx.c == "[" || ctx.c == "]") {
			return [true,0];
		}
		return [false,0];
	}


	isStrChar( ctx ) {

		if( ctx.endFound ) {
			return [false,0];
		}

		if( ctx.index == 0) {
			if( ctx.c=="\"" ) {
				ctx.inString = true;
				return [true,0];
			}
			return [false,0];
		}
		else if( ctx.inString ) {
			if ( ctx.index > 0 && ctx.c=="\"") {
				ctx.endFound = true;
			}
			return [true,0];
		}

		return [false,0];

	}

	normalizeToken( tok0 ) {
		var tok = tok0;

		tok.type = tok0.type;

		if( tok.type == "str" ) {
				tok.data = tok0.data.substr(1,tok0.data.length-2);
		}
		return tok;
	}

	readChars( read, type0, compareF, tokenType ) {
		var tok = { type: type0, data : "" }
		var ctx = { index:0, prev: null, seq: "" };

		while(!read.EOF()) {

			var c = read.peek();

			ctx.seq += c;
			ctx.c = c;

			var rv = this[compareF ] ( ctx );
			if( rv[1] > 0 ) {
					read.unconsume( rv[1]-1 );
					ctx.seq = ctx.seq.substr(0,ctx.seq.length-rv[1]) ;
					tok.data = ctx.seq;
					break;
			}

			if( !rv[0] ) {
				return this.normalizeToken( tok );
			}
			tok.data += c;
			read.consume();

			ctx.index++;
			ctx.prev = c;

			if( tokenType == "chr") {
				break;
			}
		}

		return this.normalizeToken( tok );
	}


	tokenize() {
		var read = this.reader;

		var _this = this;
		var tokens = [];

		var parseRules = [];
		var TYPEIX = 0;
		var FUNCIX = 1;
		var STRINGTYPEIX = 2;

		parseRules.push(["pad", 		"isPadChar"		, "str"] );
		parseRules.push(["str", 		"isStrChar"		, "str"] );
		parseRules.push(["num", 		"isNumChar"		, "str"] );
		parseRules.push(["name", 		"isNameChar"	, "str"] );
		parseRules.push(["op", 			"isOpChar"   	, "chr"] );
		parseRules.push(["comp", 		"isCompChar"  , "chr"] );
		parseRules.push(["eq", 			"isEqChar"   	, "chr"] );
		parseRules.push(["bracket", "isBracket"   , "chr"] );
		parseRules.push(["sep", 		"isSepChar"   , "chr"] );
		parseRules.push(["cmdsep", 	"isCommandSepChar"   , "chr"] );
		parseRules.push(["trash", 	"isAnyChar"   , "chr"] );

		while( !read.EOF() ) {
			var c = read.peek();
			var tokenFound = false;

			for( var i=0; i<parseRules.length; i++) {
				var rule = parseRules[ i ];

				var ctx = { index: 0, c:c }
				var rv = this[rule[FUNCIX]]( ctx );
				if( rv[0] ) {
						var tok = this.readChars( read, rule[TYPEIX], rule[FUNCIX], rule[STRINGTYPEIX] );

						tokens.push( tok );
						tokenFound = true;
						break;
				}
				else {
					//do nothing
				}
			}
			if(!tokenFound) {
				throw "syntax error, unexpected character: '" + c + "' =>" + read.line + ":" + read.lineIndex;
			}
		}
		return tokens;
	}
}
