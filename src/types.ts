export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning';
  timestamp?: string;
}

export interface Metric {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export interface SavedWish {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}
