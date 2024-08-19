import { FaSpinner } from 'react-icons/fa';
function Loading1() {
    return (
      <div className="fixed top-20 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
          <img
            className="w-36 mb-10"
            alt="charactor"
            src='/img/charactor.png'
          />
          <FaSpinner className="animate-spin w-8 h-8 text-white mb-4" />
          <div className="text-center text-white text-2xl mt-10 mb-20">
            잠시만 기다리면 포트폴리오가 나타납니다!
          </div>
      </div>
    );
  }
  
  export default Loading1;