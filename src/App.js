
import './App.css';
import Canvas from "./Canvas/Canvas"

function App() {
  const text = "Hello world 2";
  return (
    <div className="App">
      Нажмите мышкой вне шара, чтобы толкать.
      <Canvas id="canvas" />
    </div>
  );
}

export default App;
