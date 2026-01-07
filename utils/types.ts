type TimetableItem = {
  year: string;
  section: string;
  hash: string;
  count: number;
};
export type GroupedData = Record<string, Record<string, TimetableItem[]>>;
