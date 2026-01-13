import './NumericKeypad.css';

interface NumericKeypadProps {
    onDigit: (digit: string) => void;
    onClear: () => void;
    onBackspace: () => void;
    onSubmit: () => void;
    disabled?: boolean;
}

/**
 * NumericKeypad - Industrial tactile number pad
 * Designed for fat-finger use in dirty/noisy environments
 * Minimum 80px button height with generous touch targets
 */
export function NumericKeypad({
    onDigit,
    onClear,
    onBackspace,
    onSubmit,
    disabled = false,
}: NumericKeypadProps) {
    const handleDigitClick = (digit: string) => {
        if (!disabled) {
            onDigit(digit);
        }
    };

    return (
        <div className="numeric-keypad">
            {/* Row 1: 7 8 9 */}
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('7')}
                disabled={disabled}
            >
                7
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('8')}
                disabled={disabled}
            >
                8
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('9')}
                disabled={disabled}
            >
                9
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--backspace"
                onClick={onBackspace}
                disabled={disabled}
                aria-label="Borrar último dígito"
            >
                ⌫
            </button>

            {/* Row 2: 4 5 6 */}
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('4')}
                disabled={disabled}
            >
                4
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('5')}
                disabled={disabled}
            >
                5
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('6')}
                disabled={disabled}
            >
                6
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--clear"
                onClick={onClear}
                disabled={disabled}
                aria-label="Borrar todo"
            >
                C
            </button>

            {/* Row 3: 1 2 3 */}
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('1')}
                disabled={disabled}
            >
                1
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('2')}
                disabled={disabled}
            >
                2
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('3')}
                disabled={disabled}
            >
                3
            </button>
            {/* Enter button spans 2 rows */}
            <button
                type="button"
                className="keypad-btn keypad-btn--enter"
                onClick={onSubmit}
                disabled={disabled}
                aria-label="Registrar peso"
            >
                <span className="enter-icon">✓</span>
                <span className="enter-text">ENTER</span>
            </button>

            {/* Row 4: 0 (double width) . */}
            <button
                type="button"
                className="keypad-btn keypad-btn--digit keypad-btn--zero"
                onClick={() => handleDigitClick('0')}
                disabled={disabled}
            >
                0
            </button>
            <button
                type="button"
                className="keypad-btn keypad-btn--digit"
                onClick={() => handleDigitClick('.')}
                disabled={disabled}
            >
                .
            </button>
        </div>
    );
}

export default NumericKeypad;
