import './index.scss';

import React from 'react';

import Dock from '../Dock';
import Header from '../Header';
import Main from '../Main';

const App: React.FC = (): JSX.Element => (
    <div className="App">
        <Header />
        <Main />
        <Dock />
    </div>
);

export default App;
