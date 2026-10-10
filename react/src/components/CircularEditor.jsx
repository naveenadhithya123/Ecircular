import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useEditor, EditorContent, Extension, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import * as fabric from 'fabric';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough as StrikeIcon, 
  Subscript as SubIcon, Superscript as SuperIcon, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Image as ImageIcon, 
  Type, Square, Circle, Triangle, Minus, PenTool, MousePointer2, 
  Trash2, Table as TableIcon, Save, Highlighter, Palette, 
  PaintBucket, Columns, Rows, Combine, Split, LayoutTemplate,
  Scissors, Copy, ClipboardPaste, RemoveFormatting, ZoomIn, ZoomOut, Maximize,
  Check, FileText, Globe, Link2, Quote, Code, Minus as HrIcon, Undo, Redo, Heading1, Heading2, Heading3, Eraser
} from 'lucide-react';
import { templates, buildTemplateHtml } from '../lib/templates';
import { saveCircular, getCircularById, submitWorkflowAction, getCircularComments } from '../lib/db';

const DivNode = Node.create({
// ... (omitting early nodes for brevity, wait, I can't omit in replace_file_content! I need to match precisely)
  name: 'div',
  group: 'block',
  content: 'block*',
  parseHTML() { return [{ tag: 'div' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes), 0]; },
  addAttributes() { return { class: { default: null }, style: { default: null } }; }
});

