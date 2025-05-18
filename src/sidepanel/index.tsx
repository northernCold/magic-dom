import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SidePanel from './side-panel'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SidePanel />
    </StrictMode>,
)
