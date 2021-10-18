/* eslint-disable max-lines */
import dayjs from 'dayjs';
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

interface Position {
    x: number;
    y: number;
}

const Canvas: React.FC<CanvasProps> = (props: CanvasProps): JSX.Element => {
    const { width, height, drawingRef, drawingState, setDrawingState } = props;
    const colors = ['black', 'red', 'green', 'blue'];
    const options = [
        'canvas_save',
        'canvas_clear',
        'turn_left_flat',
        'turn_right_flat',
    ];
    const tools = ['canvas_paint', 'canvas_eraser'];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const undoButtonRef = useRef<SVGSVGElement>(null);
    const redoButtonRef = useRef<SVGSVGElement>(null);
    const [strokeStyle, setStrokeStyle] = useState('black');
    const [lineWidth, setLineWidth] = useState(5);
    const [eraserEnabled, setEraserEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mousePosition, setMousePosition] = useState<Position | undefined>(
        undefined
    );
    const [step, setStep] = useState(-1);
    const [canvasHistory, setCanvasHistory] = useState<string[]>([]);

    const getCoordinates = (event: MouseEvent): Position | undefined => {
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
        (originalMousePosition: Position, newMousePosition: Position) => {
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
        const undoButton: SVGSVGElement = undoButtonRef.current;
        const redoButton: SVGSVGElement = redoButtonRef.current;
        undoButton.classList.add('active');
        redoButton.classList.remove('active');
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

    const [showToolbox, setShowToolbox] = useState(true);
    const toggleToolboxOpen = useCallback(() => {
        setShowToolbox(!showToolbox);
    }, [showToolbox]);

    const handleToolClick = useCallback((e, toolName) => {
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

    const handleSelectColor = useCallback(([e, selector, color]) => {
        const el = e.target;
        if (el.className.includes('active')) return;
        setStrokeStyle(color);
        el.classList.add('active');
        el.parentNode.childNodes.forEach((item: HTMLLIElement) => {
            if (!item.matches(selector) || item === el) return;
            item.classList.remove('active');
        });
    }, []);

    const { openDialog, closeDialog, RenderDialog } = useDialog();
    const [showDialog, setShowDialog] = useState(false);
    const [showCloseWarning, setShowCloseWarning] = useState(false);

    useImperativeHandle(drawingRef, () => ({
        drawingCloseClick: (): void => {
            if (step === -1) {
                setDrawingState(AppState.CLOSED);
            } else if (showDialog) {
                return;
            }
            setShowCloseWarning(true);
        },
    }));

    const [clearDialogText, setClearDialogText] = useState({
        title: 'Clear drawings?',
        message: 'This action cannot be undone.',
    });

    useEffect(() => {
        if (showCloseWarning) {
            if (!showDialog) {
                setClearDialogText({
                    title: 'Close and exit?',
                    message: 'You will lose your drawings.',
                });
                setShowDialog(true);
            }
        } else {
            setClearDialogText({
                title: 'Clear drawings?',
                message: 'This action cannot be undone.',
            });
        }
    }, [showCloseWarning, showDialog]);

    useEffect(
        () => (showDialog ? openDialog() : closeDialog()),
        [closeDialog, showDialog, openDialog]
    );

    const downloadDrawings = useCallback(() => {
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
            const timeFormat = 'MMM D, YYYY h:mm A'; // e.g. Aug 16, 2018 8:02 PM
            const timeStamp = dayjs().format(timeFormat);
            a.download = `Saved Drawings ${timeStamp}`;
            a.target = '_blank';
            a.click();
        }
    }, [width, height]);

    const timeTravel = useCallback(
        (type: 'redo' | 'undo') => {
            if (
                !canvasRef.current ||
                !undoButtonRef.current ||
                !redoButtonRef.current
            ) {
                return;
            }
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            const undoButton: SVGSVGElement = undoButtonRef.current;
            const redoButton: SVGSVGElement = redoButtonRef.current;
            if (context) {
                let currentStep = -1;
                if (type === 'undo' && step >= 0) {
                    currentStep = step - 1;
                    redoButton.classList.add('active');
                    if (currentStep < 0) {
                        undoButton.classList.remove('active');
                    }
                } else if (type === 'redo' && step < canvasHistory.length - 1) {
                    currentStep = step + 1;
                    undoButton.classList.add('active');
                    if (currentStep === canvasHistory.length - 1) {
                        redoButton.classList.remove('active');
                    }
                } else {
                    return;
                }
                context.clearRect(0, 0, width, height);
                const canvasImage = new Image();
                canvasImage.src = canvasHistory[currentStep] as string;
                canvasImage.addEventListener('load', () => {
                    context.drawImage(canvasImage, 0, 0);
                });
                setStep(currentStep);
            }
        },
        [canvasHistory, step, width, height]
    );

    const handleOptionClick = useCallback(
        toolName => {
            switch (toolName) {
                case 'canvas_clear':
                    if (step === -1) return;
                    setShowDialog(true);
                    break;
                case 'canvas_save':
                    downloadDrawings();
                    break;
                case 'turn_left_flat':
                    timeTravel('undo');
                    break;
                case 'turn_right_flat':
                    timeTravel('redo');
                    break;
            }
        },
        [downloadDrawings, timeTravel, step]
    );

    const handleCancelDialog = useCallback(() => {
        setShowDialog(false);
        if (showCloseWarning) {
            setShowCloseWarning(false);
        }
    }, [setShowDialog, showCloseWarning, setShowCloseWarning]);

    const handleConfirmDialog = useCallback(() => {
        clearRect({
            x: 0,
            y: 0,
            width,
            height,
        });
        setCanvasHistory([]);
        setStep(-1);
        handleCancelDialog();
        if (!undoButtonRef.current || !redoButtonRef.current) {
            return;
        }
        const undoButton: SVGSVGElement = undoButtonRef.current;
        const redoButton: SVGSVGElement = redoButtonRef.current;
        undoButton.classList.remove('active');
        redoButton.classList.remove('active');
        if (showCloseWarning) {
            setDrawingState(AppState.CLOSED);
            setShowCloseWarning(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        handleCancelDialog,
        clearRect,
        width,
        height,
        showCloseWarning,
        setShowCloseWarning,
        drawingState,
        setDrawingState,
    ]);

    return (
        <React.Fragment>
            <canvas id="canvas" ref={canvasRef} height={height} width={width} />
            <div
                id="toolbox-open"
                style={
                    {
                        borderRadius: showToolbox ? null : 5,
                    } as CSSProperties
                }
            >
                <Icon
                    type={showToolbox ? 'icon-upward_flat' : 'icon-downward_flat'}
                    style={{
                        width: '100%',
                        fontSize: 32,
                    }}
                    clickEvent={toggleToolboxOpen}
                />
            </div>
            <CSSTransition
                in={showToolbox}
                timeout={300}
                classNames="toolbox"
                unmountOnExit
            >
                <div id="toolbox">
                    <span>Options</span>
                    <div className="options">
                        {options.map((option, index) => {
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
                                    clickEvent={(): void =>
                                        handleOptionClick(option)
                                    }
                                />
                            );
                        })}
                    </div>
                    <span>Toolbox</span>
                    <div className="tools">
                        {tools.map((tool, index) => {
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
                                    clickEvent={(e): void =>
                                        handleToolClick(e, tool)
                                    }
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
                            onChange={(e): void =>
                                setLineWidth(parseInt(e.target.value))
                            }
                        />
                    </div>
                    <ol className="colors">
                        {colors.map((color, index) => {
                            return (
                                <li
                                    className={
                                        color === strokeStyle
                                            ? color + ' active'
                                            : color
                                    }
                                    key={index + color}
                                    onClick={(e): void =>
                                        handleSelectColor([e, 'li', color])
                                    }
                                />
                            );
                        })}
                        <input
                            type="color"
                            value={strokeStyle}
                            onChange={(e): void => setStrokeStyle(e.target.value)}
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
                onConfirm={handleConfirmDialog}
                onCancel={handleCancelDialog}
            />
        </React.Fragment>
    );
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;
