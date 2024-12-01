import { useEffect, useState } from "react";
import { Compiler } from "./compiler";

export function App() {
  const [code, setCode] = useState(`Paper 100\rPen 0\rLine 10 45 80 10`);
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
