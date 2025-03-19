import React from 'react'
import { useState,useContext } from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {UserContext} from '../context/user.context.jsx'
import axios from '../config/axios.jsx';

const Login = () => {

  const [formData,formDataHandler]=useState({email:'',password:''});
  const navigate=useNavigate();
  const {setUserData}=useContext(UserContext);

  const dataHandler=(event)=>{
      formDataHandler(
        {
          ...formData,
          [event.target.name]:event.target.value
        }
      )
  }

  const submitHandler=async(event)=>{
    event.preventDefault();
    const {email,password}=formData;

    await axios.post('/users/login',{email,password})
      .then((res)=>{
                    localStorage.setItem('token',res.data.token)
                    setUserData(res.data.user)
                    navigate('/')})
      .catch((err)=>console.error('Error:', err?.response?.data || err));
  }

  return (
    <div className=' bg-[#0f1725] flex justify-center items-center w-screen h-screen'>
      <form onSubmit={submitHandler} className=' bg-[#1f2936] w-[450px] text-white flex flex-col p-8 rounded-[7px] gap-4'>
        <div>
          <h1 className=' font-bold text-[27px]'>Login</h1>
        </div>
        <div className='flex flex-col gap-4'>
          <label className='gap-1 flex flex-col'>
            <p className='font-bold text-[#838d9a]'>Email</p>
            <input className='bg-[#374151] w-full h-12 rounded-md px-3 text-[16px]' 
                    name='email'
                    placeholder='Enter your email' 
                    type='email'  
                    required
                    onChange={dataHandler}
                   />
          </label>
          <label className='gap-1 flex flex-col'>
            <p className='font-bold text-[#838d9a]'>Password</p>
            <input className='bg-[#374151] w-full h-12 rounded-md px-3 text-[16px]'
                    name='password'
                    placeholder='Enter your password' 
                    type='password'
                    onChange={dataHandler}
                    required
                    />
          </label>
          <button type='submit' className='mt-1 flex w-full h-12 items-center justify-center rounded-md bg-blue-500'>Login</button>
          <div>
            <span>Don't have an account? <Link to='/register' className=' text-blue-500'>Create one</Link> </span>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login