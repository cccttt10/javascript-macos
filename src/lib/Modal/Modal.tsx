import React from 'react';
import ReactDOM from 'react-dom';

import Draggable from './draggable/index';

type ModalProps = {
    children: React.ReactChild;
    data: {
        width: number;
        height: number;
        id: string;
        moveId: string;
        isShow: boolean;
    };
};

const Modal: React.FC<ModalProps> = ({ children, data }: ModalProps) => {
    const domEl = document.getElementById('main-view') as HTMLDivElement;
    if (!domEl) return null;

    return ReactDOM.createPortal(
        <Draggable domEl={domEl} data={data}>
            {children}
        </Draggable>,
        domEl
    );
};

export default Modal;
