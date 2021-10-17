import React, { CSSProperties, useMemo, useState } from 'react';
import { Button, Dialog } from 'react-desktop/macOs';

/// <reference path="react-desktop.d.ts" />

interface DialogProps {
    width: number;
    height: number;
    id: string;
    title?: string;
    message?: string;
    imgSource?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface UseDialog {
    openDialog: () => void;
    closeDialog: () => void;
    RenderDialog: (props: DialogProps) => JSX.Element;
}

const useDialog = (): UseDialog => {
    const [isVisible, setIsVisible] = useState(false);
    const openDialog = (): void => setIsVisible(true);
    const closeDialog = (): void => setIsVisible(false);
    const RenderDialog = (props: DialogProps): JSX.Element => {
        const { width, height, id, title, message, imgSource, onConfirm, onCancel } =
            props;

        const styles = useMemo(
            () => ({
                width: width,
                height: height,
                left: `calc(50vw - ${width / 2}px)`,
                top: `calc(50vh - ${height}px)`,
                borderRadius: 4,
            }),
            [width, height]
        );

        const renderIcon = (): JSX.Element => {
            if (!imgSource) {
                return <React.Fragment></React.Fragment>;
            }
            return <img src={imgSource} width="52" height="52" alt="tip" />;
        };

        return (
            <React.Fragment>
                {isVisible && (
                    <div id={id} style={styles as CSSProperties}>
                        <Dialog
                            title={title}
                            message={message}
                            icon={renderIcon()}
                            buttons={[
                                <Button key="cancel" onClick={onCancel}>
                                    Cancel
                                </Button>,
                                <Button
                                    key="confirm"
                                    color="blue"
                                    onClick={onConfirm}
                                >
                                    Confirm
                                </Button>,
                            ]}
                        />
                    </div>
                )}
            </React.Fragment>
        );
    };

    return {
        openDialog,
        closeDialog,
        RenderDialog,
    };
};

export default useDialog;
