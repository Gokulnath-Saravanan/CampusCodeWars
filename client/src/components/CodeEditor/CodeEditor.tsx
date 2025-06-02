import { Editor } from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorProps {
  initialValue?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = '',
  language = 'javascript',
  onChange,
  readOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorDidMount = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-[400px] w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      )}
      <Editor
        height="400px"
        defaultLanguage={language}
        defaultValue={initialValue}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
        onMount={handleEditorDidMount}
        className="monaco-editor"
      />
    </div>
  );
};

export default CodeEditor;
