import { Editor as MonacoEditor } from "@monaco-editor/react";

interface EditorProps {
  icon: string;
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

const Editor = ({ icon, language, value, onChange }: EditorProps) => {
  return (
    <div className="h-[calc(100%-30px)]">
      <div>
        <img src={icon} height={25} width={25} alt={language} />
      </div>
      <MonacoEditor
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default Editor;
