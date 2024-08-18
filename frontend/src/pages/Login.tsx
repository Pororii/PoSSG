import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/possgAxios';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (email.trim() !== '' && password.trim() !== '') {
      const loginResult = await login(email, password);

      if (loginResult) {
        navigate('/');
        console.log("token: ", loginResult.data.token);
        localStorage.setItem('token', loginResult.data.token);
      } else {
        console.error('login fail');
      }
    }
  };


  return (
    <>
      <div className='bg-blue-600 w-screen min-h-screen'>
        <section className="dark:bg-gray-900">
          <div className='flex justify-between pt-10 px-20'>
            <div className='text-white text-3xl leading-snug flex flex-col justify-center min-h-screen'>
              <div className='px-10'>
                <p className='font-semibold text-3xl leading-tight'>걱정하지 마세요,<br></br>포트폴리오는 간단합니다.</p><br></br>
                <p className='font-semibold text-2xl leading-tight'>포트폴리오를 한 번에 쓱!</p>
                <p className='font-semibold text-2xl'>
                  <span className='text-3xl font-semibold'>POSSG</span>
                  과 함께 나만의 멋진 포트폴리오를 만들어 보세요.
                </p>
              </div>
              <img
                className="w-80 pl-10 pt-10 mt-20"
                src={`/img/charactor.png`}
                alt="possg-charactor"
              />
            </div>

            <div className="flex flex-col items-end justify-center px-6 py-8">
              <div className="w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                    <p className="mt-10 mb-10 pb-5 text-center text-2xl font-bold">
                      로그인
                    </p>
                    <div className='relative'>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder='이메일을 입력해주세요'
                        value={email}
                        required
                        onChange={handleEmailChange}
                        className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder='비밀번호를 입력해주세요'
                        value={password}
                        required
                        onChange={handlePasswordChange}
                        className={`bg-gray-50 border border-gray-300 text-gray-800 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                      />
                      <div className="flex mt-3 justify-end">
                        <div className="text-sm">
                          <a href="#" className="font-semibold text-gray-500 hover:text-main">
                            비밀번호 찾기
                          </a>
                        </div>
                      </div>
                    </div>
                    <br />
                    <button
                      type="submit"
                      className="w-full flex justify-center rounded-lg bg-blue-600 py-3 px-4 text-lg font-semibold leading-tight text-white shadow-md transition duration-200 ease-in-out cursor-pointer mb-2">
                      로그인
                    </button>
                    <p className="mt-10 text-center text-sm text-gray-500">
                      계정이 없으신가요?{'   '}
                      <a href="/register" className="font-semibold leading-6 text-navy-500 hover:text-navy-400">
                        &nbsp;회원가입하기
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Login;
