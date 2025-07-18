export interface Note {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
}

export interface UpdateNoteRequest {
  title?: string;
} 