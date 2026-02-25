interface DotInputEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
}

export default function DotInputEditor({ value, onChange, onLoadExample }: DotInputEditorProps) {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-800 rounded shadow-lg p-2 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">DOT Input</h2>
        <button
          onClick={onLoadExample}
          className="px-2 py-1 bg-blue-600 dark:bg-blue-700 text-white text-xs rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Load Example
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-2 font-mono text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
        placeholder="Enter DOT graph syntax here...

Example:
digraph G {
  A -> B;
  A -> C;
  B -> D;
  C -> D;
}"
        spellCheck={false}
      />

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Click on a node to highlight the path to the root.
        </p>
      </div>
    </div>
  );
}
