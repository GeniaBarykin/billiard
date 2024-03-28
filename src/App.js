
import './App.css';
import Canvas from "./Canvas/Canvas"

function App() {
  return (
    <div className="App">
      Водите нажатой мышкой вне шара, чтобы толкать.
      <Canvas id="canvas" />
      Нажмите на шар, чтобы ввести цвет.
    </div>
  );
}

export default App;
