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
  private lexer(code: string): TToken[] {
    return code
      .split(/\s+/)
      .filter((token) => token.length)
      .map((token) =>
        // @ts-ignore
        isNaN(token)
          ? { type: TOKEN_TYPE.WORD, value: token }
          : { type: TOKEN_TYPE.NUMBER, value: token }
      );
  }

  private parser(tokens: TToken[]): TAbstractSyntaxTree {
    const ast: TAbstractSyntaxTree = {
      type: "Drawing",
      body: [],
    };

    while (tokens.length) {
      const currentToken = tokens.shift();
      let argument: TToken | undefined;
      let expression: TExpression;

      if (currentToken?.type === TOKEN_TYPE.WORD) {
        switch (currentToken.value) {
          case KEYWORD.PAPER:
            argument = tokens.shift();
            expression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.PAPER,
              arguments: [],
            };

            if (argument?.type === TOKEN_TYPE.NUMBER) {
              expression.arguments.push({
                type: SYNTAX_TYPE.NumberLiteral,
                value: Number(argument.value),
              });

              ast.body.push(expression);
            } else {
              throw `${KEYWORD.PAPER} command must be followed by a number.`;
            }

            break;

          case KEYWORD.PEN:
            break;

          case KEYWORD.LINE:
            expression = {
              type: SYNTAX_TYPE.CallExpression,
              name: KEYWORD.LINE,
              arguments: [],
            };
            let i = 4;

            while (i--) {
              argument = tokens.shift();

              if (argument?.type === TOKEN_TYPE.NUMBER) {
                expression.arguments.push({
                  type: SYNTAX_TYPE.NumberLiteral,
                  value: Number(argument.value),
                });
              } else {
                throw `${KEYWORD.PAPER} command must be followed by 4 numbers.`;
              }
            }

            ast.body.push(expression);

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
    let pen_color = 100; // cor padrão da caneta é preta
    const svg_ast: TSVGAbstractSyntaxTree = {
      tag: "svg",
      attr: {
        width: 100,
        height: 100,
        viewBox: "0 0 100 100",
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
          const paper_color = 100 - node.arguments[0].value;
          data = {
            tag: "rect",
            attr: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              fill:
                "rgb(" +
                paper_color +
                "%," +
                paper_color +
                "%," +
                paper_color +
                "%)",
            },
          } as TSVGAbstractSyntaxTree;

          svg_ast.body.push(data);
          break;

        case "Pen":
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          pen_color = 100 - node.arguments[0].value;
          break;

        case "Line":
          // @ts-ignore
          const [arg1, arg2, arg3, arg4] = node.arguments;
          data = {
            tag: "rect",
            attr: {
              x: arg1.value,
              y: arg2.value,
              width: arg3.value,
              height: arg4.value,
              fill: "white",
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
