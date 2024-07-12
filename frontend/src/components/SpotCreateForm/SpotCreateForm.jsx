import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSpot } from '../../store/spot';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import "./SpotCreateForm.css";

function SpotCreateForm() {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLatitude] = useState('');
  const [lng, setLongitude] = useState('');

  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const [previewImg, setPriviewImg] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [image3, setImage3] = useState('');
  const [image4, setImage4] = useState('');

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleCountry = e => setCountry(e.target.value);
  const handleAddress = e => setAddress(e.target.value);
  const handleCity = e => setCity(e.target.value);
  const handleState = e => setState(e.target.value);
  const handleLatitude = e => setLatitude(e.target.value);
  const handleLongitude = e => setLongitude(e.target.value);

  const handleDescription = e => setDescription(e.target.value);
  const handleName = e => setName(e.target.value);
  const handlePrice = e => setPrice(e.target.value);

  const handlePriviewImg = e => setPriviewImg(e.target.value);
  const handleImage1 = e => setImage1(e.target.value);
  const handleImage2 = e => setImage2(e.target.value);
  const handleImage3 = e => setImage3(e.target.value);
  const handleImage4 = e => setImage4(e.target.value);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if(address.length == 0) newErrors.address = "Street address is required";
    if(city.length == 0) newErrors.city = "City is required";
    if(state.length == 0) newErrors.state = "State is required";
    if(country.length == 0) newErrors.country = "Country is required";
    if(lat.length == 0) newErrors.lat = "Latitude is required";
    else if(isNaN(lat)) newErrors.lat = "Latitude must be a number";
    else if(parseFloat(lat) < -90 || parseFloat(lat) > 90) newErrors.lat = "Latitude must be within -90 and 90";
    if(lng.length == 0) newErrors.lng = "Longitude is required";
    else if(isNaN(lng)) newErrors.lng = "Longitude must be a number";
    else if(parseFloat(lng) < -180 || parseFloat(lng) > 180) newErrors.lat = "Longitude must be within -180 and 180";
    if(description.length < 30) newErrors.description = "Description needs a minimum of 30 characters";
    if(name.length == 0) newErrors.name = "Name is required";
    if(price.length == 0) newErrors.price = "Price is required";
    if(previewImg.length == 0) newErrors.previewImg = "Preview image is required";
    setErrors(newErrors);

    if(Object.values(newErrors).length === 0) {
      const newSpot = {
        address, city, state, country, lat, lng, name, description, price,
        previewImg, image1, image2, image3, image4
      };
      const { id } = await dispatch(createSpot(newSpot));
      navigate(`/spots/${id}`);
    }
  }

  useEffect(() => {
    const newErrors = {...errors};
    if(country.length > 0) delete newErrors.country;
    if(address.length > 0) delete newErrors.address;
    if(city.length > 0) delete newErrors.city;
    if(state.length > 0) delete newErrors.state;
    if(lng.length > 0 && !isNaN(lng) && parseFloat(lng) >= -180 && parseFloat(lng) <= 180) delete newErrors.lng;
    if(lat.length > 0 && !isNaN(lat) && parseFloat(lat) >= -90 && parseFloat(lat) <= 90) delete newErrors.lat;
    if(description.length >= 30) delete newErrors.description;
    if(name.length > 0) delete newErrors.name;
    if(price.length > 0) delete newErrors.price;
    if(previewImg.length > 0) delete newErrors.previewImg;
    setErrors(newErrors);
  }, [country, address, city, state, lng, lat, description, name, price, previewImg]);

  let spotForm;
  if (sessionUser) {
    spotForm = (
    <form
      className="spot-create-form"
      onSubmit={handleSubmit}
    >
      <h2>Create a New Spot</h2>
      <h3>Where&apos;s your place located?</h3>
      <p>Guests will only get your exact address once they booked a reservation.</p>
      <div>Country <text className='errors'>{errors.country}</text></div>
      <input
          value={country}
          onChange={handleCountry}
          type="text"
          name="country"
      />
      <div>Street Address <text className='errors'>{errors.address}</text></div>
      <input
          value={address}
          onChange={handleAddress}
          type="text"
          name="address"
      />
      <div>City <text className='errors'>{errors.city}</text></div>
      <input
          value={city}
          onChange={handleCity}
          type="text"
          name="city"
      />
      <div>State <text className='errors'>{errors.state}</text></div>
      <input
          value={state}
          onChange={handleState}
          type="text"
          name="state"
      />
      <div>Latitude <text className='errors'>{errors.lat}</text></div>
      <input
          value={lat}
          onChange={handleLatitude}
          type="text"
          name="latitude"
      />
      <div>Longitude <text className='errors'>{errors.lng}</text></div>
      <input
          value={lng}
          onChange={handleLongitude}
          type="text"
          name="longitude"
      />
      <h3>Describe your place to guests</h3>
      <p>Mention the best features of your space, any special amentities like fast wif or parking, and what you love about the neighborhood.</p>
      <input className='large-input'
          value={description}
          onChange={handleDescription}
          type="text"
          name="description"
      />
      <div><text className='errors'>{errors.description}</text></div>
      <h3>Create a title for your spot</h3>
      <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>
      <input
          value={name}
          onChange={handleName}
          type="text"
          name="name"
      />
      <div><text className='errors'>{errors.name}</text></div>
      <h3>Set a base price for your spot</h3>
      <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
      <div>$<input
          value={price}
          onChange={handlePrice}
          type="text"
          name="price"
      />
      <div><text className='errors'>{errors.price}</text></div></div>
      <h3>Liven up your spot with photos</h3>
      <p>Submit a link to at least one photo to publish your spot.</p>
      <input
          value={previewImg}
          onChange={handlePriviewImg}
          type="text"
          name="previewImage"
      />
      <div><text className='errors'>{errors.previewImg}</text></div>
      <input
          value={image1}
          onChange={handleImage1}
          type="text"
          name="image1"
      />
      <div><text className='errors'>{errors.image1}</text></div>
      <input
          value={image2}
          onChange={handleImage2}
          type="text"
          name="image2"
      />
      <div><text className='errors'>{errors.image2}</text></div>
      <input
          value={image3}
          onChange={handleImage3}
          type="text"
          name="image3"
      />
      <div><text className='errors'>{errors.image3}</text></div>
      <input
          value={image4}
          onChange={handleImage4}
          type="text"
          name="image4"
      />
      <div><text className='errors'>{errors.image4}</text></div>
      <button
        disabled={Object.values(errors).length}
        type="submit"
      >
        Create Spot
      </button>
    </form>
    );
  }
  else {
    spotForm = (
      <>
        <div>You need to <OpenModalButton
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
        /> first.</div>
      </>
    )
  }

  return (
    spotForm
  );
}

export default SpotCreateForm;
