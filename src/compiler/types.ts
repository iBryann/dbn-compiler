export enum TOKEN_TYPE {
  KEYWORD = "keyword",
  ARGUMENT = "argument",
}

type TTokenTypes = `${TOKEN_TYPE}`;

export enum KEYWORD {
  PAPER = "Paper",
  PEN = "Pen",
  LINE = "Line",
}

export type TKeywords = `${KEYWORD}`;

export enum SYNTAX_TYPE {
  NumberLiteral = "NumberLiteral",
  CallExpression = "CallExpression",
}

type TSyntaxTypes = `${SYNTAX_TYPE}`;

export type TToken = {
  type: TTokenTypes;
  value: string;
};

export type TExpression = {
  type: TSyntaxTypes;
  name: TKeywords;
  arguments: TArgument[];
};

type TArgument = {
  type: SYNTAX_TYPE;
  value: string;
};

export type TAbstractSyntaxTree = {
  type: string;
  body: TExpression[];
};

export type TSVGAbstractSyntaxTree = {
  tag: string;
  attr: object;
  body: TSVGAbstractSyntaxTree[];
};
