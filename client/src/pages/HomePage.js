import React, { useState } from 'react'
import logo from '../images/Logo2.png'
import { v4 as uuidV4 } from 'uuid'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const HomePage = () => {

    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [userName, setUserName] = useState("");

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        // console.log(roomId);
        toast.success("New Room Created Successfully");
    }

    const joinRoom = (e) =>{
        e.preventDefault();
        if(!roomId || !userName){
            toast.error("Please enter Room ID or Username");
            return ;
        }
        else{
            navigate(`/editor/${roomId}`, {
                state: {
                    userName,
                }
            });
        }
    }

    const handleInputEnter = (e) => {
        if(e.code === 'Enter'){
            joinRoom(e);
        }
    }

    return (
        <>
            <div className="homePageWrapper flex flex-col justify-center items-center h-[100vh]">
                <div className="formWrapper flex flex-col justify-center items-start h-auto  bg-[#3f4257] p-8 my-auto">
                    <img src={logo} alt="Logo" />
                    <h4 className='mainLabel  text-white'>Paste Invitation Code ID</h4>
                    <div className="inputGroup flex flex-col my-4 w-full justify-center items-center ">
                        <input type="text" className='inputBox w-full p-2 rounded-md' placeholder="ROOM ID" onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter}/>
                        <input type="text" className='inputBox w-full my-4 p-2 rounded-md' placeholder="USERNAME" onChange={(e) => setUserName(e.target.value)} onKeyUp={handleInputEnter}/>
                        <button type='primary' className='btn joinBtn text-white rounded-md bg-[#FF3131] w-full p-2' onClick={joinRoom}>Join</button>
                    </div>
                    <span className=' text-white'>If you don't have Invitation Code, then create
                        <a href="/" className='link text-white font-bold cursor-pointer' onClick={createNewRoom}> <u>New Room</u></a>
                    </span>
                </div>
                <footer className='fixed bottom-0 py-4'>
                    <h4>Built with ❤️ by <a href='https://www.github.com/romit-2003-github'>Romit Soni</a></h4>
                </footer>
            </div>
        </>
    )
}

export default HomePage
