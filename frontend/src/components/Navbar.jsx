import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <a className="navbar-brand" href="/">
        CodeFlow
      </a>
      <button className='btn btn-primary'>
          Analyze Repository
      </button>
    </nav>
  );
}

export default Navbar;
