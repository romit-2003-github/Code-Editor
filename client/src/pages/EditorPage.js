import React, { useState, useRef, useEffect } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor'
import logo from '../images/Logo2.png';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Modal } from 'antd';
import Loading from '../components/Loading';
const { GoogleGenerativeAI } = require("@google/generative-ai");

const EditorPage = () => {
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const generateAnswer = async () => {
    try {
      setLoading(true);
      const result = await model.generateContent(question);
      const response = await result.response;
      const text = await response.text();
      const formattedText = text.split(';');
      setAnswer(formattedText);
      setLoading(false);
    }
    catch (err) {
      console.log(err);
    }
  }
  const modalStyle = {
    color: '#FFFFFF',
    backgroundColor: "#000000"
  }
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    setAnswer("");
    setQuestion("");
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };


  useEffect(() => {
    const init = async () => {
      if (!socketRef.current) {
        socketRef.current = await initSocket();
      }

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error("Connection Failed, try again later");
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName: location.state?.userName
      });

      // Listening for joined members
      socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId }) => {
        if (userName !== location.state?.userName) {
          toast.success(`${userName} joined the room`);
          console.log(`${userName} joined with socketId ${socketId}`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId
        });
      })

      // Listening for disconnected members
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} has left the room`);
        setClients((prevClients) => prevClients.filter((client) => client.socketId !== socketId));
      })
    };
    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off('connect_error');
        socketRef.current.off('connect_failed');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, []);

  if (!location.state) {
    return <Navigate to="/" />
  }
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  const leaveRoom = () => {
    reactNavigator('/');
  }
  return (
    <>
      <div className="MainWrapper flex flex-col lg:flex-row md:flex-row justify-between h-full items-stretch">
        <div className="aside w-[15vw] flex flex-col text-white text-center border-r-2 border-black">
          <div className="asideItems flex flex-col flex-grow justify-between items-center">
            <img src={logo} alt="Logo" className='w-full h-[90px] border-b-2 border-black  mb-4' />
            <h3>Connected Users</h3>
            <div className="clientList flex justify-center flex-wrap m-2">
              {clients.map((client) => (
                <Client key={client.socketId} userName={client.username} />
              ))}
            </div>
            <div className="asideButton flex flex-col w-[14vw] mt-auto mb-4">
              <button className='bg-blue-800 w-full p-1 rounded-md my-2' onClick={showModal}>Ask AI</button>
              <button className='bg-blue-800 w-full p-1 rounded-md' onClick={copyRoomId}>Copy Room ID</button>
              <button className='bg-[#FF3131] w-full p-1 my-2 rounded-md' onClick={leaveRoom}>Leave Room</button>
            </div>
          </div>
        </div>
        <div className="editorWrapper bg-[#FFFFFF] w-full lg:w-[85vw] h-[100vh] min-h-[100vh]">
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => { codeRef.current = code }} />
        </div>
        <Modal open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
          height={1000}
        >
          <h1 className='text-2xl text-center font-bold'>Ask AI Anything</h1>
          <div className='flex flex-col items-center justify-center w-full h-full p-4'>
            <input type='text' placeholder='Ask any Coding Question here' className='w-full h-10 p-2 border-2 border-black rounded-md mb-4' value={question} onChange={(e) => setQuestion(e.target.value)} />
            <button className='bg-blue-800 text-white w-full h-10 rounded-md' onClick={generateAnswer} disabled={loading}>Generate Answer</button>
            {loading && <Loading />}
          </div>
          {(answer.length > 0) && <p className='bg-[#1c1e29] p-4 text-white'>{answer}</p>}

        </Modal>
      </div>
    </>
  )
}

export default EditorPage
