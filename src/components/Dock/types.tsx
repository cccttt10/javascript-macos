import { CSSProperties } from 'react';

export const enum DockPosition {
    BOTTOM = 'bottom',
    TOP = 'top',
    RIGHT = 'right',
    LEFT = 'left',
}

export interface DockConfig {
    position: DockPosition;
    length: number;
    maxLength: number;
    distanceBetweenIcons: number;
    distanceToScreenEdge: number;
    style: CSSProperties;
}

export const enum AppState {
    RUNNING_IN_BACKGROUND = 'RUNNING_IN_BACKGROUND',
    RUNNING_IN_FOREGROUND = 'RUNNING_IN_FOREGROUND',
    CLOSED = 'CLOSED',
}
