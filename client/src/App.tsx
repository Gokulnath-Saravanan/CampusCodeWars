import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CodeEditor } from './components/CodeEditor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={
                <div className="p-8">
                  <div className="mx-auto max-w-4xl">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">Campus Code Wars</h1>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                      <h2 className="mb-4 text-xl font-semibold text-gray-800">Code Editor</h2>
                      <CodeEditor initialValue="// Write your code here" language="javascript" />
                    </div>
                  </div>
                </div>
              }
            />
            {/* Add more routes here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
