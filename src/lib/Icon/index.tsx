import './index.scss';

import React from 'react';
import { CSSProperties, RefObject } from 'react';

const scriptElem = document.createElement('script');
scriptElem.src = '//at.alicdn.com/t/font_1848517_ds8sk573mfk.js';
document.body.appendChild(scriptElem);

interface PropsTypes {
    className?: string;
    type: string;
    style?: CSSProperties;
    svgRef?: RefObject<SVGSVGElement>;
    // eslint-disable-next-line no-unused-vars
    clickEvent?: (T: any) => void;
}

const Icon: React.FC<PropsTypes> = ({
    className,
    type,
    style,
    svgRef,
    clickEvent,
}: PropsTypes): JSX.Element => {
    return (
        <svg
            ref={svgRef}
            className={className ? 'icon-font ' + className : 'icon-font'}
            aria-hidden="true"
            style={style as CSSProperties}
            onClick={clickEvent}
        >
            <use xlinkHref={`#${type}`} />
        </svg>
    );
};

export default Icon;
