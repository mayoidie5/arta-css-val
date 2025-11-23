import { useState } from 'react';
import { Button } from './ui/button';
import { Delete, Space } from 'lucide-react';

interface TouchKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  keyboardType?: 'text' | 'number' | 'email';
}

export function TouchKeyboard({ onKeyPress, onBackspace, onClose, keyboardType = 'text' }: TouchKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [isCapsLock, setCapsLock] = useState(false);

  const handleShift = () => {
    setIsShift(!isShift);
  };

  const handleCapsLock = () => {
    setCapsLock(!isCapsLock);
    setIsShift(false);
  };

  const handleKeyPress = (key: string) => {
    let finalKey = key;
    
    if (keyboardType === 'text') {
      if (isShift || isCapsLock) {
        finalKey = key.toUpperCase();
      } else {
        finalKey = key.toLowerCase();
      }
      
      // Reset shift after key press (but not caps lock)
      if (isShift && !isCapsLock) {
        setIsShift(false);
      }
    }
    
    onKeyPress(finalKey);
  };

  // Number keyboard layout
  if (keyboardType === 'number') {
    return (
      <div className="bg-white border-t-4 border-primary shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <Button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="h-16 text-2xl bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-md active:scale-95 transition-all"
                variant="outline"
              >
                {num}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={onBackspace}
              className="h-16 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 shadow-md active:scale-95 transition-all"
              variant="outline"
            >
              <Delete className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => handleKeyPress('0')}
              className="h-16 text-2xl bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-md active:scale-95 transition-all"
              variant="outline"
            >
              0
            </Button>
            <Button
              onClick={onClose}
              className="h-16 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 shadow-md active:scale-95 transition-all"
              variant="outline"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Email keyboard has @ and .com
  const emailRow4 = keyboardType === 'email' 
    ? ['@', ' ', '.com', '.'] 
    : [' '];

  // Text/Email keyboard layout
  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="bg-white border-t-4 border-primary shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Numbers Row */}
        <div className="flex gap-1 justify-center">
          {numbers.map((num) => (
            <Button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-12 w-12 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              {num}
            </Button>
          ))}
        </div>

        {/* First Row */}
        <div className="flex gap-1 justify-center">
          {row1.map((key) => (
            <Button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-14 w-12 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              {isShift || isCapsLock ? key.toUpperCase() : key}
            </Button>
          ))}
        </div>

        {/* Second Row */}
        <div className="flex gap-1 justify-center">
          {row2.map((key) => (
            <Button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-14 w-12 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              {isShift || isCapsLock ? key.toUpperCase() : key}
            </Button>
          ))}
        </div>

        {/* Third Row */}
        <div className="flex gap-1 justify-center items-center">
          <Button
            onClick={handleShift}
            className={`h-14 px-4 bg-white hover:bg-blue-50 border-2 shadow-sm active:scale-95 transition-all ${
              isShift ? 'border-blue-500 bg-blue-100' : 'border-primary/20'
            }`}
            variant="outline"
          >
            ⇧ Shift
          </Button>
          {row3.map((key) => (
            <Button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-14 w-12 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              {isShift || isCapsLock ? key.toUpperCase() : key}
            </Button>
          ))}
          <Button
            onClick={onBackspace}
            className="h-14 px-4 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 shadow-sm active:scale-95 transition-all"
            variant="outline"
          >
            <Delete className="w-5 h-5" />
          </Button>
        </div>

        {/* Fourth Row */}
        <div className="flex gap-1 justify-center items-center">
          <Button
            onClick={handleCapsLock}
            className={`h-14 px-4 bg-white hover:bg-blue-50 border-2 shadow-sm active:scale-95 transition-all ${
              isCapsLock ? 'border-blue-500 bg-blue-100' : 'border-primary/20'
            }`}
            variant="outline"
          >
            ⇪ Caps
          </Button>
          
          {keyboardType === 'email' ? (
            <>
              <Button
                onClick={() => handleKeyPress('@')}
                className="h-14 px-4 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
                variant="outline"
              >
                @
              </Button>
              <Button
                onClick={() => handleKeyPress(' ')}
                className="h-14 flex-1 bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
                variant="outline"
              >
                <Space className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handleKeyPress('.')}
                className="h-14 px-4 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
                variant="outline"
              >
                .
              </Button>
              <Button
                onClick={() => {
                  onKeyPress('.com');
                }}
                className="h-14 px-4 text-lg bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
                variant="outline"
              >
                .com
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleKeyPress(' ')}
              className="h-14 flex-1 bg-white hover:bg-blue-50 text-primary border-2 border-primary/20 hover:border-primary shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              <Space className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="h-14 px-6 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 shadow-sm active:scale-95 transition-all"
            variant="outline"
          >
            ✓ Done
          </Button>
        </div>
      </div>
    </div>
  );
}
