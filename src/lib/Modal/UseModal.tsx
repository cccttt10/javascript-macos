/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useCallback, useState } from 'react';

import Modal from './Modal';
import store from './store';

// Modal组件最基础的两个事件，open/close
export const useModal = (id: string) => {
    const [isVisible, setIsVisible] = useState(false);

    const open = useCallback(() => {
        setIsVisible(true);
        store.addModal(id);
    }, [id]);

    const close = useCallback(() => {
        setIsVisible(false);
        store.removeModal(id);
    }, [id]);

    const RenderModal = ({
        children,
        data,
    }: {
        children: React.ReactChild;
        data: {
            width: number;
            height: number;
            id: string;
            moveId: string;
            isShow: boolean;
        };
    }) => {
        return <>{isVisible && <Modal data={data}>{children}</Modal>}</>;
    };

    return {
        open,
        close,
        RenderModal,
    };
};
