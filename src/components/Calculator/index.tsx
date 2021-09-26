import './index.scss';

import React, { useEffect } from 'react';
import { TitleBar } from 'react-desktop/macOs';

import { useModal } from '../../lib/Modal/UseModal';
import { AppState } from '../Dock/types';
import KeyPad from './KeyPad';
/// <reference path="react-desktop.d.ts" />

interface CalculatorProps {
    calculatorState: AppState;
    setCalculatorState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const Calculator: React.FC<CalculatorProps> = (props: CalculatorProps) => {
    const { open, close, RenderModal } = useModal('CalculatorView');
    const { calculatorState, setCalculatorState } = props;

    useEffect(() => {
        if (calculatorState === AppState.CLOSED) {
            close();
        } else {
            open();
        }
    }, [close, open, calculatorState]);

    return (
        <RenderModal
            data={{
                width: 410,
                height: 560,
                id: 'CalculatorView',
                moveId: 'calculatorMove',
                isShow: calculatorState === AppState.RUNNING_IN_FOREGROUND,
            }}
        >
            <>
                <TitleBar
                    id="calculatorMove"
                    transparent
                    controls
                    isFullscreen={false}
                    onCloseClick={(): void => {
                        close();
                        setCalculatorState(AppState.CLOSED);
                    }}
                    onMinimizeClick={(): void => {
                        setCalculatorState(AppState.RUNNING_IN_BACKGROUND);
                    }}
                    onMaximizeClick={open}
                />
                <KeyPad />
            </>
        </RenderModal>
    );
};
