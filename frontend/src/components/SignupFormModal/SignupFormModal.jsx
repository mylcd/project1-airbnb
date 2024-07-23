import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: " Confirm Password Does Not Match Password"
    });
  };

  return (
    <div className='modal'>
      <h1 className='removemargin'>Sign Up</h1>
      <form style={{marginLeft: "10px", marginRight: "10px"}} onSubmit={handleSubmit}>
        <div className='left addwhitespace'>First Name <text className='errors'>{errors.firstName}</text></div>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          type="text"
          name="firstName"
          placeholder='Your first name'
        />
        <div className='left addwhitespace'>Last Name <text className='errors'>{errors.lastName}</text></div>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          type="text"
          name="lastName"
          placeholder='Your last name'
        />
        <div className='left addwhitespace'>Email <text className='errors'>{errors.email}</text></div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          name="email"
          placeholder='example@test.com'
        />
        <div className='left addwhitespace'>Username <text className='errors'>{errors.username}</text></div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          name="username"
          placeholder='Username must be at least 4 characters'
        />
        <div className='left addwhitespace'>Password <text className='errors'>{errors.password}</text></div>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          name="password"
          placeholder='Password must be at least 6 characters'
        />
        <div className='left addwhitespace'>Confirm Password <text className='errors'>{errors.confirmPassword}</text></div>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          name="confirmPassword"
          placeholder='Must be same as password'
        />
        <button className='pagebutton' style={{marginTop: "10px", marginBottom: "10px"}} type="submit"
          disabled={!email || !username || !firstName || !lastName || !password || !confirmPassword
            || username.length < 4 || password.length < 6 || confirmPassword.length < 6
          }>
            Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignupFormModal;
