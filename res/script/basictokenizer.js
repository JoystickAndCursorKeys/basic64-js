class StringReader {

	constructor( strIn ) {
			this.buffer = strIn;
			this.index = 0;
			this.lineIndex = 1;
			this.line = 1;
	}

	peek() {
		return this.buffer.substr( this.index,1 );
	}
	peek2() {
		return this.buffer.substr( this.index,2 );
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

		return ctx.c.match("[+]|[-]|[*]|[/]|[;]") != null;

	}

	isCompChar( ctx ) {

		return (ctx.c == "<" || ctx.c == ">");

	}

	isEqChar( ctx ) {
			if( ctx.c == "=" ) {
				return true;
			}
			return false;
	}


	isNameChar( ctx  ) {

		//console.log("SEQ: " + ctx.seq);
		if( ctx.endFound ) {
			return false;
		}
		var rv = ctx.c.match("[a-zA-Z0-9$?]") != null;

		if( ctx.c=="$" ) {
			ctx.endFound = true;
		}

		if( this.keywords.indexOf( ctx.seq ) >-1 ) {
			//console.log("Found Keyword: " + ctx.seq );
			ctx.endFound = true;
		}

		return rv;
	}

	isNumChar( ctx  ) {
		return ctx.c.match("[0-9\.]") != null;
	}

	isPadChar( ctx  ) {
			if( ctx.c == " " || ctx.c == "\t" || ctx.c == "\n" || ctx.c == "\r") {
				return true;
			}
			return false;
	}

	isCommandSepChar( ctx  ) {
			if( ctx.c == ":" ) {
				return true;
			}
			return false;
	}


	isSepChar( ctx  ) {
			if( ctx.c == "," ) {
				return true;
			}
			return false;
	}

	isAnyChar( ctx  ) {
			return  true; /* Will be executed last */
	}


	isBracket( ctx  ) {
		if( ctx.c == "(" || ctx.c == ")" || ctx.c == "[" || ctx.c == "]") {
			return true;
		}
		return false;
	}


	isStrChar( ctx ) {

		if( ctx.endFound ) {
			return false;
		}

		if( ctx.index == 0) {
			if( ctx.c=="\"" ) {
				ctx.inString = true;
				return true;
			}
			return false;
		}
		else if( ctx.inString ) {
			if ( ctx.index > 0 && ctx.c=="\"") {
				ctx.endFound = true;
			}
			return true;
		}

		return false;

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

			if( !this[compareF ] ( ctx ) ) {
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
				if( this[rule[FUNCIX]]( ctx ) ) {
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
