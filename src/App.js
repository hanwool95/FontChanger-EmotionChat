import './App.css';
import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'

const socket = io.connect('ws://127.0.0.1:3737');

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

        let api_body = new FormData()
        api_body.append("api_key", process.env.REACT_APP_KEY)
        api_body.append("api_secret", process.env.REACT_APP_SECRETE)
        // api_body.append("image_url", "https://avatars.githubusercontent.com/u/77750865?v=4")
        api_body.append("image_base64", "data:image/jpeg;base64,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")
        api_body.append("return_attributes", "emotion")
        for (var [key, value] of api_body.entries()) {
            console.log(key, value);
        }

        fetch("/image_api/facepp/v3/detect", {
          api_body,
          headers: {
            "Content-Type": "multipart/form-data"
          },
          method: "POST"
        }).then((response) => response.json()).then((data) =>
                        console.log(data));
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
