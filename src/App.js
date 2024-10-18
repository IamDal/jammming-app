import './App.css';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>
        Ja<span className='App-span'>mmm</span>ing
      </h1>
      </header>
      <SearchBar />
      <SearchResults />
    </div>
  );
}

export default App;
