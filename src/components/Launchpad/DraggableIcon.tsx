import React, {
    CSSProperties,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

export interface DragEvent {
    id: number;
    translation: Position;
}

interface Position {
    x: number;
    y: number;
}

interface DraggableIconProps {
    children: React.ReactChild;
    id: number;
    onDrag: (e: DragEvent) => void;
    onDragEnd: () => void;
}

interface DraggableIconState {
    dragging: boolean;
    origin: Position;
    translation: Position;
}

const Draggable: React.FC<DraggableIconProps> = (props: DraggableIconProps) => {
    const { children, id, onDrag, onDragEnd } = props;
    const [state, setState] = useState<DraggableIconState>({
        dragging: false,
        origin: { x: 0, y: 0 },
        translation: { x: 0, y: 0 },
    });

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { clientX, clientY } = e;
        setState(state => ({
            ...state,
            dragging: true,
            origin: { x: clientX, y: clientY },
        }));
    }, []);

    const handleMouseMove = useCallback(
        (e: Event) => {
            const { clientX, clientY } = e as unknown as MouseEvent;
            const translation = {
                x: clientX - state.origin.x,
                y: clientY - state.origin.y,
            };
            setState(state => ({
                ...state,
                translation,
            }));
            onDrag({ translation, id });
        },
        [state.origin, onDrag, id]
    );

    const handleMouseUp = useCallback(() => {
        setState(state => ({
            ...state,
            dragging: false,
        }));
        onDragEnd();
    }, [onDragEnd]);

    useEffect(() => {
        if (state.dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            setState(state => ({ ...state, translation: { x: 0, y: 0 } }));
        }
    }, [state.dragging, handleMouseMove, handleMouseUp]);

    const styles = useMemo(
        () => ({
            cursor: state.dragging ? '-webkit-grabbing' : '-webkit-grab',
            transform: `translate(${state.translation.x}px, ${state.translation.y}px)`,
            transition: state.dragging ? 'none' : 'transform 500ms',
            zIndex: state.dragging ? 2 : 1,
        }),
        [state.dragging, state.translation]
    );

    return (
        <div style={styles as CSSProperties} onMouseDown={handleMouseDown}>
            {children}
        </div>
    );
};

export default Draggable;
