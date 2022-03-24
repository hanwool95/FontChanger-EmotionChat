import './App.css';
import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'

const socket = io.connect('ws://127.0.0.1:3737');

let api_keys = "api_key="+process.env.REACT_APP_KEY+"&api_secret="+process.env.REACT_APP_SECRETE

function App() {

    // useState를 활용하면 class 없이 상태와 set 선언 가능.
    const [state, setState] = useState({message:'', name:'', emotion:''})
    const [chat,setChat] = useState([])

    useEffect(() =>{
        socket.on('clientReceiver', ({name, message, emotion})=>{
            setChat([...chat,{name, message, emotion}])
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
        let {name, message, emotion} = state

        fetch("/image_api/facepp/v3/detect", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
            body: api_keys+"&image_url=https://avatars.githubusercontent.com/u/77750865?v=4" +
                "&return_attributes=emotion"
        }).then((response) => response.json()).then((data) =>
                        console.log(data.faces[0].attributes.emotion));

        // 실험 끝나면 socket emit을 promise 안에 넣어야 할 듯.
        socket.emit('serverReceiver', {name, message, emotion})
        //초기화
        setState({message : '', name})
    }

    const renderChat = () =>{
        return chat.map(({name, message, emotion}, index)=>(
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