const SpanNode = Node.create({
  name: 'span',
  group: 'inline',
  inline: true,
  content: 'inline*',
  parseHTML() { return [{ tag: 'span' }]; },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; },
  addAttributes() { return { class: { default: null }, style: { default: null } }; }
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          return attributes.backgroundColor ? {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor};`,
          } : {};
        },
      },
      width: {
        default: null,
        parseHTML: element => element.style.width,
        renderHTML: attributes => attributes.width ? { style: `width: ${attributes.width};` } : {},
      },
      height: {
        default: null,
        parseHTML: element => element.style.height,
        renderHTML: attributes => attributes.height ? { style: `height: ${attributes.height};` } : {},
      },
    };
  },
});

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize || null,
          renderHTML: attributes => {
            if (!attributes.fontSize) return {};
            return { style: `font-size: ${attributes.fontSize}` };
          }
        }
      }
    }];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run()
    }
  }
});

// Resizable Image Node Component for full scaling control
const ResizableImageNode = (props) => {
  const { node, updateAttributes, selected } = props;
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = imgRef.current.offsetWidth;
    const startHeight = imgRef.current.offsetHeight;
    const ratio = startHeight / startWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      updateAttributes({ width: newWidth, height: newWidth * ratio });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper className="inline-block relative max-w-full">
      <img 
        ref={imgRef}
        src={node.attrs.src} 
        alt={node.attrs.alt} 
        style={{ 
          width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
          height: node.attrs.height ? `${node.attrs.height}px` : 'auto',
          outline: selected ? '2px solid #007bff' : 'none',
          cursor: selected ? 'pointer' : 'default',
          display: 'block',
          maxWidth: '100%'
        }} 
      />
      {selected && (
        <div 
          onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-4 h-4 bg-[#007bff] border-2 border-white rounded-full cursor-se-resize shadow transform translate-x-1/2 translate-y-1/2"
        />
      )}
    </NodeViewWrapper>
  );
};

const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      class: { default: null }
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

export default function CircularEditor({ isViewOnly = false, isReview = false, editorRole = 'staff' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Home');
  const [mode, setMode] = useState('text'); 
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  
  // Layout & View State
  const [margins, setMargins] = useState('p-12');
  const [orientation, setOrientation] = useState('portrait');
  const [pageColor, setPageColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState('print');
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [tableDrawMode, setTableDrawMode] = useState(null); // 'pencil', 'eraser', null
  const [cellWidth, setCellWidth] = useState('');
  const [cellHeight, setCellHeight] = useState('');
  
  // Popups mapped outside overflow containers
  const [tablePopupPos, setTablePopupPos] = useState(null);
  const [tableGridHover, setTableGridHover] = useState({ r: 0, c: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  
  // Workflow States
  const [circularStatus, setCircularStatus] = useState('draft');
  const [commentsHistory, setCommentsHistory] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  
  const containerRef = useRef(null);
  const fabricRef = useRef(null);
  const canvasRef = useRef(null); // Reference strictly to the canvas tag inside dangerouslySetInnerHTML
  
  const editor = useEditor({
    extensions: [
      StarterKit, DivNode, SpanNode, 
      Table.configure({ resizable: true }),
      TableRow, TableHeader, CustomTableCell, 
      TextStyle, Color, FontFamily, FontSize, Underline, Subscript, Superscript, 
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      ResizableImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph', 'tableCell'], defaultAlignment: 'left' })
    ],
    content: buildTemplateHtml(templates.find(t => t.id === 'blank')),
    editable: !isViewOnly,
    editorProps: {
      attributes: {
        spellcheck: spellCheckEnabled.toString()
      }
    }
  });

  useEffect(() => {
    async function loadData() {
      if (id && id !== 'view' && editor) {
        try {
          const doc = await getCircularById(id);
          if (doc) {
            setCircularStatus(doc.status);
            if (doc.body_html) editor.commands.setContent(doc.body_html);
            
            const comments = await getCircularComments(id);
            setCommentsHistory(comments);

            if (doc.overlay_json && fabricRef.current) {
              try {
                await fabricRef.current.loadFromJSON(doc.overlay_json);
                if (doc.overlay_json && doc.overlay_json.objects) {
                  const objects = fabricRef.current.getObjects();
                  // First, try exact index mapping from JSON
                  doc.overlay_json.objects.forEach((jsonObj, index) => {
                    if (jsonObj.isSignature && objects[index]) {
                      objects[index].set({
                        isSignature: jsonObj.isSignature,
                        signatureRole: jsonObj.signatureRole
                      });
                    }
                  });
                  
                  // Retroactive fix for broken old documents: ANY image without a role gets assigned one based on X position
                  objects.forEach(obj => {
                    if (obj.type === 'image' && !obj.signatureRole) {
                      obj.set({
                        isSignature: true,
                        signatureRole: (obj.left < 400) ? 'hod' : 'principal'
                      });
                    }
                  });

                  // Clean up duplicates (if user accidentally inserted multiple before the fix)
                  const seenRoles = new Set();
                  const objectsAfterFix = fabricRef.current.getObjects();
                  objectsAfterFix.forEach(obj => {
                    if (obj.isSignature) {
                      if (seenRoles.has(obj.signatureRole)) {
                        fabricRef.current.remove(obj);
                      } else {
                        seenRoles.add(obj.signatureRole);
                      }
                    }
                  });

                  // Now enforce visibility rules
                  fabricRef.current.getObjects().forEach(obj => {
                    if (obj.isSignature) {
                      const sigRole = obj.signatureRole;
                      let isVisible = true;
                      if (doc.status !== 'approved') {
                        if (editorRole === 'staff') isVisible = false;
                        else if (editorRole === 'hod') isVisible = (sigRole === 'hod');
                        else if (editorRole === 'principal') isVisible = true;
                      }
                      obj.set('visible', isVisible);
                    }
                  });
                }
                fabricRef.current.renderAll();
              } catch (err) {
                console.error("Fabric load error:", err);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load document", e);
        }
      }
    }
    loadData();
  }, [id, editor]);

  // Safe Fabric Initialization using ID lookup to avoid React reconcile errors completely
  useEffect(() => {
    const canvasEl = document.getElementById('safe-fabric-canvas');
    if (!canvasEl || !containerRef.current) return;
    
    // Size it explicitly before init to fix drawing bugs
    canvasEl.width = containerRef.current.offsetWidth;
    canvasEl.height = containerRef.current.offsetHeight;
    
    const fabricCanvas = new fabric.Canvas('safe-fabric-canvas', {
      isDrawingMode: false,
    });
    fabricRef.current = fabricCanvas;

    const handleResize = () => {
      if (containerRef.current && fabricRef.current) {
        fabricRef.current.setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = (mode === 'pen');
      fabricRef.current.selection = (mode === 'draw' || mode === 'pen');
      fabricRef.current.forEachObject(obj => {
        obj.selectable = (mode === 'draw');
        obj.evented = (mode === 'draw');
      });
      if (mode === 'pen') {
        fabricRef.current.freeDrawingBrush.color = brushColor;
        fabricRef.current.freeDrawingBrush.width = parseInt(brushSize, 10);
      }
    }
  }, [mode, brushColor, brushSize]);

  useEffect(() => {
    if (editor && editor.isActive('table') && mode === 'text') {
      if (activeTab !== 'Table') setActiveTab('Table');
      
      const attrs = editor.getAttributes('tableCell');
      if (Object.keys(attrs).length === 0) {
        const thAttrs = editor.getAttributes('tableHeader');
        setCellWidth(thAttrs.width || '');
        setCellHeight(thAttrs.height || '');
      } else {
        setCellWidth(attrs.width || '');
        setCellHeight(attrs.height || '');
      }
    }
  }, [editor?.state?.selection]);

  const updateCellSize = (type, value) => {
    if (!editor) return;
    if (type === 'width') {
      editor.chain().focus().setCellAttribute('width', value).run();
      setCellWidth(value);
    } else {
      editor.chain().focus().setCellAttribute('height', value).run();
      setCellHeight(value);
    }
  };

  useEffect(() => {
    if (fabricRef.current && containerRef.current) {
      setTimeout(() => {
        if(fabricRef.current && containerRef.current) {
            fabricRef.current.setDimensions({
              width: containerRef.current.offsetWidth,
              height: containerRef.current.offsetHeight
            });
        }
      }, 350);
    }
  }, [orientation, margins, viewMode]);

  // Removed DOM-mutating row resizer to prevent ProseMirror RangeError crashes.
  useEffect(() => {
    if (editor) {
      editor.setOptions({ editorProps: { attributes: { spellcheck: spellCheckEnabled.toString() } } });
    }
  }, [spellCheckEnabled, editor]);

  const handleSaveSilently = async () => {
    if (!editor) return null;
    const html = editor.getHTML();
    const canvasJson = fabricRef.current ? fabricRef.current.toJSON(['isSignature', 'signatureRole']) : null;
    const doc = await saveCircular({
      id: (id && id !== 'view') ? id : undefined,
      title: 'Circular Document',
      body_html: html,
      overlay_json: canvasJson,
      status: circularStatus,
    });
    return doc.id;
  };

  const handleSave = async () => {
    try {
      await handleSaveSilently();
      alert('Document saved successfully!');
      navigate(`/${editorRole}/dashboard`);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert('Failed to save document. Error: ' + (err.message || JSON.stringify(err)));
    }
  };

  const insertSignature = async () => {
    if (!fabricRef.current) return;
    
    // Enforce single signature per role
    const objects = fabricRef.current.getObjects();
    const alreadySigned = objects.some(obj => obj.isSignature && obj.signatureRole === editorRole);
    if (alreadySigned) {
      alert("You have already placed your signature! If you need to move it, you can drag it. If you want to replace it, delete the current one first.");
      return;
    }
    
    const savedSignature = localStorage.getItem(`${editorRole}_signature`);
    const randomOffset = Math.floor(Math.random() * 50);
    
    if (savedSignature) {
      try {
        const img = await fabric.Image.fromURL(savedSignature);
        img.scaleToWidth(150);
        img.set({ 
          left: 200 + randomOffset, 
          top: 500 + randomOffset, 
          isSignature: true, 
          signatureRole: editorRole 
        });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        setMode('draw');
        setActiveTab('Draw');
      } catch (e) {
        console.error("Signature Error:", e);
        alert("Failed to load signature picture.");
      }
    } else {
      // Fallback if no signature is uploaded in Settings
      const sig = new fabric.IText(`[${editorRole.toUpperCase()} Signature]`, {
        left: 200 + randomOffset,
        top: 500 + randomOffset,
        fontFamily: 'cursive',
        fontSize: 28,
        fill: '#000080',
        isSignature: true,
        signatureRole: editorRole,
        fontWeight: 'bold',
        fontStyle: 'italic'
      });
      fabricRef.current.add(sig);
      fabricRef.current.setActiveObject(sig);
      setMode('draw');
      setActiveTab('Draw');
      
      alert("Note: You haven't uploaded a real signature in Settings yet. Using a text placeholder for now.");
    }
  };

  const handleWorkflowAction = async (action) => {
    try {
      // VALIDATION: Must insert signature before approving
      if (action === 'approve') {
        const objects = fabricRef.current?.getObjects() || [];
        const hasSignature = objects.some(obj => obj.isSignature && obj.signatureRole === editorRole);
        if (!hasSignature) {
          alert("Please insert and place your signature before approving!");
          return;
        }
      }

      // If rejecting, wipe out ONLY the current user's signature
      if (action === 'reject' && fabricRef.current) {
        const objects = fabricRef.current.getObjects();
        const mySignatures = objects.filter(obj => obj.isSignature && obj.signatureRole === editorRole);
        mySignatures.forEach(sig => fabricRef.current.remove(sig));
      }

      let activeId = id;
      if (!activeId || activeId === 'view') {
        activeId = await handleSaveSilently();
      } else {
        await handleSaveSilently();
      }
      
      const commentToSubmit = action === 'reject' ? rejectComment : '';
      await submitWorkflowAction(activeId, editorRole, action, commentToSubmit);
      
      if (action === 'send_hod') alert("Successfully sent to HOD for approval!");
      else if (action === 'approve') alert("Successfully approved and signed!");
      else if (action === 'reject') alert("Changes requested successfully.");
      
      setShowRejectModal(false);
      navigate(`/${editorRole}/dashboard`);
    } catch (err) {
      console.error("WORKFLOW ERROR:", err);
      alert('Failed to process workflow. Error: ' + (err.message || JSON.stringify(err)));
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch (e) {
      alert("Clipboard access denied. Press Ctrl+V to paste.");
    }
  };

  const addShape = (type) => {
    setMode('draw');
    setActiveTab('Draw');
    if (!fabricRef.current) return;
    let shape;
    if (type === 'rect') shape = new fabric.Rect({ left: 100, top: 100, fill: 'transparent', stroke: brushColor, strokeWidth: parseInt(brushSize, 10), width: 100, height: 100 });
    else if (type === 'circle') shape = new fabric.Circle({ left: 100, top: 100, fill: 'transparent', stroke: brushColor, strokeWidth: parseInt(brushSize, 10), radius: 50 });
    else if (type === 'line') shape = new fabric.Line([50, 100, 200, 100], { left: 100, top: 100, stroke: brushColor, strokeWidth: parseInt(brushSize, 10) });
    else if (type === 'triangle') shape = new fabric.Triangle({ left: 100, top: 100, fill: 'transparent', stroke: brushColor, strokeWidth: parseInt(brushSize, 10), width: 100, height: 100 });
    else if (type === 'text') shape = new fabric.IText('Double click to edit', { left: 100, top: 100, fontFamily: 'Arial', fontSize: 24, fill: brushColor });
    
    if (shape) {
      fabricRef.current.add(shape);
      fabricRef.current.setActiveObject(shape);
    }
  };

  const addImageToCanvas = (e) => {
    const file = e.target.files[0];
    if (!file || !fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const img = await fabric.Image.fromURL(event.target.result);
        img.scaleToWidth(200);
        img.set({ left: 100, top: 100 });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        setMode('draw');
        setActiveTab('Draw');
      } catch (err) {
        console.error("Failed to add image to canvas", err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const addImageToText = (e) => {
    const file = e.target.files[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      editor.chain().focus().setImage({ src: event.target.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const loadTemplate = (e) => {
    const val = e.target.value;
    const t = templates.find(temp => temp.id === val);
    if (t && editor) editor.commands.setContent(buildTemplateHtml(t));
  };

  const ToolBtn = ({ onClick, active, children, title }) => (
    <button onClick={onClick} title={title} className={`p-1.5 rounded flex items-center justify-center transition-colors ${active ? 'bg-gray-300 text-gray-900 shadow-inner' : 'bg-transparent hover:bg-gray-200 text-gray-700'}`}>
      {children}
    </button>
  );

  const tabs = ['File', 'Home', 'Insert', 'Layout', 'Review', 'View', 'Draw'];
  if (editor?.isActive('table')) tabs.push('Table');
  
  const latestRejection = commentsHistory
    ?.filter(c => c.status === 'reject' || c.status === 'rejected')
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  return (
    <div className="flex flex-col gap-4 max-w-[1300px] w-full mx-auto pb-10 overflow-x-hidden" onClick={() => { setTablePopupPos(null); setContextMenu(null); }}>
      
      {circularStatus.startsWith('rejected') && latestRejection && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Changes Requested by {latestRejection.approver_role ? latestRejection.approver_role.toUpperCase() : 'REVIEWER'}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>"{latestRejection.comments}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isViewOnly && (
        <div className="bg-[#f3f2f1] rounded-lg shadow-md flex flex-col sticky top-0 z-[100] border border-gray-300 font-sans w-full">
          
          <div className="bg-[#2b579a] text-white flex items-center justify-between px-4 py-2 rounded-t-lg">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/${editorRole}/dashboard`)}
                className="text-white hover:bg-white/20 px-3 py-1 text-sm font-medium rounded border border-white/30 transition-colors"
              >
                Cancel
              </button>
              <Save size={18} className="cursor-pointer hover:text-gray-200 ml-2" onClick={handleSave} title="Save Document" />
              <div className="flex gap-2 border-l border-white/20 pl-4">
                <Undo size={16} className="cursor-pointer hover:text-gray-200" onClick={() => editor.chain().focus().undo().run()} title="Undo" />
                <Redo size={16} className="cursor-pointer hover:text-gray-200" onClick={() => editor.chain().focus().redo().run()} title="Redo" />
              </div>
              <span className="text-sm font-medium ml-4">
                Status: <span className="uppercase text-yellow-300">{circularStatus.replace('_', ' ')}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* STAFF BUTTONS */}
              {editorRole === 'staff' && (circularStatus === 'draft' || circularStatus === 'rejected') && (
                <button onClick={() => handleWorkflowAction('send_hod')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                  Send to HOD
                </button>
              )}
              
              {/* HOD BUTTONS */}
              {editorRole === 'hod' && (circularStatus === 'pending_hod' || circularStatus === 'rejected') && (
                <>
                  <button onClick={() => setShowRejectModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    {circularStatus === 'rejected' ? 'Forward to Staff' : 'Reject to Staff'}
                  </button>
                  <button onClick={insertSignature} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    Insert Signature
                  </button>
                  <button onClick={() => handleWorkflowAction('approve')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    Sign & Send to Principal
                  </button>
                </>
              )}

              {/* PRINCIPAL BUTTONS */}
              {editorRole === 'principal' && circularStatus === 'pending_principal' && (
                <>
                  <button onClick={() => setShowRejectModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    Request Changes
                  </button>
                  <button onClick={insertSignature} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    Insert Signature
                  </button>
                  <button onClick={() => handleWorkflowAction('approve')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 text-xs font-bold rounded shadow">
                    Finalize & Approve
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-1 px-2 pt-1 border-b border-gray-300 bg-white text-sm overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => {
                  if (tab === 'Draw') setMode('draw');
                  else setMode('text');
                  setActiveTab(tab);
                }} 
                className={`px-4 py-1.5 rounded-t whitespace-nowrap ${activeTab === tab ? 'bg-[#f3f2f1] text-[#2b579a] border-t border-l border-r border-gray-300 font-medium shadow-sm z-10 -mb-[1px]' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-[#f3f2f1] p-2 flex items-center gap-x-4 min-h-[90px] border-b border-gray-300 overflow-x-auto hide-scrollbar w-full">
            
            {(activeTab === 'Home' || activeTab === 'File') && editor && (
              <>
                <div className="flex border-r pr-4 border-gray-300 items-center h-full">
                  <div className="flex flex-col gap-0.5 mr-2">
                    <button onClick={handlePaste} className="flex flex-col items-center hover:bg-gray-200 p-1 rounded"><ClipboardPaste size={20} className="text-[#2b579a]"/><span className="text-[9px]">Paste</span></button>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => document.execCommand('cut')} className="flex items-center gap-1 hover:bg-gray-200 p-0.5 rounded px-1"><Scissors size={12}/><span className="text-[10px]">Cut</span></button>
                    <button onClick={() => document.execCommand('copy')} className="flex items-center gap-1 hover:bg-gray-200 p-0.5 rounded px-1"><Copy size={12}/><span className="text-[10px]">Copy</span></button>
                  </div>
                </div>

                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1 mb-1">
                    <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} className="border border-gray-300 p-1 rounded text-sm bg-white cursor-pointer w-28 shadow-sm">
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                    <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()} className="border border-gray-300 p-1 rounded text-sm bg-white cursor-pointer w-14 shadow-sm">
                      <option value="">Size</option>
                      {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48].map(s => <option key={s} value={`${s}px`}>{s}</option>)}
                    </select>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting size={16} /></ToolBtn>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><StrikeIcon size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><SubIcon size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><SuperIcon size={16} /></ToolBtn>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <label className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded" title="Highlight Color">
                      <Highlighter size={16} className="text-gray-700" />
                      <input type="color" onInput={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} className="w-0 h-0 opacity-0 absolute" />
                    </label>
                    <label className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded" title="Font Color">
                      <Palette size={16} className="text-gray-700" />
                      <input type="color" onInput={(e) => editor.chain().focus().setColor(e.target.value).run()} className="w-0 h-0 opacity-0 absolute" />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Font</span>
                </div>

                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-0.5 mb-1">
                    <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={16} /></ToolBtn>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullets"><List size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbering"><ListOrdered size={16} /></ToolBtn>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={16} /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={16} /></ToolBtn>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Paragraph & Styles</span>
                </div>
              </>
            )}

            {activeTab === 'Insert' && editor && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <button onClick={() => editor.commands.insertContent('<hr style="page-break-after: always" />')} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded"><FileText size={20}/><span className="text-[9px]">Page Break</span></button>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded"><HrIcon size={20}/><span className="text-[9px]">Horiz Line</span></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Pages</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300 relative">
                  <div className="flex items-center h-full">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTablePopupPos({ x: rect.left, y: rect.bottom + 5 });
                      }} 
                      className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded gap-1 cursor-pointer"
                    >
                      <TableIcon size={24} className="text-[#2b579a]" />
                      <span className="text-[11px] text-gray-700">Table</span>
                    </button>
                    <label className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded gap-1 cursor-pointer">
                      <ImageIcon size={24} className="text-[#2b579a]" />
                      <span className="text-[11px] text-gray-700">Pictures</span>
                      <input type="file" accept="image/*" onChange={addImageToText} className="hidden" />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Tables & Media</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1 h-full pt-1">
                    <button onClick={addLink} className="flex flex-col items-center hover:bg-gray-200 p-1.5 rounded"><Link2 size={18}/><span className="text-[9px]">Link</span></button>
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="flex flex-col items-center hover:bg-gray-200 p-1.5 rounded"><Quote size={18}/><span className="text-[9px]">Quote</span></button>
                    <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="flex flex-col items-center hover:bg-gray-200 p-1.5 rounded"><Code size={18}/><span className="text-[9px]">Code</span></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Rich Content</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center h-full p-2">
                    <div className="flex flex-col">
                      <label className="text-[11px] text-gray-700 mb-1 font-medium">Document Templates</label>
                      <select onChange={loadTemplate} className="border border-gray-300 p-1.5 rounded text-sm bg-white hover:bg-gray-50 cursor-pointer w-48 shadow-sm">
                        <option value="" disabled selected>Load Template...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Templates</span>
                </div>
              </>
            )}

            {activeTab === 'Layout' && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <div className="flex flex-col gap-1 items-center">
                       <span className="text-[10px] text-gray-600 font-semibold">Margins</span>
                       <select onChange={(e) => setMargins(e.target.value)} value={margins} className="border border-gray-300 p-1 rounded text-xs bg-white cursor-pointer shadow-sm w-28">
                         <option value="p-4">Narrow</option>
                         <option value="p-12">Normal</option>
                         <option value="p-24">Wide</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                       <span className="text-[10px] text-gray-600 font-semibold">Orientation</span>
                       <select onChange={(e) => setOrientation(e.target.value)} value={orientation} className="border border-gray-300 p-1 rounded text-xs bg-white cursor-pointer shadow-sm w-28">
                         <option value="portrait">Portrait</option>
                         <option value="landscape">Landscape</option>
                       </select>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-2">Page Setup</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <label className="flex flex-col items-center cursor-pointer hover:bg-gray-200 p-2 rounded relative">
                      <PaintBucket size={20} className="text-[#2b579a]" />
                      <span className="text-[9px] mt-1">Page Color</span>
                      <input type="color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="w-0 h-0 opacity-0 absolute" />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Page Background</span>
                </div>
              </>
            )}

            {activeTab === 'Review' && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <button onClick={() => setSpellCheckEnabled(!spellCheckEnabled)} className={`flex flex-col items-center p-2 rounded ${spellCheckEnabled ? 'bg-blue-100 text-[#2b579a]' : 'hover:bg-gray-200'}`}>
                      <Check size={20} className={spellCheckEnabled ? 'text-[#2b579a]' : ''} />
                      <span className="text-[9px]">Spell Check</span>
                    </button>
                    <button onClick={() => alert(`Word Count: ${editor.getText().trim().split(/\s+/).filter(w => w.length > 0).length}\nCharacters: ${editor.getText().length}`)} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded">
                      <FileText size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">Word Count</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Proofing</span>
                </div>
              </>
            )}

            {activeTab === 'View' && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <button onClick={() => setViewMode('print')} className={`flex flex-col items-center p-2 rounded ${viewMode === 'print' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
                      <LayoutTemplate size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">Print Layout</span>
                    </button>
                    <button onClick={() => setViewMode('web')} className={`flex flex-col items-center p-2 rounded ${viewMode === 'web' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
                      <Globe size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">Web Layout</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Views</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <button onClick={() => setZoom(Math.min(zoom + 0.1, 2))} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded">
                      <ZoomIn size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">Zoom In</span>
                    </button>
                    <button onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded">
                      <ZoomOut size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">Zoom Out</span>
                    </button>
                    <button onClick={() => setZoom(1)} className="flex flex-col items-center hover:bg-gray-200 p-2 rounded">
                      <Maximize size={20} className="text-[#2b579a]"/>
                      <span className="text-[9px]">100%</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Zoom ({(zoom*100).toFixed(0)}%)</span>
                </div>
              </>
            )}

            {activeTab === 'Table' && editor && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1 h-full pt-1">
                    <button onClick={() => setTableDrawMode(tableDrawMode === 'pencil' ? null : 'pencil')} className={`flex items-center gap-1 px-2 py-1 rounded border border-gray-300 ${tableDrawMode === 'pencil' ? 'bg-blue-100' : 'bg-white hover:bg-gray-200'}`}><PenTool size={14}/><span className="text-xs">Draw Table</span></button>
                    <button onClick={() => setTableDrawMode(tableDrawMode === 'eraser' ? null : 'eraser')} className={`flex items-center gap-1 px-2 py-1 rounded border border-gray-300 ${tableDrawMode === 'eraser' ? 'bg-blue-100' : 'bg-white hover:bg-gray-200'}`}><Eraser size={14}/><span className="text-xs">Eraser</span></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Draw</span>
                </div>
                
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full pt-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px]">
                         <span className="w-8">Height:</span>
                         <input type="text" value={cellHeight} onChange={(e) => updateCellSize('height', e.target.value)} placeholder="e.g., 50px" className="border border-gray-300 p-0.5 w-16 text-[10px]" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                         <span className="w-8">Width:</span>
                         <input type="text" value={cellWidth} onChange={(e) => updateCellSize('width', e.target.value)} placeholder="e.g., 100px" className="border border-gray-300 p-0.5 w-16 text-[10px]" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Cell Size</span>
                </div>

                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1">
                    <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="flex flex-col items-center p-1.5 hover:bg-gray-200 rounded"><Columns size={16}/><span className="text-[9px]">Insert Left</span></button>
                    <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="flex flex-col items-center p-1.5 hover:bg-gray-200 rounded"><Columns size={16}/><span className="text-[9px]">Insert Right</span></button>
                    <button onClick={() => editor.chain().focus().addRowBefore().run()} className="flex flex-col items-center p-1.5 hover:bg-gray-200 rounded"><Rows size={16}/><span className="text-[9px]">Insert Above</span></button>
                    <button onClick={() => editor.chain().focus().addRowAfter().run()} className="flex flex-col items-center p-1.5 hover:bg-gray-200 rounded"><Rows size={16}/><span className="text-[9px]">Insert Below</span></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Rows & Columns</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1">
                    <button onClick={() => editor.chain().focus().deleteColumn().run()} className="flex flex-col items-center p-1.5 hover:bg-red-100 text-red-600 rounded"><Columns size={16}/><span className="text-[9px]">Del Column</span></button>
                    <button onClick={() => editor.chain().focus().deleteRow().run()} className="flex flex-col items-center p-1.5 hover:bg-red-100 text-red-600 rounded"><Rows size={16}/><span className="text-[9px]">Del Row</span></button>
                    <button onClick={() => editor.chain().focus().deleteTable().run()} className="flex flex-col items-center p-1.5 hover:bg-red-100 text-red-700 font-bold rounded"><Trash2 size={16}/><span className="text-[9px]">Del Table</span></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Delete</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1 h-full pt-1">
                    <button onClick={() => editor.chain().focus().mergeCells().run()} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded border border-gray-300 bg-white"><Combine size={14}/><span className="text-xs">Merge Cells</span></button>
                    <button onClick={() => editor.chain().focus().splitCell().run()} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded border border-gray-300 bg-white"><Split size={14}/><span className="text-xs">Split Cells</span></button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <label className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded border border-gray-300 bg-white cursor-pointer" title="Cell Background Color">
                      <PaintBucket size={14} className="text-[#2b579a]"/>
                      <span className="text-xs">Shading</span>
                      <input type="color" onInput={(e) => editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run()} className="w-0 h-0 opacity-0 absolute" />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Merge & Shading</span>
                </div>
              </>
            )}

            {activeTab === 'Draw' && (
              <>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1">
                    <ToolBtn onClick={() => setMode('pen')} active={mode === 'pen'} title="Freehand Pen"><PenTool size={20} className="text-[#2b579a]" /></ToolBtn>
                    <div className="flex flex-col px-2 gap-1">
                      <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer rounded shadow-sm" title="Pen/Shape Color" />
                      <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} className="w-20 cursor-pointer" title="Brush Thickness" />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Tools</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-1">
                    <button onClick={() => addShape('rect')} className="p-2 hover:bg-gray-200 rounded"><Square size={20}/></button>
                    <button onClick={() => addShape('circle')} className="p-2 hover:bg-gray-200 rounded"><Circle size={20}/></button>
                    <button onClick={() => addShape('triangle')} className="p-2 hover:bg-gray-200 rounded"><Triangle size={20}/></button>
                    <button onClick={() => addShape('line')} className="p-2 hover:bg-gray-200 rounded"><Minus size={20}/></button>
                    <button onClick={() => addShape('text')} className="p-2 hover:bg-gray-200 rounded"><Type size={20}/></button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Shapes</span>
                </div>
                <div className="flex flex-col border-r pr-4 border-gray-300">
                  <div className="flex items-center gap-2 h-full">
                    <label className="flex flex-col items-center justify-center p-1.5 hover:bg-gray-200 rounded cursor-pointer">
                      <ImageIcon size={18} className="text-[#2b579a]" />
                      <span className="text-[9px] mt-1">Overlay Image</span>
                      <input type="file" accept="image/*" onChange={addImageToCanvas} className="hidden" />
                    </label>
                    <button onClick={() => {
                      const active = fabricRef.current?.getActiveObject();
                      if (active) fabricRef.current.remove(active);
                    }} className="flex flex-col items-center justify-center p-1.5 hover:bg-red-100 text-red-600 rounded">
                      <Trash2 size={18} />
                      <span className="text-[9px] mt-1">Delete Shape</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 text-center mt-1">Actions</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor Canvas Container */}
      <div 
        className="w-full flex justify-center mt-4 overflow-visible"
        onContextMenu={(e) => {
          if (editor && editor.isActive('table')) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        <div 
          className={`relative shadow-xl mx-auto transition-all duration-300 origin-top
            ${orientation === 'portrait' ? 'max-w-[800px] min-h-[1056px]' : 'max-w-[1056px] min-h-[800px]'}
            ${viewMode === 'print' ? `border border-gray-300 bg-white ${margins}` : 'p-4 w-full shadow-none border-none'}
          `}
          style={{ 
            backgroundColor: pageColor, 
            transform: `scale(${zoom})`,
            width: '100%'
          }}
          ref={containerRef}
          onMouseUp={() => {
            if (tableDrawMode === 'eraser') {
              setTimeout(() => editor?.chain().focus().mergeCells().run(), 50);
            } else if (tableDrawMode === 'pencil') {
              setTimeout(() => editor?.chain().focus().splitCell().run(), 50);
            }
          }}
        >
          <div 
            className={`relative z-0 ${mode === 'draw' || mode === 'pen' ? 'pointer-events-none opacity-60 select-none' : ''} ${tableDrawMode === 'pencil' ? 'cursor-crosshair' : tableDrawMode === 'eraser' ? 'cursor-alias' : ''}`}
            onMouseUp={() => {
              if (tableDrawMode === 'eraser') {
                setTimeout(() => editor?.chain().focus().mergeCells().run(), 50);
              } else if (tableDrawMode === 'pencil') {
                setTimeout(() => editor?.chain().focus().splitCell().run(), 50);
              }
            }}
          >
            <EditorContent editor={editor} className="circular-body outline-none min-h-[800px]" />
          </div>

          {/* Safe Fabric Canvas Container - uses dangerous HTML to avoid React lifecycle tracking */}
          <div 
            className={`absolute top-0 left-0 w-full h-full z-10 ${mode === 'text' ? 'pointer-events-none' : 'pointer-events-auto'}`}
            dangerouslySetInnerHTML={{ __html: '<canvas id="safe-fabric-canvas"></canvas>' }}
          />
        </div>
      </div>

      {/* Fixed Popups mapped outside overflow containers */}
      {tablePopupPos && (
        <div 
          className="fixed bg-white shadow-xl border border-gray-300 p-2 z-[9999] rounded" 
          style={{ top: tablePopupPos.y, left: tablePopupPos.x }}
          onClick={e => e.stopPropagation()}
        >
          {Array(10).fill(0).map((_, r) => (
            <div className="flex" key={`r-${r}`}>
              {Array(10).fill(0).map((_, c) => (
                <div 
                  key={`c-${c}`}
                  className={`w-5 h-5 border border-gray-300 m-[1px] cursor-pointer ${r <= tableGridHover.r && c <= tableGridHover.c ? 'bg-blue-300 border-blue-500' : 'bg-white'}`}
                  onMouseEnter={() => setTableGridHover({ r, c })}
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true }).run();
                    setTablePopupPos(null);
                  }}
                />
              ))}
            </div>
          ))}
          <div className="text-center text-xs mt-2 font-medium text-gray-600">{tableGridHover.c + 1} x {tableGridHover.r + 1} Table</div>
        </div>
      )}
      
      {contextMenu && editor?.isActive('table') && (
        <div 
          className="fixed bg-white border border-gray-300 shadow-2xl rounded py-1 z-[9999] w-48 text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between" onClick={() => { editor.chain().focus().addRowAfter().run(); setContextMenu(null); }}>
            <span>Insert Row Below</span> <Rows size={14} className="text-gray-500"/>
          </div>
          <div className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between" onClick={() => { editor.chain().focus().addColumnAfter().run(); setContextMenu(null); }}>
            <span>Insert Col Right</span> <Columns size={14} className="text-gray-500"/>
          </div>
          <div className="border-t border-gray-200 my-1"></div>
          <div className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between" onClick={() => { editor.chain().focus().mergeCells().run(); setContextMenu(null); }}>
            <span>Merge Cells</span> <Combine size={14} className="text-gray-500"/>
          </div>
          <div className="border-t border-gray-200 my-1"></div>
          <label className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
            <span>Shading Color...</span>
            <input type="color" className="w-5 h-5 cursor-pointer p-0 border-0" onChange={(e) => {
              editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run();
              setContextMenu(null);
            }} />
          </label>
          <div className="border-t border-gray-200 my-1"></div>
          <div className="px-4 py-1.5 hover:bg-red-50 text-red-600 font-medium cursor-pointer flex items-center justify-between" onClick={() => { editor.chain().focus().deleteTable().run(); setContextMenu(null); }}>
            <span>Delete Table</span> <Trash2 size={14}/>
          </div>
        </div>
      )}

      {/* Reject/Request Changes Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Request Changes</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason or instruction for the requested changes.</p>
            <textarea 
              className="w-full border border-gray-300 rounded-md p-3 mb-4 h-32 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Please fix the date and update the department code..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleWorkflowAction('reject')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
