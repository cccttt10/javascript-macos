import './index.scss';
import 'dayjs/locale/zh-cn';

import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import Icon from '../Icon';

dayjs.locale('en');

const Header: React.FC = () => {
    const timeFormat = 'MMM D, YYYY h:mm A'; // e.g. Aug 16, 2018 8:02 PM
    const [time, setTime] = useState(dayjs().format(timeFormat));
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('Chuntong Gao');

    useEffect(() => {
        const updateTime = setInterval(() => {
            const newTime = dayjs().format(timeFormat);
            setTime(newTime);
        }, 60 * 1000);
        return (): void => window.clearInterval(updateTime);
    });

    return (
        <header className="Header">
            <div className="HeaderLeft">
                <div>
                    <Icon
                        type="icon-apple"
                        style={{
                            fontSize: 16,
                        }}
                    />
                </div>
                <div>
                    {showInput ? (
                        <input
                            autoFocus
                            value={inputValue}
                            onChange={(e): void => setInputValue(e.target.value)}
                            onBlur={(): void => setShowInput(false)}
                        />
                    ) : (
                        <span
                            className="text"
                            onClick={(): void => setShowInput(true)}
                        >
                            {inputValue}
                        </span>
                    )}
                </div>
                <div>File</div>
                <div>Edit</div>
                <div>View</div>
                <div>Go</div>
                <div>Window</div>
                <div>Help</div>
            </div>
            <div className="HeaderRight">
                <a
                    href="https://cgao.info"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Icon
                        type="icon-ren"
                        style={{
                            fontSize: 22,
                        }}
                    />
                </a>
                <a
                    href="https://github.com/chuntonggao"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Icon
                        type="icon-github"
                        style={{
                            fontSize: 22,
                        }}
                    />
                </a>
                <div>{time}</div>
            </div>
        </header>
    );
};

export default Header;
