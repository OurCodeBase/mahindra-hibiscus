import { useToken } from "./hooks";
import { Suspension, Home, Authentication } from "./pages";

function App() {
  const { token } = useToken();
  return (
    <div className="banner w-md max-w-md">
      <Authentication>
        {token ? <Home/> : <Suspension/>}
      </Authentication>
    </div>
  )
}

export default App
