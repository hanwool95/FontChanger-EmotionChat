import './App.css';
import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'

import FontChanger from "./FontChanger";

const socket = io.connect('ws://127.0.0.1:3737');

let run_video_camera = () => {
    let video = document.querySelector("#video");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }
    return video
}

let capture_video = (video) => {
    let canvas = document.querySelector("#canvas");
    canvas.getContext('2d').drawImage(video, 0, 0, 200, 150);
   	let image_data_url = canvas.toDataURL('image/jpeg');
    return image_data_url
}

function App() {
    // useState를 활용하면 class 없이 상태와 set 선언 가능.
    const [state, setState] = useState({message:'', name:''})
    const [fontName, setFontName] = useState('Nanum Gothic')
    const [emotionDict, setEmotionDict] = useState('')
    const [chat,setChat] = useState([])

    let video

    useEffect(() =>{
        socket.on('clientReceiver', ({name, message, emotion, font})=>{
            setChat([...chat,{name, message, emotion, font}])
            return () => socket.disconnect()
        })
    }, [ chat ])

    const activateVideo = () => {
        video = run_video_camera()
    }

    const activateFont = () => {
        video = run_video_camera()

        const captured_img = capture_video(video)
        let splited_base64 = captured_img.split(",")

        let api_body = new FormData()
         api_body.append("api_key", process.env.REACT_APP_KEY)
         api_body.append("api_secret", process.env.REACT_APP_SECRETE)
         api_body.append("image_base64", splited_base64)
         api_body.append("return_attributes", "emotion")

        let emotion
        let font = fontName

        fetch("/image_api/facepp/v3/detect",
            {
            body: api_body,
            method: "POST",
        })
            .then((response) =>
                response.json()).then((data) =>
        {
            console.log(data)
            emotion=JSON.stringify(data.faces[0].attributes.emotion)
            font = FontChanger.cacluateEmotion(emotion)
        }).then(() =>{
            console.log("setting Font "+font)
            setFontName(font)
            setEmotionDict(emotion)
        }
        )

    }

    // 텍스트 변환시 상태 변환.
    const onTextChange = e =>{
        setState({...state, [e.target.name]: e.target.value})
    }
    const onMessageSubmit =(e)=>{
        e.preventDefault()
        let {name, message} = state
        let emotion = emotionDict
        let font = fontName

        socket.emit('serverReceiver', {name, message, emotion, font})

        //초기화
        setState({message : '', name})
    }

    const renderFont = () => {
        let message = state['message']
        return <div>
            <span style={{fontFamily:fontName}}>{message}</span>
        </div>
    }

    const renderChat = () =>{
        return chat.map(({name, message, emotion, font}, index)=>(
            <div key={index}>
                <h3>{name}:<span style={{fontFamily:font}}>{message}</span></h3>
                {/*<h5>{emotion}</h5>*/}
            </div>
        ))
    }

    return (
        <div className='card'>
            <div className='form'>
                <button onClick={activateVideo}>
                비디오 키기
                </button>
                <h1>Message</h1>
                <form onSubmit={onMessageSubmit}>
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
                    <div>
                        {renderFont()}
                    </div>
                    <button onClick={activateFont} type="button"> 폰트 바꾸기 </button>
                        <button type="submit">전송</button>
                </form>
            </div>
            <div className="render-chat">
                <h1>Chat log</h1>
                {renderChat()}
            </div>
        <div>
            <video
                    id ="video"
                    width = "200"
                    hegith = "150"
                    autoPlay
                ></video>
            <div id="capturePicture">
                <canvas
                    id="canvas"
                    width = "200"
                    hegith = "150"
                    ></canvas>
            </div>
        </div>
        </div>
    );
}



export default App;
