import React, { useEffect, useRef, useState } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  uploadFile?: (file: File) => Promise<string | undefined>;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, uploadFile, placeholder }: RichEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, valueArg?: string) => {
    try {
      document.execCommand(command, false, valueArg as any);
    } catch (e) {
      // execCommand may be deprecated in some browsers but works for now
    }
    onChange(ref.current?.innerHTML ?? '');
    ref.current?.focus();
  };

  const onInput = () => onChange(ref.current?.innerHTML ?? '');

  const handleInsertImage = async (file?: File) => {
    if (file && uploadFile) {
      const url = await uploadFile(file);
      if (url) exec('insertImage', url);
      return;
    }
    if (file && !uploadFile) {
      const url = URL.createObjectURL(file);
      exec('insertImage', url);
      return;
    }
    const url = window.prompt('URL da imagem');
    if (url) exec('insertImage', url);
  };

  return (
    <div className="rich-editor">
      <div className="mb-2 flex flex-wrap gap-2 items-center">
        <button aria-label="Título H1" title="Título H1" type="button" onClick={() => exec('formatBlock', 'H1')} className="px-3 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 shadow-sm">H1</button>
        <button aria-label="Título H2" title="Título H2" type="button" onClick={() => exec('formatBlock', 'H2')} className="px-3 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 shadow-sm">H2</button>
        <button aria-label="Negrito (Ctrl+B)" title="Negrito (Ctrl+B)" type="button" onClick={() => exec('bold')} className="px-2 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 font-bold">B</button>
        <button aria-label="Itálico (Ctrl+I)" title="Itálico (Ctrl+I)" type="button" onClick={() => exec('italic')} className="px-2 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 italic">I</button>
        <button aria-label="Sublinhado" title="Sublinhado" type="button" onClick={() => exec('underline')} className="px-2 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700">U</button>
        <button aria-label="Remover formatação" title="Remover formatação" type="button" onClick={() => exec('removeFormat')} className="px-2 py-1 rounded-md bg-white text-black border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700">Clear</button>
        <button aria-label="Adicionar imagem" title="Adicionar imagem" type="button" onClick={() => fileRef.current?.click()} className="ml-2 px-3 py-1 rounded-md bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 dark:bg-blue-500 dark:border-blue-600">Inserir imagem</button>
        <div className="ml-auto text-xs text-muted-foreground">Dicas: Ctrl+B = Negrito, Ctrl+I = Itálico</div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (f) await handleInsertImage(f);
        (e.target as HTMLInputElement).value = '';
      }} />

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onBlur={() => { setFocused(false); onChange(ref.current?.innerHTML ?? ''); }}
        onFocus={() => setFocused(true)}
        className={`min-h-[360px] lg:min-h-[520px] p-4 rounded-md border ${focused ? 'border-primary' : 'border-gray-200'} bg-white dark:bg-gray-800 text-black dark:text-white text-base leading-relaxed`} 
        data-placeholder={placeholder}
        style={{ outline: 'none' }}
      />

      <style>{`
        .rich-editor [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
