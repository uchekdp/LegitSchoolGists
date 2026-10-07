import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Pilcrow, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Sigma, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Undo, 
  Redo, 
  RemoveFormatting, 
  Palette, 
  Highlighter, 
  Eye, 
  Upload, 
  X, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  Indent,
  Outdent
} from 'lucide-react';
import { renderLatexToHtml, processArticleEquations } from '../../utils/latexHelper';
import { uploadImageFile } from '../../services/dataService';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  articleTitle?: string;
  featuredImage?: string;
  authorName?: string;
  categoryName?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write or paste the educational story, admission guidelines, cut-off tables, or examination circular here naturally...',
  articleTitle = 'Article Title',
  featuredImage,
  authorName = 'LegitSchoolGists Editorial',
  categoryName = 'Education News',
}) => {
  // Modal states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right' | 'full'>('center');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [showEquationModal, setShowEquationModal] = useState(false);
  const [latexCode, setLatexCode] = useState('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
  const [equationPreviewHtml, setEquationPreviewHtml] = useState('');

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-sky-600 underline font-medium hover:text-sky-800',
        },
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4 shadow-sm border border-slate-200',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse border border-slate-300 my-4 text-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-slate-100 font-bold p-2.5 border border-slate-300 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-2.5 border border-slate-300',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose-editorial font-sans text-slate-800 text-base leading-relaxed focus:outline-none min-h-[380px] p-5 sm:p-6 bg-white',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Sync content when initial article content loads or changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set if different to avoid cursor jumps
      if (editor.getText() === '' && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  // Live KaTeX preview effect for equation modal
  useEffect(() => {
    if (latexCode) {
      const rendered = renderLatexToHtml(latexCode, true);
      setEquationPreviewHtml(rendered);
    } else {
      setEquationPreviewHtml('');
    }
  }, [latexCode]);

  if (!editor) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Link Actions ---
  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkTitle('');
    setShowLinkModal(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^tel:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: formattedUrl,
          target: linkOpenNewTab ? '_blank' : '_self',
          title: linkTitle.trim() || undefined,
        })
        .run();
    }
    setShowLinkModal(false);
  };

  // --- Image Actions ---
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setImageUploading(true);
    setImageError(null);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        if (!imageAlt) {
          setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      } else {
        setImageError(res.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setImageError(err?.message || 'Upload error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleApplyImage = () => {
    if (!imageUrl.trim()) return;

    let figureClass = 'my-6';
    let imgClass = 'w-full rounded-2xl shadow-sm border border-slate-200';

    if (imageAlign === 'left') {
      figureClass = 'float-none sm:float-left sm:mr-6 mb-4 max-w-sm';
      imgClass = 'w-full rounded-xl shadow-sm border border-slate-200';
    } else if (imageAlign === 'right') {
      figureClass = 'float-none sm:float-right sm:ml-6 mb-4 max-w-sm';
      imgClass = 'w-full rounded-xl shadow-sm border border-slate-200';
    } else if (imageAlign === 'center') {
      figureClass = 'my-6 max-w-2xl mx-auto';
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-xs text-slate-500 text-center mt-2 italic font-sans">${imageCaption.trim()}</figcaption>`
      : '';

    const figureHtml = `<figure class="${figureClass}"><img src="${imageUrl.trim()}" alt="${imageAlt.trim() || 'Educational circular image'}" class="${imgClass}" />${captionHtml}</figure><p></p>`;

    editor.chain().focus().insertContent(figureHtml).run();

    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setImageError(null);
  };

  // --- Equation Actions ---
  const handleApplyEquation = () => {
    if (!latexCode.trim()) return;
    const rendered = renderLatexToHtml(latexCode.trim(), true);
    const encodedLatex = encodeURIComponent(latexCode.trim());
    const equationHtml = `<div class="equation-block my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center overflow-x-auto" data-latex="${encodedLatex}">${rendered}</div><p></p>`;
    
    editor.chain().focus().insertContent(equationHtml).run();
    setShowEquationModal(false);
  };

  // Pre-made education math equation templates
  const mathTemplates = [
    { label: 'Quadratic Formula', code: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { label: 'Einstein Energy', code: 'E = mc^2' },
    { label: 'Pythagorean Theorem', code: 'a^2 + b^2 = c^2' },
    { label: 'Fraction Ratio', code: '\\frac{a}{b} = \\frac{c}{d}' },
    { label: 'Integral Calculus', code: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)' },
    { label: 'Summation Series', code: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}' },
    { label: 'Chemical Reaction', code: '\\text{2H}_2 + \\text{O}_2 \\rightarrow \\text{2H}_2\\text{O}' },
  ];

  const colors = [
    { name: 'Default Dark', value: '#0f172a' },
    { name: 'Primary Sky', value: '#0284c7' },
    { name: 'Navy Blue', value: '#1e3a8a' },
    { name: 'Emerald Green', value: '#059669' },
    { name: 'Amber Gold', value: '#d97706' },
    { name: 'Rose Red', value: '#e11d48' },
    { name: 'Purple', value: '#7c3aed' },
  ];

  const highlights = [
    { name: 'None', value: 'transparent' },
    { name: 'Yellow Highlight', value: '#fef08a' },
    { name: 'Sky Highlight', value: '#bae6fd' },
    { name: 'Green Highlight', value: '#bbf7d0' },
    { name: 'Orange Highlight', value: '#fed7aa' },
    { name: 'Pink Highlight', value: '#fbcfe8' },
  ];

  return (
    <div className={`flex flex-col bg-white border border-slate-300 rounded-2xl shadow-xs transition-all ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''}`}>
      {/* 1. Main WYSIWYG Formatting Toolbar */}
      <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 rounded-t-2xl p-2.5 flex flex-wrap items-center gap-1 sm:gap-1.5 shadow-xs">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-35 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-35 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Heading & Paragraph Dropdown / Selector */}
        <div className="pr-1 border-r border-slate-300">
          <select
            value={
              editor.isActive('heading', { level: 1 })
                ? 'h1'
                : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                ? 'h3'
                : editor.isActive('heading', { level: 4 })
                ? 'h4'
                : 'p'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') editor.chain().focus().setParagraph().run();
              else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
              else if (val === 'h4') editor.chain().focus().toggleHeading({ level: 4 }).run();
            }}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="p">Normal Paragraph</option>
            <option value="h1">Heading 1 (Main Title)</option>
            <option value="h2">Heading 2 (Section)</option>
            <option value="h3">Heading 3 (Subsection)</option>
            <option value="h4">Heading 4 (Minor Header)</option>
          </select>
        </div>

        {/* Text Marks: Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
              editor.isActive('bold') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer italic ${
              editor.isActive('italic') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('underline') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('strike') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment: Left, Center, Right, Justify */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Justify Text"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists: Numbered & Bulleted */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('orderedList') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bulletList') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Decrease Indent (Outdent)"
          >
            <Outdent className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Increase Indent"
          >
            <Indent className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('blockquote') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Blockquote (Quote Callout)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('codeBlock') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Elements: Link, Image, LaTeX Equation, Table */}
        <div className="flex items-center gap-1 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              editor.isActive('link') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Insert or Edit Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            title="Insert Image (Upload or URL)"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-800 hidden md:inline">Image</span>
          </button>

          {/* Mathematical Equation Button */}
          <button
            type="button"
            onClick={() => setShowEquationModal(true)}
            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-900 bg-amber-50 border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
            title="Insert Mathematical Formula / LaTeX Equation"
          >
            <Sigma className="w-4 h-4 text-amber-700" />
            <span className="text-[11px] font-bold text-amber-900 hidden sm:inline">Equation</span>
          </button>

          {/* Table Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                editor.isActive('table') ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Table tools"
            >
              <TableIcon className="w-4 h-4" />
            </button>

            {showTableMenu && (
              <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2 min-w-[190px] space-y-1 text-xs">
                {!editor.isActive('table') ? (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 text-slate-800 rounded-lg font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                    <span>Insert 3x3 Table</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 text-slate-800 rounded-lg font-medium"
                    >
                      + Add Row Below
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 text-slate-800 rounded-lg font-medium"
                    >
                      + Add Column Right
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-700 rounded-lg font-medium"
                    >
                      Delete Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-700 rounded-lg font-medium"
                    >
                      Delete Column
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-rose-100 text-rose-800 rounded-lg font-bold border-t border-slate-100"
                    >
                      Delete Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Formatting Utilities: Colors & Clear Formatting */}
        <div className="flex items-center gap-1">
          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Text Color"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-1 right-0 sm:left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 min-w-[160px] grid grid-cols-4 gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(c.value).run();
                      setShowColorPicker(false);
                    }}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Text Highlight"
            >
              <Highlighter className="w-4 h-4 text-amber-500" />
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full mt-1 right-0 sm:left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 min-w-[160px] grid grid-cols-3 gap-1.5">
                {highlights.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => {
                      if (h.value === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().setHighlight({ color: h.value }).run();
                      }
                      setShowHighlightPicker(false);
                    }}
                    className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: h.value }}
                    title={h.name}
                  >
                    {h.value === 'transparent' ? '✕' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Remove Formatting from Selection"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action: Live Preview Modal & Fullscreen */}
        <div className="ml-auto flex items-center gap-1 pl-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Live Blog Preview"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Writing Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. WYSIWYG Document Editor Body */}
      <div className={`overflow-y-auto bg-white ${isFullscreen ? 'grow p-4 sm:p-8 max-w-4xl mx-auto w-full' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {/* 3. Editor Footer Stats Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 rounded-b-2xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>{editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} words</span>
          <span>•</span>
          <span>{editor.getText().length} characters</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Clean Semantic HTML Output
        </div>
      </div>

      {/* --- MODAL: Insert / Edit Hyperlink --- */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-sky-600" />
                <span>Insert Hyperlink</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://jamb.gov.ng or /category/admission"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Link Title (Hover Tooltip)
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Official JAMB e-Facility Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="link-new-tab"
                  checked={linkOpenNewTab}
                  onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="link-new-tab" className="text-xs text-slate-700 font-medium">
                  Open link in a new browser tab (target="_blank")
                </label>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setShowLinkModal(false);
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Remove Link
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Insert Image (Upload, URL, Alt Text, Caption, Alignment) --- */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Insert Article Illustration or Circular</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload vs URL Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  imageTab === 'upload' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload from Phone / Laptop
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  imageTab === 'url' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Image URL
              </button>
            </div>

            {imageError && (
              <div className="p-3 rounded-xl mb-4 text-xs bg-rose-50 text-rose-800 border border-rose-200">
                {imageError}
              </div>
            )}

            <div className="space-y-4">
              {imageTab === 'upload' ? (
                <div>
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl p-5 text-center cursor-pointer bg-sky-50/40 hover:bg-sky-50 transition-colors"
                  >
                    {imageUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-sky-900">Uploading photo...</span>
                      </div>
                    ) : imageUrl ? (
                      <div className="space-y-2">
                        <img src={imageUrl} alt="Uploaded preview" className="max-h-36 mx-auto rounded-lg shadow-xs" />
                        <span className="text-xs text-emerald-700 font-bold block">✓ Image ready to insert! Click to change.</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-8 h-8 text-sky-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-800 block">Tap to browse or drop image file</span>
                        <span className="text-[11px] text-slate-500 block">PNG, JPG, WEBP • Max 10MB</span>
                      </div>
                    )}
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Image Direct URL *
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              {/* Alt Text (SEO Crucial) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Image Alt Text (Crucial for SEO & Google Images) *</span>
                  <span className="text-[10px] text-emerald-600 font-bold">SEO Recommended</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. UNILAG Senate Building and Post-UTME circular banner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Optional Caption / Photo Credit
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Official circular released by the Registrar's Office"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Image Layout / Alignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image Alignment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'center', label: 'Centered' },
                    { id: 'left', label: 'Float Left' },
                    { id: 'right', label: 'Float Right' },
                    { id: 'full', label: 'Full Width' },
                  ].map((align) => (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() => setImageAlign(align.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                        imageAlign === align.id
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!imageUrl.trim() || imageUploading}
                  onClick={handleApplyImage}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Insert Into Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: LaTeX Math Equation Editor with KaTeX Live Rendering --- */}
      {showEquationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sigma className="w-5 h-5 text-amber-600" />
                <span>Insert Mathematical Equation (KaTeX / LaTeX)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEquationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LaTeX Syntax Equation Input
                </label>
                <textarea
                  rows={3}
                  value={latexCode}
                  onChange={(e) => setLatexCode(e.target.value)}
                  placeholder="e.g. \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} or E = mc^2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              {/* Quick Math Templates */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Pre-configured Equation Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mathTemplates.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setLatexCode(tpl.code)}
                      className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Rendered Visual Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Live Visual Equation Rendering:
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[70px] flex items-center justify-center overflow-x-auto">
                  {equationPreviewHtml ? (
                    <div
                      className="text-lg text-slate-900"
                      dangerouslySetInnerHTML={{ __html: equationPreviewHtml }}
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Enter LaTeX code above to preview</span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEquationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!latexCode.trim()}
                  onClick={handleApplyEquation}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Insert Equation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Live Article Preview --- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Live Public Preview
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Exact rendering as seen by students and applicants
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <span className="bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                  {categoryName}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {articleTitle || 'Untitled Circular Headline'}
                </h1>
                <div className="text-xs sm:text-sm text-slate-500">
                  By {authorName} • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {featuredImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96">
                  <img src={featuredImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}

              <div
                className="prose-editorial text-slate-800 max-w-none text-base sm:text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processArticleEquations(editor.getHTML()) }}
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview & Return to Writing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
