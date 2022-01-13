/*
---so tests

	10 print a(2,3):  q = 2 : q=4


---eo tests


	instruction =
		assignment | statementcall

	pad = "\s" | "\t"

	assignment = varname "=" expression

	varname = [pad]* namestring [pad]*

	namestring = [A-Za-z][A-Za-z0-9]*

	expression = constant | varname | "(" expression ")" | expression op expression

	op = "+" | "-" | "*" | "/" | ";"

	constant = constantstring | constantint

	constantstring = [pad]* '"' validstringcontent '"'

	validcontantstring =  [all_but_not_'"']*

	constantint = [pad]* [-]+[0-9]* [pad]*

	validconstantint = [-]+[0-9]*

	statementcall = statname [statpar]+ | [statpar] [sep statpar]*

	sep = ","

	statname = [pad]* namestring [pad]*

	statpar = expression


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



10  a = 10
15  a = (10)
20  a = 10 : b=10
30  a = "hi"
40  a = 10 + 10
50  a = sin( 1 )
60  a = sin()
70  a = b + sin() + "" + 2
80  a = b + ((sin() + "") + 2)
90  a = color(1,2)
100  print 1
110  print 1: print 2
120  print 1: a=10: print 1
130  print b + ((sin() + "") + 2)


  TODO
    IF
    THEN
    AND
    NOT
    OR
    GOTO
    GOSUB
    RETURN
    FOR TO NEXT STEP


      ()<-error (empty expression)
      sin()
      sin(()+5)
      sin()

*/


class Parser {

  constructor( cmds, ecmds ) {
    this.commands = cmds;
    this.extendedcommands = ecmds;
    this.errorHandler = new ErrorHandler();
  }

  init() {

	  this.CTRL_KW = ["IF","THEN","GOTO","AND", "NOT", "OR",  "GOSUB", "RETURN", "FOR", "TO", "NEXT", "STEP", "DATA", "REM", "GOSUB", "DIM", "END", "LET", "STOP" ];
    this.SHORTCUT_KW = ["?"];

    this.KEYWORDS = this.commands.getStatements();

    var more = this.extendedcommands.getStatements();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.commands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.extendedcommands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

//kwcodes for later use
    //this.KWCODES = this.commands.getStatements();

    //this.padArray( this.KWCODES, 64 );

    //var fun = this.commands.getFunctions();
    //for( var i=0; i<fun.length; i++) {
//      this.KWCODES.push( fun[ i ] );
    //}
    //this.padArray( this.KWCODES, 128 );

     for( var i=0; i<this.CTRL_KW.length; i++) {
       this.KEYWORDS.push( this.CTRL_KW[ i ] );
       //this.KWCODES.push( this.CTRL_KW[ i ] );
     }
     //this.padArray( this.KWCODES, 192 );

     for( var i=0; i<this.SHORTCUT_KW.length; i++) {
       this.KEYWORDS.push( this.SHORTCUT_KW[ i ] );
       //this.KWCODES.push( this.SHORTCUT_KW[ i ] );
     }
     //this.padArray( this.KWCODES, 256 );

     console.log("KEYWORDS:" , this.KEYWORDS );
     //console.log("KWCODES:" , this.KWCODES );

     this.screenCodes2CTRLTable = [];
     var tab = this.screenCodes2CTRLTable;

     tab['\x93'] = '\x13';
     tab['\xd3'] = '\x93';
  }

  getKeyWordCodes() {
    throw "(Extended) Keywords not yet supported";
    return this.KWCODES;
  }

  padArray( arr, nr ) {
    var missing = nr - arr.length;
    while( missing > 0) {
      arr.push( null );
      missing--;
    }
  }

  Exception( ctx, x ) { /*old*/
    console.log( ctx );
    console.log(" Exception " + x + " at line " + ctx.lineNumber);
    throw x + " at line " + ctx.lineNumber;
  }



