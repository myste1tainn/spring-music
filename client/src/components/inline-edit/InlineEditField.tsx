import { useEffect, useRef, useState } from 'react'
import {
  getInlineEditorState,
  setInlineEditorState,
  clearInlineEditor,
} from '@/hooks/useInlineEditor'

interface InlineEditFieldProps {
  albumId: string
  fieldName: string
  value: string | number
  onSave: (value: string) => void
}

export function InlineEditField({
  albumId,
  fieldName,
  value,
  onSave,
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEditing() {
    const current = getInlineEditorState()
    if (current.albumId && current.fieldName) return
    setInlineEditorState(albumId, fieldName)
    setDraft(String(value))
    setEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== String(value)) {
      onSave(trimmed)
    }
    cancel()
  }

  function cancel() {
    setEditing(false)
    clearInlineEditor()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-full rounded border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <span
      className="cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1 transition"
      onClick={startEditing}
    >
      {value}
    </span>
  )
}
