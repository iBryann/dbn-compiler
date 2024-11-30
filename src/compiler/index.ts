enum TOKEN_TYPE {
  WORD = "word",
  NUMBER = "number",
}

type TTokenTypes = `${TOKEN_TYPE}`;

enum KEYWORD {
  PAPER = "Paper",
  PEN = "Pen",
  LINE = "Line",
}

type TKeywords = `${KEYWORD}`;

enum SYNTAX_TYPE {
  NumberLiteral = "NumberLiteral",
  CallExpression = "CallExpression",
}

type TSyntaxTypes = `${SYNTAX_TYPE}`;

type TToken = {
  type: TTokenTypes;
  value: string;
};

type TExpression = {
  type: TSyntaxTypes;
  name: TKeywords;
  arguments: TArgument[];
};

type TArgument = {
  type: SYNTAX_TYPE;
  value: number;
};

type TAbstractSyntaxTree = {
  type: string;
  body: TExpression[];
};

type TSVGAbstractSyntaxTree = {
  tag: string;
  attr: {
    [key: string]: string | number;
  };
  body?: TSVGAbstractSyntaxTree[];
};

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

      if (currentToken?.type === TOKEN_TYPE.WORD) {
        switch (currentToken.value) {
          case KEYWORD.PAPER:
            const argument = tokens.shift();
            const expression: TExpression = {
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
            break;

          default:
            break;
        }
      }
    }

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

      switch (node.name) {
        case KEYWORD.PAPER:
          const paper_color = 100 - node.arguments[0].value;
          const data = {
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

          svg_ast.body.push();
          break;
        case "Pen":
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          pen_color = 100 - node.arguments[0].value;
          break;
        case "Line":
        // ...
      }
    }

    return svg_ast;
  }

  private generator(svg_ast: TSVGAbstractSyntaxTree) {
    function createAttrString(attr: object) {
      return Object.keys(attr)
        .map((key) => `${key}="${attr[key]}"`)
        .join(" ");
    }

    const svg_attr = createAttrString(svg_ast.attr);

    // para cada elemento no corpo do svg_ast, gera uma svg tag
    var elements = svg_ast.body
      .map(function (node) {
        return (
          "<" +
          node.tag +
          " " +
          createAttrString(node.attr) +
          "></" +
          node.tag +
          ">"
        );
      })
      .join("\n\t"); // faz o empacotamento dos elementos com as tags de abrir e fechar o svg para completar o código SVG

    return "<svg " + svg_attr + ">\n" + elements + "\n</svg>";
  }

  compile(code: string) {
    return this.transformer(this.parser(this.lexer(code)));
  }
}
