import React from 'react'
import Avatar from 'react-avatar'
const Client = ({userName}) => {
  return (
    <div>
      <div className='client m-2 flex flex-col justify-center items-center'>
        <Avatar name={userName} size={50} round='10px'/>
        <span className='userAvatar text-[12px] m-2'>{userName}</span>
      </div>
    </div>
  )
}

export default Client
