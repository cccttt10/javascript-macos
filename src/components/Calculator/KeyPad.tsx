import './index.scss';

import React, { useCallback, useEffect, useState } from 'react';

const KEYS = [
    'AC',
    '+/-',
    '%',
    '÷',
    '7',
    '8',
    '9',
    '×',
    '4',
    '5',
    '6',
    '-',
    '1',
    '2',
    '3',
    '+',
    '0',
    '.',
    '=',
];

const KeyPad: React.FC = () => {
    const [keys, setKeys] = useState<string[]>(KEYS);
    const [operands, setOperands] = useState({ operand1: '', operand2: '' });
    const [operator, setOperator] = useState('');
    const [result, setResult] = useState('0'); // the displayed result

    // e.g. covert 70000000 to 7e+7
    // e.g. convert 0.0000007 to 7e-7
    const convertToScientificNotation = (text: string): string => {
        text = /\.\d+?0+$/g.test(text) ? text.replace(/0+$/g, '') : text;
        return text
            .replace(/\.0+$/g, '')
            .replace(/\.0+e/, 'e')
            .replace(/0+e/, 'e')
            .replace(/\.$/, '');
    };

    // add new digit or decimal to one of the operands
    // remember to update result
    const addNewDigitToOperand = useCallback(
        (operand: 'operand1' | 'operand2', newDigit: string): void => {
            const updatedOperands = {
                operand1:
                    operand === 'operand1' &&
                    (operands[operand] !== '0' || newDigit === '.')
                        ? operands[operand] + newDigit
                        : operands.operand1,
                operand2:
                    operand === 'operand2' &&
                    (operands[operand] !== '0' || newDigit === '.')
                        ? operands[operand] + newDigit
                        : operands.operand2,
            };
            setOperands(updatedOperands);
            setResult(
                updatedOperands[operand].length > 6
                    ? convertToScientificNotation(
                          parseFloat(updatedOperands[operand]).toPrecision(6)
                      )
                    : updatedOperands[operand]
            );
        },
        [operands]
    );

    const evaluateResult = useCallback(
        (operand1: string, operand2: string, operator: string): string => {
            const parsedOperand1: number = parseFloat(operand1);
            const parsedOperand2: number = parseFloat(operand2);
            const parsedResult: number = parseFloat(result);
            if (operator === '+') {
                return (parsedOperand1 + parsedOperand2).toPrecision(6);
            } else if (operator === '-') {
                return (parsedOperand1 - parsedOperand2).toPrecision(6);
            } else if (operator === '×') {
                return (parsedOperand1 * parsedOperand2).toPrecision(6);
            } else if (operator === '÷') {
                if (parsedOperand2 === 0) {
                    return 'NAN';
                }
                return (parsedOperand1 / parsedOperand2).toPrecision(6);
            } else if (operator === '+/-') {
                return (-(parsedResult || parsedOperand1) || 0).toPrecision(6);
            } else if (operator === '%') {
                return ((parsedResult || parsedOperand1) / 100 || 0).toPrecision(6);
            }
            return result;
        },
        [result]
    );

    const handleClickButton = useCallback(
        event => {
            if (event.target instanceof HTMLButtonElement) {
                const buttonText = event.target.textContent;
                if ('0123456789.'.indexOf(buttonText) >= 0) {
                    const keys = [...KEYS];
                    keys.shift();
                    keys.unshift('C');
                    setKeys(keys);
                    operator
                        ? addNewDigitToOperand('operand2', buttonText)
                        : addNewDigitToOperand('operand1', buttonText);
                } else if ('+-×÷'.indexOf(buttonText) >= 0) {
                    setOperands({
                        operand1: operands.operand1 ? operands.operand1 : result,
                        operand2: operands.operand2,
                    });
                    setOperator(buttonText);
                } else if ('='.indexOf(buttonText) >= 0) {
                    if (operands.operand1 && operands.operand2) {
                        setResult(
                            convertToScientificNotation(
                                evaluateResult(
                                    operands.operand1,
                                    operands.operand2,
                                    operator
                                )
                            )
                        );
                        setOperands({ operand1: '', operand2: '' });
                        setOperator('');
                    }
                } else if (buttonText === 'C') {
                    setResult('0');
                    setOperands({ operand1: '', operand2: '' });
                    setOperator('');
                    setKeys(KEYS);
                } else if (buttonText === '+/-' || buttonText === '%') {
                    if (operands.operand1 || result) {
                        const updatedResult = convertToScientificNotation(
                            evaluateResult(
                                operands.operand1,
                                operands.operand2,
                                buttonText
                            )
                        );
                        const updatedOperands = operands.operand2
                            ? {
                                  operand1: operands.operand1,
                                  operand2: updatedResult,
                              }
                            : { operand1: updatedResult, operand2: '' };
                        setOperands(updatedOperands);
                        setResult(updatedResult);
                    }
                }
            }
        },
        [operator, operands, result, addNewDigitToOperand, evaluateResult]
    );
    useEffect(() => setResult(result), [result]);

    return (
        <div className="calculator-wrapper">
            <div className="output-wrapper">
                <div className="output">
                    <span>{result}</span>
                </div>
            </div>
            <div className="row" onClick={(e): void => handleClickButton(e)}>
                {keys.map((text, index) => {
                    return (
                        <button
                            className={
                                [0, 1, 2].includes(index)
                                    ? 'dark button text-'
                                    : [3, 7, 11, 15, 18].includes(index)
                                    ? 'orange button text-'
                                    : 'button text-' + text
                            }
                            key={text}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default KeyPad;
