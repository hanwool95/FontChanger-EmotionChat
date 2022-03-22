import './App.css';
import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'

const socket = io.connect('ws://127.0.0.1:3737');



function App() {

    // useState를 활용하면 class 없이 상태와 set 선언 가능.
    const [state, setState] = useState({message:'', name:''})
    const [chat,setChat] = useState([])

    useEffect(() =>{
        socket.on('clientReceiver', ({name, message})=>{
            setChat([...chat,{name, message}])
            console.log(chat)
            return () => socket.disconnect()
        })
    }, [ chat ])
//
    // 텍스트 변환시 상태 변환.
    const onTextChange = e =>{
        setState({...state, [e.target.name]: e.target.value})
    }
    const onMessageSubmit =(e)=>{
        e.preventDefault()
        const {name, message} = state
        socket.emit('serverReceiver', {name, message})
        //초기화
        setState({message : '', name})
    }

    const renderChat = () =>{
        return chat.map(({name, message}, index)=>(
            <div key={index}>
                <h3>{name}:<span>{message}</span></h3>
            </div>
        ))
    }

    return (
        <div className='card'>
            <form onSubmit={onMessageSubmit}>
                <h1>Message</h1>
                <div className="name-field">
                    <TextField
                        name ="name"
                        onChange={e=> onTextChange(e)}
                        value={state.name}
                        label="Name"/>
                </div>
                <div >
                    <TextField
                        name ="message"
                        onChange={e=> onTextChange(e)}
                        value={state.message}
                        id="outlined-multiline-static"
                        variant="outlined"
                        label="Message"/>
                </div>
                <button>Send Message</button>
            </form>
            <div className="render-chat">
                <h1>Chat log</h1>
                {renderChat()}
            </div>
        </div>
    );
}



export default App;
