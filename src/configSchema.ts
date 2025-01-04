export interface Source {
  srcset: string;
  media?: string;
  type?: string;
}

export interface Option {
  label: string;
  alt?: string;
  src?: string;
  /** @deprecated Use `src` instead */
  url: string;
  sources?: Source[]
}
