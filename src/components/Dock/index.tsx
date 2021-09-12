/* eslint-disable max-lines */
import './index.scss';

import React, {
    createContext,
    CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import CalculatorIcon from './image/Calculator.png';
import ChromeIcon from './image/Chrome.png';
import DrawingIcon from './image/Drawing.png';
import FinderIcon from './image/Finder.png';
import LaunchpadIcon from './image/Launchpad.png';
import PreferencesIcon from './image/Preferences.png';
import TerminalIcon from './image/Terminal.png';
/// <reference path="image.d.ts" />

export const DockContext = createContext<any>([]);

const Dock: React.FC = () => {
    const DEFAULT_LENGTH = 68;
    const BOUNCE_ANIMATION_DURATION = 1.5 * 1000;
    const dockRef = useRef<HTMLDivElement>(null);
    const dockIcons = useMemo(() => {
        return [
            FinderIcon,
            LaunchpadIcon,
            PreferencesIcon,
            ChromeIcon,
            TerminalIcon,
            CalculatorIcon,
            DrawingIcon,
        ];
    }, []);
    enum DockPosition {
        BOTTOM = 'bottom',
        TOP = 'top',
        RIGHT = 'right',
        LEFT = 'left',
    }
    interface DockConfig {
        position: DockPosition;
        length: number;
        maxLength: number;
        distanceBetweenIcons: number;
        distanceToScreenEdge: number;
        hoverAnimationEnabled: boolean;
        style: CSSProperties;
    }
    const [dockConfig, setDockConfig] = useState<DockConfig>({
        position: DockPosition.BOTTOM,
        length: DEFAULT_LENGTH,
        maxLength: DEFAULT_LENGTH * 1.5,
        distanceBetweenIcons: 0,
        distanceToScreenEdge: 5,
        hoverAnimationEnabled: true,
        style: {},
    });
    enum AppState {
        RUNNING_IN_BACKGROUND,
        RUNNING_IN_FOREGROUND,
        CLOSED,
    }
    const [preferencesState, setPreferencesState] = useState<AppState>(
        AppState.CLOSED
    );
    const [calculatorState, setCalculatorState] = useState<AppState>(
        AppState.CLOSED
    );
    const [drawingState, setDrawingState] = useState<AppState>(AppState.CLOSED);
    // const [showLaunchpad, setShowLaunchPad] = useState(false);
    const handleDockIconClick = useCallback(
        (iconName: string) => {
            if (!dockRef || !dockRef.current) {
                return;
            }
            const iconElements = dockRef.current.childNodes;
            const iconIndex = dockIcons.indexOf(iconName);
            const clickedIconElement = iconElements[iconIndex] as HTMLDivElement;
            if (iconName === ChromeIcon) {
                window.open('http://www.google.com/');
                return;
            } else if (
                iconName === PreferencesIcon ||
                iconName === CalculatorIcon ||
                iconName === DrawingIcon
            ) {
                let appState: AppState = preferencesState;
                let setAppState: typeof setPreferencesState = setPreferencesState;
                switch (iconName) {
                    case PreferencesIcon:
                        appState = preferencesState;
                        setAppState = setPreferencesState;
                        break;
                    case CalculatorIcon:
                        appState = calculatorState;
                        setAppState = setCalculatorState;
                        break;
                    case DrawingIcon:
                        appState = drawingState;
                        setAppState = setDrawingState;
                        break;
                }
                if (appState === AppState.CLOSED) {
                    clickedIconElement.classList.add('bounce');
                    setTimeout(() => {
                        setAppState(AppState.RUNNING_IN_FOREGROUND);
                        clickedIconElement.classList.remove('bounce');
                    }, BOUNCE_ANIMATION_DURATION);
                } else {
                    setAppState(AppState.RUNNING_IN_FOREGROUND);
                }
                return;
            } else if (iconName === LaunchpadIcon) {
                // setShowLaunchPad(true);
                return;
            }
        },
        [
            dockIcons,
            preferencesState,
            AppState,
            calculatorState,
            drawingState,
            BOUNCE_ANIMATION_DURATION,
        ]
    );
    const computeOffset = useCallback(
        (element: HTMLElement, offset: 'top' | 'left'): number => {
            const elementOffset =
                offset === 'top' ? element.offsetTop : element.offsetLeft;
            if (element.offsetParent === null) {
                return elementOffset;
            }
            return (
                elementOffset +
                computeOffset(element.offsetParent as HTMLElement, offset)
            );
        },
        []
    );
    const handleMousemove = useCallback(
        event => {
            const { clientX, clientY } = event;
            if (!dockRef || !dockRef.current) {
                return;
            }
            const iconElements = dockRef.current.childNodes;
            for (let i = 0; i < iconElements.length; i++) {
                const iconElement = iconElements[i] as HTMLDivElement;
                let x, y;
                if (dockConfig.position === DockPosition.BOTTOM) {
                    x = iconElement.offsetLeft + dockConfig.length / 2 - clientX;
                    y =
                        iconElement.offsetTop +
                        computeOffset(dockRef.current, 'top') +
                        iconElement.offsetHeight / 2 -
                        clientY;
                } else if (dockConfig.position === DockPosition.RIGHT) {
                    x = iconElement.offsetTop + dockConfig.length / 2 - clientY;
                    y =
                        iconElement.offsetLeft +
                        computeOffset(dockRef.current, 'left') +
                        iconElement.offsetWidth / 2 -
                        clientX;
                } else {
                    x = iconElement.offsetTop + dockConfig.length / 2 - clientY;
                    y = iconElement.offsetLeft + dockConfig.length / 2 - clientX;
                }
                let magnifyAnimationScale =
                    1 -
                    Math.sqrt(x * x + y * y) /
                        (iconElements.length * dockConfig.length);
                if (
                    magnifyAnimationScale <
                    dockConfig.length / dockConfig.maxLength
                ) {
                    magnifyAnimationScale = dockConfig.length / dockConfig.maxLength;
                }
                const multiplier = dockConfig.maxLength / dockConfig.length;
                if (dockConfig.maxLength / dockConfig.length) {
                    iconElement.style.height = iconElement.style.width =
                        dockConfig.length * multiplier * magnifyAnimationScale +
                        'px';
                }
            }
        },
        [dockConfig, computeOffset, DockPosition]
    );

    // set the initial position of the dock and the dock items
    const setInitialPosition = useCallback(() => {
        if (!dockRef.current) {
            return;
        }
        if (dockConfig.position === DockPosition.BOTTOM) {
            setDockConfig({
                ...dockConfig,
                style: {
                    height: dockConfig.length * 1 + 12,
                    marginBottom: dockConfig.distanceToScreenEdge * 1,
                },
            });
        } else if (dockConfig.position === DockPosition.TOP) {
            setDockConfig({
                ...dockConfig,
                style: {
                    height: dockConfig.length * 1 + 12,
                    marginTop: dockConfig.distanceToScreenEdge * 1,
                },
            });
        } else if (dockConfig.position === DockPosition.LEFT) {
            setDockConfig({
                ...dockConfig,
                style: {
                    height: dockConfig.length * 1 + 12,
                    marginLeft: dockConfig.distanceToScreenEdge * 1,
                },
            });
        } else if (dockConfig.position === DockPosition.RIGHT) {
            setDockConfig({
                ...dockConfig,
                style: {
                    height: dockConfig.length * 1 + 12,
                    marginRight: dockConfig.distanceToScreenEdge * 1,
                },
            });
        }
        const iconElements = dockRef.current.childNodes;
        for (let i = 0; i < iconElements.length; i++) {
            const iconElement = iconElements[i] as HTMLDivElement;
            iconElement.style.width = iconElement.style.height =
                dockConfig.length + 'px';
        }
    }, [dockConfig, DockPosition]);
    useEffect(setInitialPosition, []);

    const labelRunningAppIcons = (): void => {
        if (!dockRef || !dockRef.current) {
            return;
        }
        const iconElements = dockRef.current.childNodes;
        const preferencesIndex = dockIcons.indexOf(PreferencesIcon);
        const calculatorIndex = dockIcons.indexOf(CalculatorIcon);
        const drawingIndex = dockIcons.indexOf(DrawingIcon);
        const preferencesIconElement = iconElements[
            preferencesIndex
        ] as HTMLDivElement;
        const calculatorIconElement = iconElements[
            calculatorIndex
        ] as HTMLDivElement;
        const drawingIconElement = iconElements[drawingIndex] as HTMLDivElement;
        if (preferencesState !== AppState.CLOSED) {
            preferencesIconElement.classList.add('active');
        } else {
            setTimeout(
                () => preferencesIconElement.classList.remove('active'),
                0.5 * 1000
            );
        }
        if (calculatorState !== AppState.CLOSED) {
            calculatorIconElement.classList.add('active');
        } else {
            setTimeout(
                () => calculatorIconElement.classList.remove('active'),
                0.5 * 1000
            );
        }
        if (drawingState !== AppState.CLOSED) {
            drawingIconElement.classList.add('active');
        } else {
            setTimeout(
                () => drawingIconElement.classList.remove('active'),
                0.5 * 1000
            );
        }
    };

    useEffect(labelRunningAppIcons, [
        AppState,
        calculatorState,
        dockIcons,
        drawingState,
        preferencesState,
    ]);

    const iconStyle = useMemo(() => {
        return dockConfig.position === DockPosition.TOP ||
            dockConfig.position === DockPosition.BOTTOM
            ? {
                  marginLeft: dockConfig.distanceBetweenIcons * 1,
                  marginRight: dockConfig.distanceBetweenIcons * 1,
              }
            : {
                  marginTop: dockConfig.distanceBetweenIcons * 1,
                  marginBottom: dockConfig.distanceBetweenIcons * 1,
              };
    }, [dockConfig, DockPosition]);

    return (
        <React.Fragment>
            <footer className={dockConfig.position} id="AppFooter">
                <div
                    id="Docker"
                    ref={dockRef}
                    className={dockConfig.position}
                    style={dockConfig.style}
                    onMouseLeave={setInitialPosition}
                    onMouseMove={handleMousemove}
                >
                    {dockIcons.map((item, index) => {
                        return (
                            <div
                                className={
                                    [
                                        LaunchpadIcon,
                                        PreferencesIcon,
                                        ChromeIcon,
                                        CalculatorIcon,
                                        DrawingIcon,
                                    ].includes(item)
                                        ? 'pointer DockItem ' + dockConfig.position
                                        : dockConfig.position + ' DockItem'
                                }
                                style={
                                    {
                                        backgroundImage: `url(${item})`,
                                        backgroundPosition: 'center',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        ...iconStyle,
                                    } as CSSProperties
                                }
                                key={index + item}
                                onClick={(): void => handleDockIconClick(item)}
                            />
                        );
                    })}
                </div>
            </footer>
        </React.Fragment>
    );
};

export default Dock;
