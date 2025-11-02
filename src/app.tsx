import { useToken } from "./hooks";
import { Suspension, Home, Authorization } from "./pages";

function App() {
  const { token } = useToken();
  return (
    <div className="banner w-md max-w-md">
      <Authorization>
        {token ? <Home/> : <Suspension/>}
      </Authorization>
    </div>
  )
}

export default App
