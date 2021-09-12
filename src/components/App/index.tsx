import './index.scss';

import React from 'react';

import Dock from '../Dock';
import Header from '../Header';

const App: React.FC = (): JSX.Element => (
    <div className="App">
        <Header />
        <Dock />
    </div>
);

export default App;