	removePadding( tokens ) {
		var tokens2 = [];

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( token ) {
				if( token.type != "pad" ) {
					tokens2.push( token );
				}
			}

		}

		return tokens2;
	}

  mergeCompTokens( tokens ) {
		var tokens2 = [];

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( i>0 ) {
        var token2 = tokens[i-1];
				if( ( token.type == "comp" || token.type == "eq" ) &&
            ( token2.type == "comp" || token2.type == "eq" ) ) {
					token2.type = "@@removeme";
          token.data = token2.data + token.data;
          token.type = "comp";
          if( token.data == "><" ) {
            token.data = "<>";
          }
          else if( token.data == "=<" ) {
            token.data = "<=";
          }
          else if( token.data == "=>" ) {
            token.data = ">=";
          }

  			}
			}

      if( ( token.type == "name"  && token.data == "OR" ) ||
        ( token.type == "name"  && token.data == "AND" ) ||
        ( token.type == "name"  && token.data == "NOT" )) {
          token.type = "bop";
        }

		}

    for( 	var i=0;
					i<tokens.length;
					i++)
		{
      if( tokens[i].type!="@@removeme") {
        tokens2.push( tokens[i] );
      }
    }

		return tokens2;
	}


	parseFunParList( context ) {

		var tokens = context.tokens;
		var params = [];
		var even = true;

		var endTokens = [];
		endTokens.push( { type: "sep", data: "@@@all" });
		endTokens.push( { type: "bracket", data: ")" });

		endTokens.push();

		while( true ) {

			var token;

      if( tokens.length > 0) {
        if( tokens[0].type=="bracket" && tokens[0].data==")") {
          break;
        }
      }

			if( even ) {
        var expr = this.parseExpression( context, endTokens );
        expr.type = "expr";
				params.push( expr );
			}
			else {
				token = tokens.shift();

				if( token.type=="sep" ) {
					//all ok, next par
				}
				else {
					this.Exception( context, "expected comma or ), got "+token.type + " " + token.data);
				}
			}
			even = !even;
		}

		return params;
	}


	peekIfNextIsOpenBracket( context ) {

		var tokens = context.tokens;

		if( tokens.length > 0 ) {
			if( tokens[0].type == "bracket" && tokens[0].data == "(") {
				return true;
			}
		}
		return false;
	}

	parseSubExpression( context ) {

		var token = context.tokens.shift();

		if( !(token.type == "bracket" && token.data == "(")) {
			this.Exception( context, "parsing subexpression, expected bracket, not " + token.type + " - " + token.data);
		}

		var endTokens = [];
		endTokens.push( { type: "bracket", data: ")" });

		var expr = this.parseExpression( context, endTokens );
		context.tokens.shift();

		expr.type = "expr";
		return expr;
	}


  tokensToString( token )  {
    var str = "";

    if(token.data == "@@@all") {
        str = str + "'" + token.type + "'";
    }
    else {
      str = str + "'" + token.type + "/" + token.data + "'";
    }

    return str;
  }

  endTokensToString( endTokenArry )  {
    var str = "";

    for( var et=0; et<endTokenArry.length; et++) {
      var endToken = endTokenArry[et];

      if( str != "") { str+= " ";}
      str += this.tokensToString( endToken );
    }
    return str;
  }

  isEndToken( token, endTokenArry ) {

    for( var et=0; et<endTokenArry.length; et++) {
      var endToken = endTokenArry[et];

      if( token.type == endToken.type && token.data == endToken.data ) {
        return true;
      }
      else if( token.type == endToken.type && endToken.data == "@@@all" ) {
        return true;
      }
    }
    return false;
  }


  parseSimpleExpression( context, endTokens ) {

    var endLoop;
		var tokens = context.tokens;
    if( tokens.length == 0) {
      return undefined;
    }

		var token, returnValue=undefined;
		token = tokens.shift();

		if( !token ) {
			this.Exception( context, "empty simple expression");
		}

    endLoop = this.isEndToken( token, endTokens );
    if( endLoop ) {
      this.Exception( context, "empty simple expression");
    }

		if( token.type == "num" ) {
        returnValue= { type: "num", data: token.data };
		}
		else if( token.type == "str" ) {
				returnValue= { type: "str", data: token.data };
		}

    token = tokens.shift();
    if( token ) {
      endLoop = this.isEndToken( token, endTokens );
      if( !endLoop ) {
        this.Exception( context, "empty simple expression end expected");
      }
    }

		return [returnValue, token];
	}

	parseExpression( context, endTokens ) {

		var tokens = context.tokens;
    if( tokens.length == 0) {
      return null;
    }

		var expression = {
					parts: [],
          negate: false,
          binaryNegate: false
		};

		var index = 0;
		var even = true;
		var op = null;
		var parts = expression.parts;
    var first = true;
    var negate = false;
    var binaryNegate = false;


		while( true ) {
			var token, part;
			token = tokens.shift();

			if( !token ) {
				break;
			}

      var endLoop = this.isEndToken( token, endTokens );
      if( endLoop ) {

        tokens.unshift( token );
        break;
      }

			if( even ) {

				if( token.type == "num" ) {
					part = { type: "num", data: token.data, op: op };
          if( negate ) {
            part.data = -part.data;
          }
					parts.push( part );
          first = false;
				}
				else if( token.type == "str" ) {
					part = { type: "str", data: token.data, op: op };
					parts.push( part );
          first = false;
				}
				else if( token.type=="bracket" && token.data=="(") {
						tokens.unshift( token );

            var subEndTokens = [];
            subEndTokens.push( { type: "bracket", data: ")" });

						var expr = this.parseSubExpression( context, subEndTokens );
            expr.op = op;
            expr.negate = negate;
            expr.binaryNegate = binaryNegate;
						parts.push ( expr );
            first = false;
				}
				else if( token.type=="name" ) {

						var name = token.data;
						var isFunctionCallOrArray = this.peekIfNextIsOpenBracket( context );

						if( isFunctionCallOrArray ) {
							token = tokens.shift();
							var parameters = this.parseFunParList( context );
              tokens.shift();

              part = { type: "funCall", params: parameters, op: op, functionName: name };

              if( this.KEYWORDS.indexOf( name ) == -1 ) {
                //isArray  example: x=a(5)
                part = { type: "array", data: name, op: op, indices: parameters };

              }

              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
							else {
                parts.push ( part );
              }

						}
						else {
							part = { type: "var", data: token.data, op: op };
              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
              else {
                parts.push ( part );
              }

						}
            first = false;
				}
        else if( token.type=="op" && token.data=="-" && first ) {
          negate = ! negate;

          continue;
        }
        else if( token.type=="bop" && token.data=="NOT" && first ) {
          binaryNegate = ! binaryNegate;
          expression.binaryNegate = binaryNegate;
          console.log("NOT")
          continue;
        }
				else {
					this.Exception( context, "expected number, string, symbol or bracket, not " + token.data);
				}
        op = null;
			}
			else {

				if( token.type == "op" || token.type == "comp" || token.type == "eq" || token.type == "bop" ) {
					op = token.data;
				}
				else {
					this.Exception( context, "expected operator or "+
          this.endTokensToString(endTokens)+
          ", not " + token.type + " " + token.data);
				}
			}
			even = !even;

		}

    if( op != null ) {
      part = { type: "uniop", data: null, op: op };
      parts.push ( part );
    }

		if( expression.parts == null ) {
			return null;
		}

    for( var i=0; i<expression.parts.length; i++ ) {

      var part = expression.parts[ i ];
      if( i>0 && (part.op == "*" || part.op == "/" ) ) {
        var prevPart = expression.parts[ i-1 ];

        var subExpr = {
          negate: false,
          binaryNegate: false,
          type: "expr",
          parts: [],
          op: prevPart.op
        };

        subExpr.parts[ 0 ] = prevPart;
        subExpr.parts[ 0 ].op = null;
        subExpr.parts[ 1 ] = part;

        expression.parts[i-1] = null;
        expression.parts[ i ] = subExpr;

      }
    }

    var expression2 = expression;
    expression = {
          parts: [],
          negate: expression2.negate,
          binaryNegate: expression2.binaryNegate
    };
    for( var i=0; i<expression2.parts.length; i++ ) {

      var part = expression2.parts[ i ];
      if( part != null ) {
        expression.parts.push( part );
      }
    }

//    console.log(expression);
		return expression;
	}

  normalizeStatementName( x ) {
    if(x == "?") {
      return "print";
    }
    return x;
  }

	parseLineCommands( context, preTokens ) {

		var tokens = context.tokens;
		var commands = [];

		var i=1;
		while( true ) {

			var command = {};
			var token;

			command.lineNumber = context.lineNumber;

			token = tokens.shift();
			if( token === undefined ) {
				break;
			}
			if( token.type == "cmdsep" ) {
				/* empty command */
				continue;
			}

			if( token.type != "name" ) {
				this.Exception( context, "Unexpected token, expected symbolname, got " + token.type + "/" + token.name) ;
			}

			var nameToken = token.data;
			var cmdType = "unknown";

			if( this.CTRL_KW.indexOf( token.data ) > -1) {
					cmdType = "control";
			}

			token = tokens.shift();
			if( token === undefined ) {
				token = { type: "@@@notoken" };
			}

			if( token.type == "eq") {
				if( cmdType == "control" ) {
					this.Exception( context, "Unexpected symbol name, '"+nameToken+"' is a control keyword");
				}
				cmdType = "assignment";
				command.type = cmdType;
				command.var = nameToken;
        command.arrayAssignment = false;

				var endTokens = [];
				endTokens.push( { type: "cmdsep", data: "@@@all" });

				command.expression = this.parseExpression( context, endTokens );
				commands.push( command );
			}
      //tokens[0].type=="bracket" && tokens[0].data==")")
      /*
      if( this.KEYWORDS.indexOf( name ) == -1 ) {
        //isArray  example: x=a(5)
        part = { type: "array", data: name, op: op, indices: parameters };

      }

      var isFunctionCallOrArray = this.peekIfNextIsOpenBracket( context );

      if( isFunctionCallOrArray ) {
        token = tokens.shift();
        var parameters = this.parseFunParList( context );
        tokens.shift();
      */
      else if( token.type == "bracket" && token.data=="(" ) {
				if( cmdType == "control" ) {
					this.Exception( context, "Unexpected symbol name, '"+nameToken+"' is a control keyword");
				}
				cmdType = "assignment";
				command.type = cmdType;
				command.var = nameToken;
        command.arrayAssignment = true;

        //token = tokens.shift();
        var indices = this.parseFunParList( context );
        command.indices = indices;

        tokens.shift();
        console.log("tokens after:",tokens)

        token = tokens.shift();
        if( token === undefined ) {
          token = { type: "@@@notoken" };
        }

        if( token.type != "eq") {
					this.Exception( context, "Expected =");
				}

				var endTokens = [];
				endTokens.push( { type: "cmdsep", data: "@@@all" });

				command.expression = this.parseExpression( context, endTokens );
				commands.push( command );
			}
			else {
				if( cmdType == "control" ) {
					cmdType = "control";
					command.type = cmdType;
          var controlToken = nameToken;
					command.controlKW = nameToken.toLowerCase();
          if( token.type != "@@@notoken") {
						tokens.unshift( token );
					}

          if( controlToken == "LET") {

            token = tokens.shift();
            if( token.type != "name") {
              this.Exception( context, "LET expects var name");
            }
            nameToken = token.data;

            token = tokens.shift();
      			if( token === undefined ) {
      				token = { type: "@@@notoken" };
      			}

            if( token.type != "eq") {
              this.Exception( context, "LET expects =");
            }

            cmdType = "assignment";
            command.type = cmdType;
            command.var = nameToken;

            var endTokens = [];
    				endTokens.push( { type: "cmdsep", data: "@@@all" });

    				command.expression = this.parseExpression( context, endTokens );
    				commands.push( command );
          }
          else if( controlToken == "DIM") {

            var first = true;
            command.params = [];
            command.arrayNames = [];

            while( true ) {

              token = tokens.shift();
              if(!first ) {
                if( token === undefined ) {
                  break;
                }
                if( ! ( token.type == "sep" && token.data == "," )) {
                  tokens.unshift( token );
                  break;
                }
                token = tokens.shift();
              }

              if( token.type != "name" ) {
                this.Exception( context, "DIM expects var name");
              }

              nameToken = token.data;

              token = tokens.shift();
        			if( token === undefined ) {
        				token = { type: "@@@notoken" };
        			}

              if( !(token.type=="bracket" && token.data=="(") ) {
                this.Exception( context, "DIM expects (");
              }

              var indices = this.parseFunParList( context );

              token = tokens.shift();
        			if( token === undefined ) {
        				token = { type: "@@@notoken" };
        			}

              if( !(token.type=="bracket" && token.data==")") ) {
                this.Exception( context, "DIM expects )");
              }

              command.params.push( indices );
              command.arrayNames.push( nameToken );

              first = false;
            }

            commands.push( command );
          }
          else if( controlToken == "GOTO") {
            var num = -1;

            token = tokens.shift();
            if( token.type != "num") {
              this.Exception( context, "GOTO expects number");
            }
            num = parseInt(token.data);
            token = tokens.shift();
            if( token !== undefined ) {
              if( token.type != "cmdsep") {
                this.Exception( context, "expected cmdsep, instead of "+token.type+"/"+token.data);
              }
            }

            command.params=[];
            command.params[0] = num;
            commands.push( command );

          }
          else if( controlToken == "GOSUB") {
            var num = -1;

            token = tokens.shift();
            if( token.type != "num") {
              this.Exception( context, "GOSUB expects number");
            }
            num = parseInt(token.data);
            token = tokens.shift();
            if( token !== undefined ) {
              if( token.type != "cmdsep") {
                this.Exception( context, "expected cmdsep, instead of "+token.type+"/"+token.data);
              }
            }

            command.params=[];
            command.params[0] = num;
            commands.push( command );

          }
          else if( controlToken == "RETURN") {
            var num = -1;

            command.params=[];
            commands.push( command );

          }
          else if( controlToken == "END") {
            var num = -1;

            command.params=[];
            commands.push( command );

          }
          else if( controlToken == "STOP") {
            var num = -1;

            command.params=[];
            commands.push( command );

          }
          else if( controlToken == "FOR") {

            var variable, expr_from, expr_to, expr_step;
            var endTokens = [];

            token = tokens.shift();
            if( token.type != "name" ) {
              this.Exception( context,
                    "For expects variable, no var found, found " + token.type+"/"+token.data);
            }

            variable = token.data;

            token = tokens.shift();
            if( !( token.type == "eq" && token.data == "=" )) {
              this.Exception( context,
                    "For expects '=', not found, found " + token.type+"/"+token.data);
            }

            endTokens = [];
            endTokens.push( { type: "name", data: "TO" });

						expr_from = this.parseExpression( context, endTokens );

            token = tokens.shift();
            if( !( token.type == "name" && token.data == "TO" ) ) {
              this.Exception( context, "For expects 'to', not found, found " + token.type+"/"+token.data);
            }

            endTokens = [];
            endTokens.push( { type: "cmdsep", data: ":" });
            endTokens.push( { type: "name", data: "STEP" });

						expr_to = this.parseExpression( context, endTokens );
            expr_step = { parts: [ { data: "1", op: null, type: "num"} ] };

            token = tokens.shift();
            if( !( token === undefined ) ) {
              if( token.type == "name" && token.data == "STEP") {

                  endTokens = [];
                  endTokens.push( { type: "cmdsep", data: ":" });
                  expr_step = this.parseExpression( context, endTokens );
              }
              else {
                if(! ( token.type == "cmdsep" && token.data == ":")) {
                  throw "FOR unexpected token " + token.type + "/" + token.data;
                }
              }
            }

            command.controlKW = "for:init";
            command.params=[];
            command.params[0] = expr_from;
            command.params[1] = expr_to;
            command.params[2] = expr_step;
            command.variable = variable;
            commands.push( command );
            console.log("command=", command);

          }
          else if( controlToken == "NEXT") {

            var variable;

            var explicit = false;
            while( true ) {

              var token = tokens.shift();
              if( ! token ) {
                break;
              }
              if( token.type == "cmdsep" ) {
                break;
              }

              if( token.type != "name" ) {
                throw "next expected var or nothing";
              }

              var nextcommand = {
                controlKW: "for:next",
                nextVar: token.data,
                lineNumber: command.lineNumber,
                type: command.type
              };

              commands.push( nextcommand );
              explicit = true;

              var token = tokens.shift();
              if( ! token ) {
                break;
              }
              if( token.type == "cmdsep" ) {
                break;
              }
              if( !( token.type == "sep" && token.data == "," )) {
                throw "expected comma, found " + token.type + "/"+token.data;
              }
            }

            if( ! explicit ) {
              command.controlKW = "for:next";
              command.nextVar = null;
              commands.push( command );
            }

          }
          else if( controlToken == "IF") {

            var expr1, expr2, comp;
            var endTokens = [];
            endTokens.push( { type: "eq", data: "=" });
            endTokens.push( { type: "comp", data: "<" });
            endTokens.push( { type: "comp", data: ">" });
            endTokens.push( { type: "comp", data: "<=" });
            endTokens.push( { type: "comp", data: ">=" });
            endTokens.push( { type: "comp", data: "<>" });
						var expr1 = this.parseExpression( context, endTokens );

            token = tokens.shift();
            if( token.type != "eq" && token.type != "comp" ) {
              this.Exception( context, "If expects expr [comp|eq] expr, no expr found, found " + token.type+"/"+token.data);
            }
            comp = token.data;

            endTokens = [];
            endTokens.push( { type: "name", data: "THEN" });
            endTokens.push( { type: "name", data: "GOTO" });

            var expr2 = this.parseExpression( context, endTokens );
            token = tokens.shift();

            command.params=[];
            command.params[0] = expr1;
            command.params[1] = expr2;
            command.comp = comp;

//------------------

            if( token.type == "name" && token.data == "GOTO") {
              var insert = {};
              insert.data = "GOTO";
              insert.type = "name";
              tokens.unshift( insert );
            } else {
              if( tokens.length > 0 ) {
                if( tokens[0].type == "num" ) {
                  var insert = {};
                  insert.data = "GOTO";
                  insert.type = "name";
                  tokens.unshift( insert );
                }
              }
            }

            var block = this.parseLineCommands( context );

            console.log( block );
            commands.push( command );

            for( var bi=0; bi<block.length; bi++) {
              commands.push( block[bi] );
            }

          }
          else if( controlToken == "DATA") {

            var dataArray = [];
            var endTokens;

            endTokens = [];
            endTokens.push( { type: "cmdsep", data: ":" });
            endTokens.push( { type: "sep", data: "," });

            while ( true ) {
				        var pair = this.parseSimpleExpression( context, endTokens );

                var expr1 = pair[0];


                if( expr1 === undefined ) {
                  throw "data expected data";
                }

                dataArray.push( expr1 );

                token = pair[1];
                if( token === undefined ) {
                  break;
                }
                if( token.type == "cmdsep" && token.data == ":" ) {
                  break;
                }
                else if( token.type == "sep" && token.data ==",") {
            			continue;
            		}
                else {
                  this.Exception( context, "data unknown token found " + token.type+"/"+token.data);
                }
            }

            command.params=dataArray;
            commands.push( command );

          }
          else if( controlToken == "REM") {
            commands.push( command );
            tokens = [];
          }
          else {
            this.Exception( context, command.controlKW + " not implemented");
          }


				}
				else {
					cmdType = "call";
					command.statementName = this.normalizeStatementName( nameToken );
					command.type = cmdType;

					if( token.type != "@@@notoken") {
						tokens.unshift( token );
					}


					command.params = [];

					while ( true ) {

						var endCommand = false;
						var endTokens = [];
						endTokens.push( { type: "sep", data: "@@@all" });
						endTokens.push( { type: "cmdsep", data: "@@@all" });

						var expression = this.parseExpression( context, endTokens );
            console.log( expression );

						if( expression != null ) {
							command.params.push( expression );

							token = tokens.shift();
							if( token != undefined ) {
								if( token === undefined ) {
									endCommand = true;
								}
								if( token.type == "cmdsep" ) {
									endCommand = true;
								}
								else if( token.type == "sep") {
									continue;
								}
								else {
									this.Exception( context, "unexpected chars in statement call: '" + token.data +"'");
								}
							}
							else {
								endCommand = true;
							}

						}
						else {
							endCommand = true;
						}

						if( endCommand  ) {
							commands.push( command );
							break;
						}

					}
				}
			}


		}
    return commands;
	}

  logTokens( tokens ) {
    var tokensStr = "";
    for( var i=0; i<tokens.length; i++) {
      var tok = tokens[i];
      var tokStr = tok.type + ":" + tok.data;
      if( tokensStr != "" ) {
        tokensStr += ", ";
      }
      tokensStr += tokStr;
    }

    console.log( tokensStr );

    for( var i=0; i<tokens.length; i++) {
      var tok = tokens[i];
      console.log("token: ",tok);
    }
  }

  parseLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;
    try {
      errContext="TOKENIZER";
      detail="INIT";
  		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

      detail="PARSING TOKENS";
      var tokens = toker.tokenize();
      //this.logTokens( tokens );

      detail="INTERNAL";
      tokens = this.removePadding( tokens );
      tokens = this.mergeCompTokens( tokens );

      this.logTokens( tokens );


      if( tokens.length == 0 ) {
  			return null;
  		}

  		if( tokens[0].type == "num" ) {
  			lineRecord.lineNumber = tokens[0].data;
        lineNr = tokens[0].data;
        tokens.shift();
      }

  		var context = {
        tokens: tokens,
        lineNumber: lineRecord.lineNumber
      }

      errContext = "PARSER";
      detail="PARSING COMMANDS";
      var commands = this.parseLineCommands( context );
      lineRecord.commands = commands;
      lineRecord.raw = line;
      return lineRecord;
    }
    catch ( e ) {

      if( this.errorHandler.isError( e ) ) {
        if( e.lineNr == -1 ) {
          if( lineNr != -1 ) {
            e.lineNr = lineNr;
          }
        }
        return e;
      }
      this.errorHandler.throwError( errContext, detail, lineNr );
    }
  }

  getTokens( line, merge, noPadding  ) {

    try {
      var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );
      var tokens = toker.tokenize();
      if( noPadding) { tokens = this.removePadding( tokens ); }
      if( merge ) {tokens = this.mergeCompTokens( tokens ); }
      this.logTokens( tokens );
      return tokens;
    }
    catch ( e ) {
      console.log( e );
      this.errorHandler.throwError("TOKEN","TOKEN",-1);
    }
  }
}
