import { Trip } from './trip';

export interface Driver {
  driver: string;
  key?: string;
  trips: Trip[];
}
