import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { getAllSpotsCurrent } from '../../store/spot';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    await dispatch(sessionActions.login({ credential, password }))

      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
    dispatch(getAllSpotsCurrent())
      .then(closeModal);
  };

  const handleDemoSubmit = () => {
    return dispatch(sessionActions.login({ credential: "demo@user.io", password: "password" }))
      .then(closeModal);
  }

  return (
    <div className='modal'>
      <h1 className='removemargin'>Log In</h1>
      <form onSubmit={handleSubmit}>
        <input
          className='center'
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          placeholder='Username or Email'
          required
        />
        <input
          className='center'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
        />
        {errors.credential && (
          <p className='errors removemargin'>{errors.credential}</p>
        )}
        <button className='pagebutton center' type="submit"
          disabled={!credential || !password || credential.length < 4 || password.length < 6}>
            Log In
        </button>
      </form>
      <button className='sessionbutton' style={{fontSize: "16px"}} onClick={handleDemoSubmit}>Log in as Demo User</button>
    </div>
  );
}

export default LoginFormModal;
