interface InlineEditorState {
  albumId: string | null
  fieldName: string | null
}

const state: InlineEditorState = {
  albumId: null,
  fieldName: null,
}

export function getInlineEditorState(): InlineEditorState {
  return { ...state }
}

export function setInlineEditorState(
  albumId: string | null,
  fieldName: string | null,
) {
  state.albumId = albumId
  state.fieldName = fieldName
}

export function clearInlineEditor() {
  state.albumId = null
  state.fieldName = null
}
