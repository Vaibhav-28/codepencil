import "./App.css";
import { useState, useCallback, useEffect } from "react";
import Editor from "./components/Editor";
import HtmlSvg from "./assets/html.svg";
import CssSvg from "./assets/css.svg";
import JsSvg from "./assets/js.svg";
import useLocalStorage from "./hooks/useLocalStorage";

interface ActiveDivider {
  type: string;
  index: number;
}

function App() {
  const [verticalDivider, setVerticalDivider] = useLocalStorage(
    "veticalDivider",
    50
  );
  const [horizontalDividers, setHorizontalDividers] = useLocalStorage(
    "horizontalDividers",
    [33, 66]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activeDivider, setActiveDivider] = useState<ActiveDivider | null>(
    null
  );
  const [html, setHtml] = useLocalStorage("html", "");
  const [css, setCss] = useLocalStorage("css", "");
  const [js, setJs] = useLocalStorage("js", "");

  const handleHtmlChange = (value: string | undefined) => setHtml(value || "");
  const handleCssChange = (value: string | undefined) => setCss(value || "");
  const handleJsChange = (value: string | undefined) => setJs(value || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        console.log("here");
        localStorage.setItem("verticalDivider", verticalDivider.toString());
        localStorage.setItem(
          "horizontalDividers",
          JSON.stringify(horizontalDividers)
        );
      } catch (error) {
        console.error("Failed to save layout to localStorage:", error);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [verticalDivider, horizontalDividers]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveDivider(null);

    // Remove the mouse up event listener
    window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseDown = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      type: string,
      index = 0
    ) => {
      event.preventDefault();
      setIsDragging(true);
      setActiveDivider({ type, index });

      // Add the mouse up event listener
      window.addEventListener("mouseup", handleMouseUp);
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isDragging || !activeDivider) return;

      const container = event.currentTarget.getBoundingClientRect();
      if (activeDivider.type === "vertical") {
        const mouseY = event.clientY - container.top;
        console.log(mouseY);
        const percentage = (mouseY / container.height) * 100;
        setVerticalDivider(Math.min(Math.max(percentage, 10), 90));
      } else {
        const mouseX = event.clientX - container.left;
        const percentage = (mouseX / container.width) * 100;

        setHorizontalDividers((prev: number[]) => {
          const newDividers = [...prev];
          if (activeDivider.index === 0) {
            newDividers[0] = Math.min(
              Math.max(percentage, 10),
              newDividers[1] - 10
            );
          } else {
            newDividers[1] = Math.min(
              Math.max(percentage, newDividers[0] + 10),
              90
            );
          }
          return newDividers;
        });
      }
    },
    [isDragging, activeDivider]
  );

  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
      <html>
        <body>${html}</body>
        <style>${css}</style>
        <script>${js}</script>
      </html>
      `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div
      className="w-full h-screen bg-gray-100 relative select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute top-0 left-0 right-0 bg-white"
        style={{ height: `${verticalDivider}%` }}
      >
        <div
          className="absolute top-0 bottom-0 left-0 bg-blue-50"
          style={{ width: `${horizontalDividers[0]}%` }}
        >
          <Editor
            language="html"
            icon={HtmlSvg}
            value={html}
            onChange={handleHtmlChange}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 bg-black cursor-col-resize"
          style={{
            left: `${horizontalDividers[0]}%`,
            width: "16px",
            transform: "translateX(-8px)",
          }}
          onMouseDown={(e) => handleMouseDown(e, "horizontal", 0)}
        />

        <div
          className="absolute top-0 bottom-0 bg-blue-100"
          style={{
            left: `${horizontalDividers[0]}%`,
            width: `${horizontalDividers[1] - horizontalDividers[0]}%`,
          }}
        >
          <Editor
            language="css"
            icon={CssSvg}
            value={css}
            onChange={handleCssChange}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 bg-black cursor-col-resize"
          style={{
            left: `${horizontalDividers[1]}%`,
            width: "16px",
            transform: "translateX(-8px)",
          }}
          onMouseDown={(e) => handleMouseDown(e, "horizontal", 1)}
        />

        <div
          className="absolute top-0 bottom-0 right-0 bg-blue-50"
          style={{ width: `${100 - horizontalDividers[1]}%` }}
        >
          <Editor
            language="javascript"
            icon={JsSvg}
            value={js}
            onChange={handleJsChange}
          />
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bg-black cursor-row-resize"
        style={{
          top: `${verticalDivider}%`,
          height: "16px",
          transform: "translateY(-8px)",
        }}
        onMouseDown={(e) => handleMouseDown(e, "vertical")}
      />

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: `${100 - verticalDivider}%` }}
      >
        {!isDragging && (
          <iframe
            className="w-full h-full"
            style={{ border: 0 }}
            srcDoc={srcDoc}
            title="output"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
}

export default App;
