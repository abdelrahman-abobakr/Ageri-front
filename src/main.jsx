import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { App as AntdApp } from 'antd';


createRoot(document.getElementById('root')).render(<AntdApp>
  <App />
</AntdApp>)
