import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Fabricacion from './pages/fabricacion.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <h1>Reto 2 Niger 2.0</h1>
      <div>
        <Fabricacion />
      </div>

    </>
  )
}

export default App
