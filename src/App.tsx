import { useEffect, useState } from "react";
import { Compiler } from "./compiler";

export function App() {
  const [code, setCode] = useState(
    `Paper black 300 200\rPen white\rLine 0 20 150 20\rLine 0 95 300 10\rLine 10 150 150 1`
  );
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
