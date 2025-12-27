'use client'; // This directive is necessary for using hooks like useState and useEffect

import { useState } from 'react';

// A simple header component
const Header = () => {
    return (
        <header className="bg-gray-800 text-white shadow-md">
            <nav className="container mx-auto flex justify-between items-center p-4">
                <a href="/" className="text-2xl font-bold hover:text-blue-300">
                    WebApp Template
                </a>
            </nav>
        </header>
    );
};

export default function HomePage() {
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFetchHello = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/hello`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: "Hello from frontend!" }),
                cache: 'no-cache' 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApiData(data);
        } catch (error) {
            console.error("Failed to fetch from /api/hello:", error);
            setApiData({ error: "Failed to fetch from /api/hello. Is the backend running and configured correctly?" });
        }
        setLoading(false);
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <div className="p-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
                    <p className="text-lg text-gray-400 mb-6">This content is rendered by Next.js!</p>
                    <button 
                        onClick={handleFetchHello} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Fetch Hello from Backend'}
                    </button>
                    <div className="mt-4 text-left">
                        <h2 className="text-2xl font-bold mb-2">API Response:</h2>
                        <pre className="bg-gray-800 text-white p-4 rounded whitespace-pre-wrap">
                            {JSON.stringify(apiData, null, 2)}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
}