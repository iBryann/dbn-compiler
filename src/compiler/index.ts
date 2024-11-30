// ? {type: 'word', value: t}
// : {type: 'number', value: t}

export class Compiler {
  private lexer(code: string) {
    return code;
  }

  compile(code: string) {
    return this.lexer(code);
  }
}
