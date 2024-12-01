import {
  TToken,
  TAbstractSyntaxTree,
  TSVGAbstractSyntaxTree,
  KEYWORD,
  SYNTAX_TYPE,
  TOKEN_TYPE,
  TExpression,
} from "./types";

export class Compiler {
  private paper = {
    color: "",
    width: "",
    height: "",
  };
  private penColor: string = "";

  private lexer(code: string): TToken[] {
    function isKeyword(value: string) {
      return Object.values(KEYWORD).includes(value as KEYWORD);
    }

    const test = code
      .split(/\s+/)
      .filter((token) => token.length)
      .map((token) =>
        isKeyword(token)
          ? { type: TOKEN_TYPE.KEYWORD, value: token }
          : { type: TOKEN_TYPE.ARGUMENT, value: token }
      ) as TToken[];

    return test;
  }

  private parser(tokens: TToken[]): TAbstractSyntaxTree {
    const ast: TAbstractSyntaxTree = {
      type: "Drawing",
      body: [],
    };

    while (tokens.length) {
      const currentToken = tokens.shift();
      let argument: TToken | undefined;
      let i: number;

      if (currentToken?.type === TOKEN_TYPE.KEYWORD) {
        switch (currentToken.value) {
          case KEYWORD.PAPER:
            const paperExpression: TExpression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.PAPER,
              arguments: [],
            };
            i = 3;

            while (i--) {
              argument = tokens.shift();

              if (argument?.type === TOKEN_TYPE.ARGUMENT) {
                paperExpression.arguments.push({
                  type: SYNTAX_TYPE.NumberLiteral,
                  value: argument.value,
                });
              } else {
                throw `${KEYWORD.PAPER} command must be followed by 3 numbers.`;
              }
            }

            this.paper.color = paperExpression.arguments[0].value;
            this.paper.width = paperExpression.arguments[1].value;
            this.paper.height = paperExpression.arguments[2].value;

            ast.body.push(paperExpression);
            break;

          case KEYWORD.PEN:
            const penExpression: TExpression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.PEN,
              arguments: [],
            };
            argument = tokens.shift();

            if (argument?.type === TOKEN_TYPE.ARGUMENT) {
              penExpression.arguments.push({
                type: SYNTAX_TYPE.NumberLiteral,
                value: argument.value,
              });

              this.penColor = argument.value;
            } else {
              throw `${KEYWORD.PEN} command must be followed by 1 color argument.`;
            }

            ast.body.push(penExpression);
            break;

          case KEYWORD.RECT:
            const lineExpression: TExpression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.RECT,
              arguments: [],
            };
            i = 4;

            while (i--) {
              argument = tokens.shift();

              if (argument?.type === TOKEN_TYPE.ARGUMENT) {
                lineExpression.arguments.push({
                  type: SYNTAX_TYPE.NumberLiteral,
                  value: argument.value,
                });
              } else {
                throw `${KEYWORD.PAPER} command must be followed by 4 numbers.`;
              }
            }

            ast.body.push(lineExpression);
            break;

          case KEYWORD.CIRCLE:
            const circleExpression: TExpression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.CIRCLE,
              arguments: [],
            };
            i = 6;

            while (i--) {
              argument = tokens.shift();

              if (argument?.type === TOKEN_TYPE.ARGUMENT) {
                circleExpression.arguments.push({
                  type: SYNTAX_TYPE.NumberLiteral,
                  value: argument.value,
                });
              } else {
                throw `${KEYWORD.CIRCLE} command must be followed by 6 numbers.`;
              }
            }

            ast.body.push(circleExpression);
            break;

          default:
            break;
        }
      }
    }

    console.log(JSON.parse(JSON.stringify(ast)));
    return ast;
  }

  private transformer(ast: TAbstractSyntaxTree) {
    const svg_ast: TSVGAbstractSyntaxTree = {
      tag: "svg",
      attr: {
        width: this.paper.width,
        height: this.paper.height,
        viewBox: `0 0 ${this.paper.width} ${this.paper.height}`,
        xmlns: "http://www.w3.org/2000/svg",
        version: "1.1",
      },
      body: [],
    };

    while (ast.body.length) {
      const node = ast.body.shift()!;
      let data: TSVGAbstractSyntaxTree;

      switch (node.name) {
        case KEYWORD.PAPER:
          data = {
            tag: "rect",
            attr: {
              x: 0,
              y: 0,
              width: this.paper.width,
              height: this.paper.height,
              fill: this.paper.color,
            },
          } as TSVGAbstractSyntaxTree;

          svg_ast.body.push(data);
          break;

        case KEYWORD.PEN:
          break;

        case KEYWORD.RECT:
          data = {
            tag: "rect",
            attr: {
              x: node.arguments[0].value,
              y: node.arguments[1].value,
              width: node.arguments[2].value,
              height: node.arguments[3].value,
              fill: this.penColor,
            },
          } as TSVGAbstractSyntaxTree;

          svg_ast.body.push(data);
          break;

        case KEYWORD.CIRCLE:
          data = {
            tag: "circle",
            attr: {
              cx: node.arguments[0].value,
              cy: node.arguments[1].value,
              r: node.arguments[2].value,
              stroke: node.arguments[3].value,
              "stroke-width": node.arguments[4].value,
              fill: node.arguments[5].value,
            },
          } as TSVGAbstractSyntaxTree;

          svg_ast.body.push(data);
          break;
      }
    }

    console.log(JSON.parse(JSON.stringify(svg_ast)));
    return svg_ast;
  }

  private generator(svg_ast: TSVGAbstractSyntaxTree) {
    function createAttrString(attr: object) {
      return (
        Object.keys(attr)
          // @ts-ignore
          .map((key) => `${key}="${attr[key]}"`)
          .join(" ")
      );
    }

    const svg_attr = createAttrString(svg_ast.attr);
    const elements = svg_ast.body
      .map(
        (node) =>
          "<" +
          node.tag +
          " " +
          createAttrString(node.attr) +
          "></" +
          node.tag +
          ">"
      )
      .join("\r\t");

    return "<svg " + svg_attr + ">\r" + elements + "\r</svg>";
  }

  compile(code: string) {
    try {
      return this.generator(this.transformer(this.parser(this.lexer(code))));
    } catch (error) {
      console.error(error);
    }

    return "";
  }
}
