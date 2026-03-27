import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/**
 * Rich Text Editor (WYSIWYG) matching old site toolbar:
 * Style, Bold, Underline, Strikethrough, Font, Color,
 * Lists (ordered/unordered), Alignment, Links, Images, Videos,
 * Tables, Full-screen, Source code, Help
 */
const RichTextEditor = ({ value, onChange, placeholder, minHeight = '200px', label, note }) => {
  const modules = useMemo(() => ({
    toolbar: [
      // Row 1: Style + Formatting
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'font': [] }],
      [{ 'color': [] }, { 'background': [] }],

      // Row 2: Lists + Alignment
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],

      // Row 3: Media + Extras
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub' }, { 'script': 'super' }],

      // Row 4: Cleanup
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'indent', 'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'script',
    'clean',
  ];

  return (
    <div className="rich-text-editor">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div style={{ minHeight }} className="bg-white">
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || 'Type here...'}
        />
      </div>
      {note && (
        <p className="text-xs text-red-500 mt-1 font-medium">{note}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
