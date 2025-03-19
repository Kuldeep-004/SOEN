import React,{useState,useEffect,useContext,useRef} from 'react'
import { useLocation } from 'react-router-dom';
import axios from '../config/axios.jsx'
import { initializeSocket,sendMessage,receiveMessage } from '../config/socket.jsx';
import {UserContext} from '../context/user.context.jsx'
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.jsx'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)
  React.useEffect(() => {
      if (ref.current && props.className?.includes('lang-') && window.hljs) {
          window.hljs.highlightElement(ref.current)

          ref.current.removeAttribute('data-highlighted')
      }
  }, [ props.className, props.children ])

  return <code {...props} ref={ref} />
}

const Project = () => {

    const [isSidePanelOpen,setIsSidePanelOpen]=useState(false);
    const location=useLocation(); 
    const project=location.state.project;
    const [users,setUsers]=useState([]);
    const [userModal,setUserModal]=useState(false);
    const [selectedEmail,setSelectedEmail]=useState([]);
    const [message,setMessage]=useState("");
    const {user}=useContext(UserContext);
    const [collaborators,setCollaborators]=useState([]);
    const [messages,setMessages]=useState([]);
    const [currentFile,setCurrentFile]=useState(null);
    const [fileTree,setFileTree]=useState({});
    const [ webContainer, setWebContainer ] = useState(null)
    const [ iframeUrl, setIframeUrl ] = useState(null)
    const [ runProcess, setRunProcess ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])
    const messageBox=useRef(null);

    const toggleSelection = (id) => {
      setSelectedEmail((prev) =>
        prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id.toString()]
      );
    };

    const submit=()=>{
      const projectId=location.state.project._id.toString();
      axios.put('/projects/add-user',{
        projectId:projectId,
        users:selectedEmail,
      })
      .then((res)=>console.log(res))
      .catch((err)=>console.log(err))
      setUserModal(false)
    }

    function saveFileTree(ft) {
      axios.put('/projects/update-file-tree', {
          projectId: project._id,
          fileTree: ft
      }).then(res => {
          console.log(res.data)
      }).catch(err => {
          console.log(err)
      })
    }
    
    const send=()=>{
      sendMessage({ 
        eventName: 'project-message',
        data: { 
            message, 
            sender: user
        }
    });
      setMessages(prevMessage=>[...prevMessage,{sender:user,message}]);
      setMessage("");
      scrollToBottom();
    }

    function WriteAiMessage(message) {

      const messageObject = JSON.parse(message);

      return (
          <div
              className='overflow-auto w-full bg-slate-950 text-white rounded-sm p-1'
          >
              <Markdown
                  children={messageObject.text}
                  options={{
                      overrides: {
                          code: SyntaxHighlightedCode,
                      },
                  }}
              />
          </div>)
    }

    useEffect(()=>{
      initializeSocket(project._id);

      if (!webContainer) {
        getWebContainer().then(container => {
            setWebContainer(container)
        })
      }

      receiveMessage('project-message', data => {

        console.log(data)
        
        if (data.sender._id === 'ai') {


            const message = JSON.parse(data.message)

            console.log(message)

            webContainer?.mount(message.fileTree)

            if (message.fileTree) {
                setFileTree(message.fileTree || {})
            }
            setMessages(prevMessages => [ ...prevMessages, data ]) // Update messages state
        } else {


            setMessages(prevMessages => [ ...prevMessages, data ]) // Update messages state
        }
      })

      axios.get('/users/all')
        .then((res)=>{
          setUsers(res.data.users);
        })
        .catch((err)=>{
          console.log(err)
        })

      axios.get(`/projects/get-project/${project._id}`)
      .then((res)=>{
        setCollaborators(res.data.project.users);
      })
      .catch((err)=>console.log(err));

      },[project._id,webContainer]);

      function scrollToBottom(){
        messageBox.current.scrollTop=messageBox.current.scrollHeight;
      }

      
  return (
    <main className='h-screen w-screen flex'>


      <section className='relative left flex flex-col h-screen min-w-[26rem] bg-slate-300'>

        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100'>
          <button className='flex gap-2 justify-center items-center' onClick={()=>setUserModal(true)}>
            <i className="ri-add-fill mr-1 text-2xl"></i>
            <p>Add Collaborators</p>
          </button>
          <button className='p-2 rounded-md text-xl' 
                  onClick={()=>setIsSidePanelOpen(!isSidePanelOpen)}>
                  <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="pt-1 pb-1 justify-between flex flex-col h-[94.4%] relative">
          <div ref={messageBox} className="p-1 flex flex-col gap-1 overflow-auto scrollbar-hide">
            {messages.map((msg, index) => (
                <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-[350px]' : 'max-w-[350px]'} ${msg.sender._id === user._id.toString() && 'ml-auto'}  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                  <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                  <div className='text-sm'>
                      {msg.sender._id === 'ai' ?
                      WriteAiMessage(msg.message)
                      : <div className='w-full break-words whitespace-pre-wrap text-black rounded-sm p-1'>{msg.message}</div>}
                  </div>
                </div>
            ))}
          </div>
          <div className='flex w-full'>
            <input className='px-2 border-none w-full outline-none bg-white' 
                   type='text' 
                   placeholder='Enter Message'
                   value={message}
                   onChange={(e)=>setMessage(e.target.value)}
                   />
            <button onClick={send} className='flex justify-center items-center p-0 px-1 m-0 bg-slate-900 text-white'>
              <i className=" h-[43px] w-[50px] text-xl ri-send-plane-fill flex justify-center items-center "></i>
            </button>
          </div>
        </div>

        <div className={` flex flex-col gap-2 w-full h-full bg-slate-50 absolute transition-all ${isSidePanelOpen?'-translate-x-0':'-translate-x-full'} top-0`}>

          <header className='flex justify-end p-2 px-3 items-center bg-slate-200'>
            <button onClick={()=>setIsSidePanelOpen(!isSidePanelOpen)} className='p-1 text-3xl'>
              <i className='ri-close-fill'></i>
            </button>           
          </header>

          
          {
            collaborators.map((collab)=>(
              <div className='flex items-center gap-2 cursor-pointer hover:bg-slate-200 p-2 m-0' key={collab._id}>
                <div className='aspect-square rounded-full p-2 bg-slate-600 w-8 h-8 flex items-center text-medium text-white justify-center '>
                  <i className="ri-user-fill"></i>
                </div>
                <h1 className=' font-medium text-lg'>{collab.email}</h1>
              </div>
            ))
          }
        </div>
 
      </section>

      <section className="right  bg-red-50 flex-grow h-full flex">

                <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
                    <div className="file-tree w-full">
                        {
                            Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                                    }}
                                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                    <p
                                        className='font-semibold text-lg'
                                    >{file}</p>
                                </button>))

                        }
                    </div>

                </div>


                <div className="code-editor flex flex-col flex-grow h-full shrink">

                    <div className="top flex justify-between w-full">

                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                        <p
                                            className='font-semibold text-lg'
                                        >{file}</p>
                                    </button>
                                ))
                            }
                        </div>

                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    await webContainer.mount(fileTree)


                                    const installProcess = await webContainer.spawn("npm", [ "install" ])



                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })

                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>


                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>

                {iframeUrl && webContainer &&
                    (<div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                            <input type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
                        </div>
                        <iframe src={iframeUrl} title="Project Preview" className="w-full h-full"></iframe>
                    </div>)
                }


            </section>

      {userModal &&(
            <div className='fixed flex inset-0 bg-black/60 items-center justify-center'>
              <div className='flex bg-white flex-col justify-center p-3 pl-3 rounded-md gap-4'>
                <div className='flex justify-between w-72 items-center'>
                  <h1 className=' text-lg font-semibold tracking-tighter'>Select User</h1>
                  <i className="ri-close-fill text-lg font-semibold cursor-pointer" onClick={()=>setUserModal(false)}></i>
                </div>
                <div className='max-h-[20rem] max-w-[17.9rem] flex flex-col overflow-scroll'>
                  {users.map((user)=>(
                    <button key={user._id} 
                            className={`w-full p-2 flex gap-2 items-center rounded-md hover:bg-slate-200 ${selectedEmail.includes(user._id)?'bg-slate-200':'' }`}
                            onClick={()=>toggleSelection(user._id)}
                    >
                      <div className='aspect-square rounded-full p-2 bg-slate-600 w-8 h-8 flex items-center text-medium text-white justify-center '>
                        <i className="ri-user-fill"></i>
                      </div>
                      <div className='font-medium'>{user.email}</div>
                    </button>
                  ))}
                </div>
                <div className='flex justify-center items-center'>
                  <button className=' bg-blue-600 text-white rounded-md pl-3 p-2 font-medium' 
                    onClick={submit}>
                      Add Collaborators
                  </button>
                </div>
              </div>
            </div>
      
      )}

    </main>
  )
}

export default Project