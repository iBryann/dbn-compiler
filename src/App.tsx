import { Compiler } from "./compiler";

export function App() {
  const compiler = new Compiler();
  const code = "Paper 0 Pen 100 Line 0 50 100 50";
  const result = compiler.compile(code);

  console.log(result);

  return <main>Aoba</main>;
}
