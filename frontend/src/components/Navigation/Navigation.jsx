import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import './Navigation.css';
import starLogo from './Star.jpg';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <div className='usermenu'>
        <div><a href='/spots/new'>Create a New Spot</a></div>
        <ProfileButton user={sessionUser} />
      </div>
    );
  } else {
    sessionLinks = (
      <div className='usermenu'>
        <OpenModalButton className='sessionbutton'
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton className='sessionbutton'
          buttonText="Sign Up"
          modalComponent={<SignupFormModal />}
        />
      </div>
    );
  }

  return (
    <div className='navbar'>
      <div className='container'>
        <NavLink to="/"><div className='logo'>
          <img className='logo' src={starLogo}></img>
          <text className='logo'>Mi&apos;s BNB</text>
        </div></NavLink>
      </div>
      {isLoaded && sessionLinks}
    </div>

  );
}

export default Navigation;
