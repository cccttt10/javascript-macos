import './index.scss';

import { inRange, range } from 'lodash';
import React, {
    CSSProperties,
    KeyboardEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';

import CalculatorIcon from '../../assets/images/Calculator.png';
import ChromeIcon from '../../assets/images/Chrome.png';
import DrawingIcon from '../../assets/images/Drawing.png';
import PreferencesIcon from '../../assets/images/Preferences.png';
import DraggableIcon from './DraggableIcon';
import { DragEvent } from './DraggableIcon';

type LaunchpadProps = {
    showLaunchpad: boolean;
    setShowLaunchPad: React.Dispatch<React.SetStateAction<boolean>>;
    handleDockIconClick: (iconName: string) => void;
};

interface LaunchpadState {
    dragging: boolean; // true if an icon is being dragged
    order: number[]; // the order of the icon IDs after dragging
    temporaryOrder: number[]; // the temporary order of the icon IDs while dragging
    draggedIconId: number | null; // the ID of the icon that is being dragged, null if no icon is being dragged
}

export const Launchpad: React.FC<LaunchpadProps> = (props: LaunchpadProps) => {
    const [icons] = useState<string[]>([
        PreferencesIcon, // id 0
        ChromeIcon, // id 1
        CalculatorIcon, // id 2
        DrawingIcon, // id 3
    ]);
    const iconIds = range(icons.length);
    const [state, setState] = useState<LaunchpadState>({
        dragging: false,
        order: iconIds,
        temporaryOrder: iconIds,
        draggedIconId: null,
    });

    const handleDrag = useCallback(
        (e: DragEvent) => {
            const { translation, id } = e;
            setState(state => ({
                ...state,
                dragging: true,
            }));
            const indexTranslation = Math.round(translation.x / 100);
            const index = state.order.indexOf(id);
            const temporaryOrder = state.order.filter(
                (index: number) => index !== id
            );
            if (!inRange(index + indexTranslation, 0, iconIds.length)) {
                return;
            }
            temporaryOrder.splice(index + indexTranslation, 0, id);
            setState(state => ({
                ...state,
                draggedIconId: id,
                temporaryOrder,
            }));
        },
        [state.order, iconIds.length]
    );

    const handleDragEnd = useCallback(() => {
        setState(state => ({
            ...state,
            order: state.temporaryOrder,
            draggedIconId: null,
        }));
    }, []);

    useEffect(() => {
        const handleKeydown = (e: Event): void => {
            const { key } = e as unknown as KeyboardEvent;
            if (key === 'Escape') {
                props.setShowLaunchPad(false);
            }
        };

        const handleClick = (e: Event): void => {
            const { target } = e;
            if (!props.showLaunchpad) return;
            const LaunchpadItems = document.getElementsByClassName('LaunchpadImg');
            for (let i = 0; i < LaunchpadItems.length; i++) {
                if (LaunchpadItems[i] === target) {
                    return;
                }
            }
            props.setShowLaunchPad(!props.showLaunchpad);
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('keyup', handleKeydown);
        return (): void => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keyup', handleKeydown);
        };
    }, [props]);

    const iconJsxElements: JSX.Element[] = icons.map((icon, iconId) => {
        const isDragging = state.draggedIconId === iconId;
        const top = state.temporaryOrder.indexOf(iconId) * 200;
        const draggedTop = state.order.indexOf(iconId) * 200;
        const fileName = icon.split('/').pop(); // e.g. '../../assets/images/Calculator.png'
        const iconLabel = (fileName || '').split('.')[0]; // e.g. 'Calculator'

        return (
            <DraggableIcon
                key={iconId}
                id={iconId}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="LaunchpadItem"
                    style={
                        {
                            left: isDragging ? draggedTop : top,
                            transition: isDragging ? 'none' : 'all 500ms',
                        } as CSSProperties
                    }
                >
                    <div
                        className="LaunchpadImg"
                        style={
                            {
                                backgroundImage: 'url(' + icon + ')',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                            } as CSSProperties
                        }
                        onClick={(): void => {
                            if (!state.dragging) {
                                props.handleDockIconClick(icon);
                            } else {
                                setState(state => ({
                                    ...state,
                                    dragging: false,
                                }));
                            }
                        }}
                    />
                    <span style={{ color: '#fff' }}>{iconLabel}</span>
                </div>
            </DraggableIcon>
        );
    });

    return (
        <React.Fragment>
            {props.showLaunchpad && (
                <div id="Launchpad">
                    <div id="LaunchpadItemWrapper">{iconJsxElements}</div>
                </div>
            )}
        </React.Fragment>
    );
};
