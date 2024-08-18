import { Button } from 'flowbite-react';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import { getPortfolio, makePortfolio, getRecommend } from '../api/possgAxios';
import Loading1 from '../components/Loading1';
import { MyPortfolio, GroupedPortfolio } from '../interfaces/Interfaces';
import { FaSpinner } from 'react-icons/fa';


const Portfolio = () => {
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState<boolean>(false);  // 통합된 로딩 및 존재 상태 변수
  const [myPortfolio, setMyPortfolio] = useState<MyPortfolio>();
  const [recommend, setRecommend] = useState<string[]>();
  const [isRecommendLoading, setIsRecommendLoading] = useState<boolean>(false); // 직무 추천 로딩 상태 추가
  const [groupedPortfolio, setGroupedPortfolio] = useState<GroupedPortfolio>({});
  const [showHeroSection, setShowHeroSection] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);


  const makePortfolioButton = async () => {
    setIsLoading(true);
    if (token) {
      const successResponse = await makePortfolio(token);
      console.log("포트폴리오 요청 성공");
      if (successResponse && successResponse.data) {
        setMyPortfolio(successResponse.data);
        console.log("Response Data:", successResponse.data);
        setIsLoading(false);
      }
    }
  };

  const fetchFile = async () => {
    if (token) {
      const successResponse = await getPortfolio(token);
      if (successResponse && successResponse.data) {
        setMyPortfolio(successResponse.data);
        console.log(myPortfolio);
        console.log("Response Data:", successResponse.data);
      }
    }
  };

  const fetchRecommend = async () => {
    setIsRecommendLoading(true);
    if (token) {
      const successResponse = await getRecommend(token);
      if (successResponse && successResponse.data) {
        setRecommend(successResponse.data.message.split('직무:').slice(1));
        console.log(successResponse.data.message);
        setIsRecommendLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFile();
    fetchRecommend();
  }, [token]);

  useEffect(() => {
    if (token) {
        setLoggedIn(true);
        setShowHeroSection(false);
    } else {
        setLoggedIn(false);
    }

    fetchFile();
    fetchRecommend();
}, [token]);

  useEffect(() => {
    if (myPortfolio && myPortfolio.length > 0) {
      const groupBySector = myPortfolio.reduce<GroupedPortfolio>((acc, item) => {
        if (!acc[item.sector]) {
          acc[item.sector] = [];
        }
        acc[item.sector].push(item);
        return acc;
      }, {});
  
      setGroupedPortfolio(groupBySector);
    }
  }, [myPortfolio]);


  return (
    <>
      {isLoading ? (
        <Loading1 />
      ) : (
        <>
        {myPortfolio ? (
          <>
          <div className='bg-gray-100 flex w-full justify-center text-gray-700 pt-20 mt-10'>
            <div className='flex flex-1 flex-col md:flex-row max-w-7xl items-center justify-start px-5 md:px-20 xl:px-10 py-10'>
              <div className='flex-1 mx-4 text-gray-700'>
                <div className='text-start mx-auto md:w-[80%]'>
                  <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-lg overflow-hidden">
                    {Object.entries(groupedPortfolio).map(([sector, items]) => (
                      <div key={sector}>
                        <h2 className='text-xl font-bold border-b-2 pb-1 mb-5'>{sector}</h2>
                        {items.map((item) => (
                          <div key={item.id}>
                            {/* <p className='text-md'>{item.folderName}</p> */}
                            <p className='text-m whitespace-pre-wrap break-words'>{item.results.replaceAll("*", "").replaceAll("#", "")}</p>
                            <p className='border-b-2 pb-5 mb-5'></p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        ) : (
          <div className='bg-gray-100 flex w-screen justify-center self-stretch text-gray-700'>
            <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-20 pb-1'>
              <div className='flex-1 flex-grow-4 self-start max-w-none prose-lg mx-4 text-gray-700'>
                <div className='text-center mx-auto md:w-[80%]'>
                  <div className="bg-gray-50 border border-gray-200 text-xs font-normal rounded-md mt-10 px-3 py-5 mx-3 text-center">
                    <div className="flex justify-center items-center">
                      <img
                        alt="Character"
                        className="w-44 pt-20"
                        src="/img/charactor.png"
                      />
                    </div>
                    <p className='font-semibold text-lg'>포트폴리오가 없어요!</p>
                    <br></br><br></br>
                    <div className="flex justify-center items-center pb-20">
                      <Button
                        className='tracking-tighter border-none font-bold px-3 bg-blue-600 hover:bg-blue-700'
                        onClick={makePortfolioButton}
                      >
                        <p className='text-base'>3초만에 나만의 포트폴리오 만들기</p>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}  
        </>
      )}

      {recommend ? (
        <div className='flex w-screen justify-center self-stretch pb-20 pt-5 bg-gray-100 '>
          <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-10 pb-20'>
            <div className="mt-4 pl-10 pr-10 pt-10 pb-10 bg-blue-100 shadow-lg rounded-2xl text-left text-lg mx-auto md:w-[80%]">
              {recommend.map((job, index) => (
                <div key={index}>
                  <strong>추천 직무는 <span className='mx-2 text-blue-600 text-xl'>{job.split('이유:')[0]}</span>입니다</strong>
                  <p className='mt-2 mb-5'>{job.split('이유:')[1]}</p>
                  {index < recommend.length - 1 && <hr />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex w-screen justify-center self-stretch text-gray-700 bg-gray-100 '>
          <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-10 pb-20'>
            <div className='flex-1 flex-grow-4 self-start max-w-none prose-lg mx-4 text-gray-700'>
              <div className='text-center mx-auto md:w-[80%]'>
                <div className="bg-gray-50 border border-gray-200 text-xs font-PretendardVariable font-normal rounded-md mt-10 px-3 py-5 mx-3 text-center">
                  <div className="flex justify-center items-center">
                    <img alt="logo" className="w-36 pt-20 pb-10" src="/img/logo_black.png" />
                  </div>
                  <p className='font-semibold text-lg'>포트폴리오를 기반으로 직무 추천을 해드려요!</p>
                  <br /><br />
                  <div className="flex justify-center items-center pb-20">
                    <Button className='tracking-tighter border-none font-bold px-3 bg-blue-600 hover:bg-blue-700'>
                      <FaSpinner className="animate-spin w-8 h-8 text-white py-2 mr-1" />
                      <p className='text-base py-2'>잠시만 기다려주세요!</p>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Portfolio;
