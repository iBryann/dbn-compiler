import { useEffect, useState } from "react";
import { Compiler } from "./compiler";

const CODE = `Paper black 300 200
Pen white
Rect 0 95 300 10
Circle 100 100 40 red 4 transparent`;

export function App() {
  const [code, setCode] = useState(CODE);
  const [svg, setSvg] = useState("");
  const compiler = new Compiler();

  useEffect(() => {
    setSvg(compiler.compile(code));
  }, [code]);

  return (
    <main>
      <textarea
        rows={6}
        cols={50}
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />

      <div dangerouslySetInnerHTML={{ __html: svg }}></div>
      {svg}
    </main>
  );
}
