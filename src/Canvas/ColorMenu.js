import React, { useState } from 'react';


function ColorMenu({childToParent, parentToChild}) {
  const [inputValue, setInputValue] = useState(parentToChild.color);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
    return (
      <ul className="color_menu" text-align='center'>
        <div>Input a new color for the ball</div>
        <input value={inputValue} onChange={handleInputChange}></input>
        <button onClick={() => childToParent({id: parentToChild.id ,color:inputValue})}>Ok</button>
      </ul>
    );
  }

  export default ColorMenu;