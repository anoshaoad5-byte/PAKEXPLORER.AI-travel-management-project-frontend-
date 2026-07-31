import { NavLink } from 'react-router-dom'
import '../styles/navbar.css'

function NavMenu() {
  return (
    <div className="nav-menu">
      <NavLink to="/hotels" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Hotels
      </NavLink>
      <NavLink to="/transportation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Transportation
      </NavLink>
      <NavLink to="/budget-calculator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        💰 Budget Calculator
      </NavLink>
      <NavLink to="/location" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        📍 Nearby
      </NavLink>
      <NavLink to="/translator" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        🌐 Translator
      </NavLink>
      <NavLink to="/booking" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        🧳 Book Now
      </NavLink>
      <NavLink to="/reviews" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
  ⭐ Reviews
</NavLink>
 
    </div>
  )
}

export default NavMenu