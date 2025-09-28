declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface Event {
    id?: string | number;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
    allDay?: boolean;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor: string | ((event: Event) => Date);
    endAccessor: string | ((event: Event) => Date);
    selectable?: boolean;
    style?: React.CSSProperties;
    messages?: Record<string, string>;
    formats?: Record<string, any>;
    views?: string[];
    onSelectSlot?: (slotInfo: any) => void;
    onSelectEvent?: (event: Event) => void;
    dayPropGetter?: (date: Date) => { style?: React.CSSProperties };
    eventPropGetter?: (event: Event) => { style?: React.CSSProperties };
    components?: Record<string, ComponentType<any>>;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export const dateFnsLocalizer: (config: any) => any;
}

declare module 'date-fns/locale/es' {
  const esES: any;
  export default esES;
}






























