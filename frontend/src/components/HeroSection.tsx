import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();

  function moveLoginBtn(e: FormEvent): void {
    navigate('/login');
  }

  return (
    <div className='text-center'>
        <img
            className="flex w-full"
            src={`/img/Herosection_possg.png`}
        />
        <br></br><br></br><br></br><br></br>
        <button type="submit" className="relative mx-auto justify-center rounded-lg bg-blue-600 py-4 px-14 font-PretendardVariable text-2xl font-semibold leading-tight text-white shadow-md transition duration-200 ease-in-out cursor-pointer" onClick={moveLoginBtn}>포쓱 시작하기</button>
        <br></br><br></br><br></br><br></br><br></br>
    </div>
  );
}

export default HeroSection;