/* eslint-disable max-lines */
import React, {
    CSSProperties,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { CSSTransition } from 'react-transition-group';

import DrawingIcon from '../../assets/images/Drawing.png';
import Icon from '../../lib/Icon';
import useDialog from '../Dialog';
import { AppState } from '../Dock/types';

interface CanvasProps {
    width: number;
    height: number;
    drawingRef: any;
    drawingState: AppState;
    setDrawingState: React.Dispatch<React.SetStateAction<AppState>>;
}

type Coordinate = {
    x: number;
    y: number;
};

const Canvas: React.FC<CanvasProps> = (props: CanvasProps): JSX.Element => {
    const { width, height, drawingRef, drawingState, setDrawingState } = props;
    const colorMap = ['black', 'red', 'green', 'blue'];
    const optionsMap = [
        'canvas_save',
        'canvas_clear',
        'turn_left_flat',
        'turn_right_flat',
    ];
    const toolsMap = ['canvas_paint', 'canvas_eraser'];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const undoButtonRef = useRef<SVGSVGElement>(null);
    const redoButtonRef = useRef<SVGSVGElement>(null);
    const [strokeStyle, setStrokeStyle] = useState('black');
    const [lineWidth, setLineWidth] = useState(5);
    const [eraserEnabled, setEraserEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
        undefined
    );
    const [step, setStep] = useState(-1);
    const [canvasHistory, setCanvasHistory] = useState<string[]>([]);

    const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
        if (!canvasRef.current) {
            return;
        }
        return {
            x: event.offsetX,
            y: event.offsetY,
        };
    };

    const startDrawing = useCallback((event: MouseEvent) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setMousePosition(coordinates);
            setIsDrawing(true);
        }
    }, []);

    const drawLine = useCallback(
        (originalMousePosition: Coordinate, newMousePosition: Coordinate) => {
            if (!canvasRef.current) {
                return;
            }
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = strokeStyle;
                context.lineJoin = 'round';
                context.lineWidth = lineWidth;
                context.beginPath();
                context.moveTo(originalMousePosition.x, originalMousePosition.y);
                context.lineTo(newMousePosition.x, newMousePosition.y);
                context.closePath();
                context.stroke();
            }
        },
        [lineWidth, strokeStyle]
    );

    interface ClearRectOptions {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    const clearRect = useCallback(({ x, y, width, height }: ClearRectOptions) => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(x, y, width, height);
        }
    }, []);

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isDrawing) {
                const newMousePosition = getCoordinates(event);
                if (mousePosition && newMousePosition) {
                    if (eraserEnabled) {
                        clearRect({
                            x: newMousePosition.x - lineWidth / 2,
                            y: newMousePosition.y - lineWidth / 2,
                            width: lineWidth,
                            height: lineWidth,
                        });
                    } else {
                        drawLine(mousePosition, newMousePosition);
                        setMousePosition(newMousePosition);
                    }
                }
            }
        },
        [isDrawing, eraserEnabled, mousePosition, lineWidth, drawLine, clearRect]
    );

    const saveToHistory = useCallback(() => {
        setStep(step + 1);
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvasHistory.push(canvas.toDataURL());
        setCanvasHistory(canvasHistory);
        if (!undoButtonRef.current || !redoButtonRef.current) {
            return;
        }
        const back: SVGSVGElement = undoButtonRef.current;
        const go: SVGSVGElement = redoButtonRef.current;
        back.classList.add('active');
        go.classList.remove('active');
    }, [step, canvasHistory]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setMousePosition(undefined);
        saveToHistory();
    }, [saveToHistory]);

    const leaveCanvas = useCallback(() => {
        setIsDrawing(false);
        setMousePosition(undefined);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', leaveCanvas);
        return (): void => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', leaveCanvas);
        };
    }, [startDrawing, handleMouseMove, stopDrawing, leaveCanvas]);

    const [isToolboxOpen, setToolboxOpen] = useState(true);
    const toolboxOpenClick = useCallback(() => {
        setToolboxOpen(!isToolboxOpen);
    }, [isToolboxOpen]);

    const onToolsClick = useCallback((e, toolName) => {
        const el = e.currentTarget;
        if (el.classList[1]) return;
        toolName === 'canvas_eraser'
            ? setEraserEnabled(true)
            : setEraserEnabled(false);
        el.classList.add('active');
        el.parentNode.childNodes.forEach((item: HTMLLIElement) => {
            if (!item.matches('svg') || item === el) return;
            item.classList.remove('active');
        });
    }, []);

    const onSizesChange = useCallback(e => {
        setLineWidth(e.target.value);
    }, []);

    const onColorsClick = useCallback(([e, selector, color]) => {
        const el = e.target;
        if (el.className.includes('active')) return;
        setStrokeStyle(color);
        el.classList.add('active');
        el.parentNode.childNodes.forEach((item: HTMLLIElement) => {
            if (!item.matches(selector) || item === el) return;
            item.classList.remove('active');
        });
    }, []);

    const onColorsChange = useCallback(e => {
        setStrokeStyle(e.target.value);
    }, []);

    const { openDialog, closeDialog, RenderDialog } = useDialog();
    const [isClearDialogOpen, setClearDialogOpen] = useState(false);
    const [closeCanvas, setCloseCanvas] = useState(false);

    useImperativeHandle(drawingRef, () => ({
        drawingCloseClick: () => {
            if (step === -1) {
                setDrawingState(AppState.CLOSED);
            } else if (isClearDialogOpen) return;
            setCloseCanvas(true);
        },
    }));

    const [clearDialogText, setClearDialogText] = useState({
        title: '您确定要清空该画布吗？',
        message: '一旦清空将无法撤回。',
    });

    useEffect(() => {
        if (closeCanvas) {
            if (!isClearDialogOpen) {
                setClearDialogText({
                    title: '退出将丢失该画布！',
                    message: '确认退出画板？',
                });
                setClearDialogOpen(true);
            }
        } else {
            setClearDialogText({
                title: '您确定要清空该画布吗？',
                message: '一旦清空将无法撤回。',
            });
        }
    }, [closeCanvas, isClearDialogOpen]);

    useEffect(
        () => (isClearDialogOpen ? openDialog() : closeDialog()),
        [closeDialog, isClearDialogOpen, openDialog]
    );

    const saveCanvas = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            const compositeOperation = context.globalCompositeOperation;
            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = '#fff';
            context.fillRect(0, 0, width, height);
            const imageData = canvas.toDataURL('image/png');
            context.putImageData(context.getImageData(0, 0, width, height), 0, 0);
            context.globalCompositeOperation = compositeOperation;
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.href = imageData;
            a.download = 'myPaint';
            a.target = '_blank';
            a.click();
        }
    }, [width, height]);

    const changeCanvas = useCallback(
        type => {
            if (
                !canvasRef.current ||
                !undoButtonRef.current ||
                !redoButtonRef.current
            ) {
                return;
            }
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            const back: SVGSVGElement = undoButtonRef.current;
            const go: SVGSVGElement = redoButtonRef.current;
            if (context) {
                let currentStep = -1;
                if (type === 'back' && step >= 0) {
                    currentStep = step - 1;
                    go.classList.add('active');
                    if (currentStep < 0) {
                        back.classList.remove('active');
                    }
                } else if (type === 'go' && step < canvasHistory.length - 1) {
                    currentStep = step + 1;
                    back.classList.add('active');
                    if (currentStep === canvasHistory.length - 1) {
                        go.classList.remove('active');
                    }
                } else {
                    return;
                }
                context.clearRect(0, 0, width, height);
                const canvasPic = new Image();
                canvasPic.src = canvasHistory[currentStep] as string;
                canvasPic.addEventListener('load', () => {
                    context.drawImage(canvasPic, 0, 0);
                });
                setStep(currentStep);
            }
        },
        [canvasHistory, step, width, height]
    );

    const onOptionsClick = useCallback(
        toolName => {
            switch (toolName) {
                case 'canvas_clear':
                    if (step === -1) return;
                    setClearDialogOpen(true);
                    break;
                case 'canvas_save':
                    saveCanvas();
                    break;
                case 'turn_left_flat':
                    changeCanvas('back');
                    break;
                case 'turn_right_flat':
                    changeCanvas('go');
                    break;
            }
        },
        [saveCanvas, changeCanvas, step]
    );

    const closeClearDialog = useCallback(() => {
        setClearDialogOpen(false);
        if (closeCanvas) {
            setCloseCanvas(false);
        }
    }, [setClearDialogOpen, closeCanvas, setCloseCanvas]);

    const checkClearDialog = useCallback(() => {
        clearRect({
            x: 0,
            y: 0,
            width,
            height,
        });
        setCanvasHistory([]);
        setStep(-1);
        closeClearDialog();
        if (!undoButtonRef.current || !redoButtonRef.current) {
            return;
        }
        const back: SVGSVGElement = undoButtonRef.current;
        const go: SVGSVGElement = redoButtonRef.current;
        back.classList.remove('active');
        go.classList.remove('active');
        if (closeCanvas) {
            setDrawingState(AppState.CLOSED);
            setCloseCanvas(false);
        }
    }, [
        closeClearDialog,
        clearRect,
        width,
        height,
        closeCanvas,
        setCloseCanvas,
        drawingState,
        setDrawingState,
    ]);

    return (
        <>
            <canvas id="canvas" ref={canvasRef} height={height} width={width} />
            <div
                id="toolbox-open"
                style={
                    {
                        borderRadius: isToolboxOpen ? null : 5,
                    } as CSSProperties
                }
            >
                <Icon
                    type={isToolboxOpen ? 'icon-upward_flat' : 'icon-downward_flat'}
                    style={{
                        width: '100%',
                        fontSize: 32,
                    }}
                    clickEvent={toolboxOpenClick}
                />
            </div>
            <CSSTransition
                in={isToolboxOpen} //用于判断是否出现的状态
                timeout={300} //动画持续时间
                classNames="toolbox" //className值，防止重复
                unmountOnExit
            >
                <div id="toolbox">
                    <span>Options</span>
                    <div className="options">
                        {optionsMap.map((option, index) => {
                            return (
                                <Icon
                                    svgRef={
                                        option === 'turn_right_flat'
                                            ? redoButtonRef
                                            : option === 'turn_left_flat'
                                            ? undoButtonRef
                                            : undefined
                                    }
                                    key={index + option}
                                    className={option}
                                    type={'icon-' + option}
                                    style={{ fontSize: 50 }}
                                    clickEvent={() => onOptionsClick(option)}
                                />
                            );
                        })}
                    </div>
                    <span>Toolbox</span>
                    <div className="tools">
                        {toolsMap.map((tool, index) => {
                            return (
                                <Icon
                                    key={index + tool}
                                    className={
                                        tool === 'canvas_eraser'
                                            ? eraserEnabled
                                                ? 'active'
                                                : ''
                                            : !eraserEnabled
                                            ? 'active'
                                            : ''
                                    }
                                    type={'icon-' + tool}
                                    style={{ fontSize: 50 }}
                                    clickEvent={e => onToolsClick(e, tool)}
                                />
                            );
                        })}
                    </div>
                    <div className="sizes">
                        <input
                            style={
                                {
                                    backgroundColor: eraserEnabled
                                        ? '#ebeff4'
                                        : strokeStyle,
                                } as CSSProperties
                            }
                            type="range"
                            id="range"
                            name="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={onSizesChange}
                        />
                    </div>
                    <ol className="colors">
                        {colorMap.map((color, index) => {
                            return (
                                <li
                                    className={
                                        color === strokeStyle
                                            ? color + ' active'
                                            : color
                                    }
                                    key={index + color}
                                    onClick={e => onColorsClick([e, 'li', color])}
                                />
                            );
                        })}
                        <input
                            type="color"
                            value={strokeStyle}
                            onChange={onColorsChange}
                            id="currentColor"
                        />
                    </ol>
                </div>
            </CSSTransition>
            <RenderDialog
                width={300}
                height={120}
                id="clear-dialog"
                title={clearDialogText.title}
                message={clearDialogText.message}
                imgSource={DrawingIcon}
                onConfirm={checkClearDialog}
                onCancel={closeClearDialog}
            />
        </>
    );
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;
