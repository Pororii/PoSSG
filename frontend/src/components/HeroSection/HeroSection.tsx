/* eslint-disable jsx-a11y/alt-text */
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  function moveLoginBtn(): void {
    navigate('/login')
  }

  return (
    <div className='text-center'>
      <img className='flex w-full' src={`/img/Herosection_possg.png`} />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <button
        type='submit'
        className='relative mx-auto justify-center rounded-lg bg-blue-600 py-4 px-14 font-PretendardVariable text-2xl font-semibold leading-tight text-white shadow-md transition duration-200 ease-in-out cursor-pointer'
        onClick={moveLoginBtn}
      >
        Start PoSSG right now!
      </button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  )
}

export default HeroSection
