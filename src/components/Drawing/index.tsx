import './index.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TitleBar } from 'react-desktop/macOs';

import { useModal } from '../../lib/Modal/UseModal';
import { AppState } from '../Dock/types';
import Canvas from './Canvas';
/// <reference path="react-desktop.d.ts" />

interface DrawingProps {
    drawingState: AppState;
    setDrawingState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Drawing: React.FC<DrawingProps> = (props: DrawingProps): JSX.Element => {
    const { open, close, RenderModal } = useModal('DrawingView');
    const { drawingState, setDrawingState } = props;
    const [style, setStyle] = useState<{ width: number; height: number }>({
        width: 1000,
        height: 600,
    });
    const [isFullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (drawingState === AppState.CLOSED) {
            close();
        } else {
            open();
        }
    }, [close, open, drawingState]);

    const handleMaximizeClick = useCallback(() => {
        if (isFullscreen) {
            setStyle({ width: 1000, height: 600 });
        } else {
            setStyle({ width: -1, height: -1 });
        }
        setFullscreen(!isFullscreen);
    }, [isFullscreen]);

    const drawingRef = useRef<any>();

    return (
        <RenderModal
            data={{
                width: style.width,
                height: style.height,
                id: 'DrawingView',
                moveId: 'DrawingMove',
                isShow: drawingState === AppState.RUNNING_IN_FOREGROUND,
            }}
        >
            <div className="drawing-wrapper">
                <TitleBar
                    controls
                    id="DrawingMove"
                    isFullscreen={isFullscreen}
                    onCloseClick={(): void => {
                        if (drawingRef.current) {
                            drawingRef.current.drawingCloseClick();
                        }
                    }}
                    onMinimizeClick={(): void => {
                        setDrawingState(AppState.RUNNING_IN_BACKGROUND);
                    }}
                    onMaximizeClick={handleMaximizeClick}
                    onResizeClick={handleMaximizeClick}
                />
                <Canvas
                    drawingRef={drawingRef}
                    height={isFullscreen ? window.innerHeight - 32 : style.height}
                    width={isFullscreen ? window.innerWidth : style.width}
                    drawingState={drawingState}
                    setDrawingState={setDrawingState}
                />
            </div>
        </RenderModal>
    );
};

export default Drawing;
